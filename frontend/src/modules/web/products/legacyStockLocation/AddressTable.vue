<template>
  <div>
    <q-table :class="`${disabled && 'light-dimmed'} no-shadow`" :data="data" :columns="columns" dense>
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Address Information</div>
      </template>
      <template v-slot:top-right>
        <div>
          <q-btn
            no-caps
            size="11px"
            color="primary"
            @click="
              selectedItem = null;
              showForm = true;
            "
            :disable="disabled"
            >Add Address</q-btn
          >
        </div>
      </template>
      <template v-slot:body-cell-address="props">
        <q-td :props="props">{{ getAddress(props.row) }}</q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="1"
            :false-value="0"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            class="cursor-pointer"
            size="sm"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm" persistent>
      <my-form
        :item="selectedItem"
        :cust-id="custId"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './AddressForm.vue';
export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    custId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      columns: [
        {
          name: 'address',
          label: 'Address',
          align: 'left',
          field: 'address',
          sortable: true
        },
        {
          name: 'address_type',
          label: 'Address Type',
          align: 'left',
          field: 'address_type',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        },
        {
          name: 'active',
          label: 'Active',
          align: 'left',
          field: 'active',
          sortable: true
        }
      ]
    };
  },
  computed: {
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    }
  },
  methods: {
    async onAddComplete(newData) {
      /**
       * Separate address_type from newData
       * We still need address_type to display it to the table
       * But we don't need it in case when we insert / update to DB
       */
      const { address_type, ...payload } = newData;
      payload.customer_id = this.custId;

      try {
        /** update xero contact address */
        this.updateXeroContactAddress(payload);

        const res = await Api.add('address', payload);
        /** We add address_type again to resData to display it on the table */
        const resData = { ...res.data[0], address_type };
        this.data.push(resData);
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async onEditComplete(newData) {
      const { address_type, ...payload } = newData;
      payload.customer_id = this.custId;

      try {
        /** update xero contact address */
        this.updateXeroContactAddress(payload);

        const res = await Api.update('address', payload, payload.id);
        /** We add address_type again to resData to display it on the table */
        const resData = { ...res.data[0], address_type };
        const idx = this.data.findIndex((v) => v.id === resData.id);
        this.$set(this.data, idx, resData);
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('address', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    getAddress(address) {
      let result = address.road ? address.road : '';

      if (address.building) {
        result = result ? result + ', ' : '';
        result += address.building;
      }

      if (!address.floor_number && address.unit) {
        result = result ? result + ', ' : '';
        result += address.unit;
      } else if (address.floor_number && !address.unit) {
        result = result ? result + ', ' : '';
        result += 'Level ' + address.floor_number;
      } else if (address.floor_number && address.unit) {
        result = result ? result + ', ' : '';
        result += '#' + address.floor_number + '-' + address.unit;
      }

      if (address.stall) {
        result = result ? result + ', ' : '';
        result += address.stall;
      }
      if (address.city) {
        result = result ? result + ', ' : '';
        result += address.city;
      }
      if (address.state) {
        result = result ? result + ', ' : '';
        result += address.state;
      }
      if (address.postal_code) {
        result = result ? result + ', ' : '';
        result += address.postal_code;
      }

      return result;
    },
    async updateXeroContactAddress(data) {
      const res = await Api.get('customers', `id=${this.custId}`);
      if (res.status) {
        let customer = res.data[0];
        const branch = await Api.get('branches', `customer_branch_id=${this.custId}`);
        if (branch.status && branch.data.length <= 0) {
          /* this is parent */
          if (customer.customer_type_id === 2 && customer.xero_id) {
            /** this is customer (buyer) and should have xero_id */
            const xeroPayload = {
              Addresses: [
                {
                  AddressType: data.address_type_id === 1 ? 'STREET' : 'POBOX',
                  AddressLine1: data.road,
                  AddressLine2: data.building,
                  AddressLine3: `#${data.floor_number}-${data.unit}`,
                  City: data.city,
                  Region: data.state,
                  PostalCode: data.postal_code,
                  Country: data.state /** Singapore by default for now */
                }
              ]
            };
            const xeroContactAddress = await Api.update('x_contacts/', xeroPayload, customer.xero_id);
            if (xeroContactAddress.status) {
              Notice.ok('Xero Contact Address Updated');
            } else {
              Notice.fail(xeroContactAddress.message);
            }
          }
        }
      } else {
        Notice.fail(res.message);
      }
    }
  }
};
</script>
