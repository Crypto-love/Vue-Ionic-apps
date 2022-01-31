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
        <div class="text-weight-medium text-body1">Tenants Information</div>
      </template>

      <template v-slot:top-right>
        <q-btn
          v-if="userTypeId === 1"
          class="q-ml-md"
          size="11px"
          no-caps
          color="primary"
          @click="
            selectedItem = null;
            showForm = true;
          "
          :disable="disabled"
          >Add Tenants</q-btn
        >
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
import MyForm from './TenantForm';
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
      data: [],
      userTypeId: null,
      selectedItem: null,
      columns: [
        {
          name: 'tenant_name',
          label: 'Tenant Name',
          align: 'left',
          field: 'tenant_name',
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
  watch: {
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    custId(v) {
      if (v) {
        this.getData();
      }
    }
  },
  mounted() {
    this.getUserType();
  },
  methods: {
    async getData() {
      const res = await Api.get('v_customer_tenants_detail', `customer_id = ${this.custId}`);
      if (res.data.length > 0) {
        this.data = [...res.data];
      }
    },
    async onAddComplete(newData) {
      try {
        /**
         * This payload for inserting data to table "branches"
         */
        const res = await Api.add('customer_tenants', newData);

        if (res.status) {
          const tenants = await Api.get('v_tenants', `tenant_id = ${newData.tenant_id}`);

          const payload = {
            tenant_name: tenants.data[0].name,
            active: newData.active
          };

          this.data.push(payload);

          this.showForm = false;
          Notice.ok('Tenants updated');
        } else {
          Notice.fail(res.message);
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    async onEditComplete(newData, branchTableId) {
      try {
        /** This is payload for table "branches" */
        const res = await Api.update('customer_tenants', { tenant_id: newData.tenant_id }, branchTableId);
        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async toggleActive(row) {
      /**
       * When we're toggling active status for these branches,
       * we're updating table customers, not branches.
       * active status on table branches is always 1.
       */
      const newVal = row.active === 1 ? 0 : 1;

      try {
        const res = await Api.update('customer_tenants', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getUserType() {
      this.userTypeId = this.$store.state.user_type_id;
    }
  }
};
</script>
