<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="name"
      dense
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">People In Charge</div>
      </template>

      <template v-slot:top-right>
        <q-btn
          no-caps
          class="q-ml-md"
          size="11px"
          color="primary"
          @click="
            selectedItem = null;
            showForm = true;
          "
          :disable="disabled"
          >Add Person</q-btn
        >
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">{{ props.row.first_name }} {{ props.row.last_name }}</q-td>
      </template>
      <template v-slot:body-cell-position="props">
        <q-td :props="props">{{ props.row.position }}</q-td>
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
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="true"
            :false-value="false"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog fixed v-model="showForm" persistent>
      <my-form :item="selectedItem" :keyContactExist="keyContactExist" @submit="onSubmit" />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './PersonForm';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { getPersons, updatePersons } from 'treeGQL';
import { env } from 'src/config';

export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      xeroTenantId: this.$store.state.xero_tenant_id,
      selectedItem: null,
      data: [],
      keyContactExist: false,
      columns: [
        {
          name: 'name',
          label: 'PIC Name',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: 'email',
          sortable: true
        },
        {
          name: 'phone',
          label: 'Phone',
          align: 'left',
          field: 'phone',
          sortable: true
        },
        {
          name: 'position',
          label: 'position',
          align: 'left',
          field: 'position',
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
          align: 'left'
        }
      ]
    };
  },
  computed: {
    isThirdPartyAllowed() {
      return ['production', 'staging', 'testing'].includes(env);
    }
  },
  watch: {
    custId(v) {
      if (v) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      const res = await this.getPersonData(this.custId);
      this.data = [...res];

      this.checkKeyContact();
    },

    checkKeyContact() {
      this.keyContactExist = false;
      for (var person of this.data) {
        if (person.position == 'Key Contact') {
          this.keyContactExist = true;
          break;
        }
      }
    },

    async onSubmit(newData) {
      newData.customer_id = this.custId;

      this.$q.loading.show({
        message: newData.id ? 'Updating PIC...' : 'Creating PIC...'
      });
      const res = await this.updatePersonData(JSON.stringify(newData));
      this.$q.loading.hide();
      if (res) {
        /** update xero contact person */
        if (this.isThirdPartyAllowed && this.xeroTenantId && newData.position === 'Key Contact') {
          this.updateXeroContactPerson(newData);
        }
        /** Add or Update data to table */
        if (res) {
          if (newData.id) {
            const idx = this.data.findIndex((v) => v.id === newData.id);
            this.$set(this.data, idx, res);
          } else {
            this.data.push(res);
          }
        }

        this.showForm = false;
        this.checkKeyContact();
      }
    },

    async toggleActive(row) {
      row.active = !row.active;
      try {
        await this.updatePersonData(JSON.stringify(row));
      } catch (error) {
        Notice.fail(error);
      }
    },
    async updateXeroContactPerson(data) {
      const res = await Api.get(
        'v_customers',
        `id=${this.custId} AND customer_tenant_id = ${this.$store.state.tenant_id}`
      );
      if (!res.status) {
        Notice.fail(res.message);
        return;
      }

      let customer = res.data[0];
      const branch = await Api.get('branches', `customer_branch_id=${this.custId}`);
      if (branch.status && branch.data.length <= 0) {
        /* this is parent */
        if (customer.customer_type_id === 2 && customer.xero_id) {
          /** this is customer (buyer) and should have xero_id */
          const xeroPayload = {
            contacts: [
              {
                contactID: customer.xero_id,
                firstName: data.first_name,
                lastName: data.last_name,
                emailAddress: data.email,
                phones: [
                  {
                    phoneType: 'DEFAULT',
                    phoneNumber: data.phone
                  },
                  {
                    phoneType: 'FAX',
                    phoneNumber: data.fax
                  }
                ]
              }
            ]
          };
          const xeroContactAddress = await Api.xero('updateContact', [customer.xero_id, xeroPayload]);
          if (!xeroContactAddress.status) {
            Notice.fail(xeroContactAddress.message);
            return;
          }

          Notice.ok('Xero Contact Person Updated');
          return;
        }
      }
    },
    async getPersonData(customerId) {
      return await this.$apollo
        .query({
          query: getPersons,
          variables: {
            customerId: customerId
          }
        })
        .then((res) => {
          return res?.data?.getPersons;
        })
        .catch((err) => {
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'failed',
            message: this.$helper.getGraphqlErrorMessage(err),
            buttonText: 'close'
          });
        });
    },
    async updatePersonData(jsonData) {
      return await this.$apollo
        .query({
          query: updatePersons,
          variables: {
            jsonData: jsonData
          }
        })
        .then((res) => {
          return res?.data?.updatePerson;
        })
        .catch((err) => {
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'failed',
            message: this.$helper.getGraphqlErrorMessage(err),
            buttonText: 'close'
          });
        });
    }
  }
};
</script>
