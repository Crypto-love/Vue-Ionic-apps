<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="id"
      dense
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">Tenants Information</div>
      </template>

      <template v-slot:top-right>
        <q-btn
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
            :true-value="true"
            :false-value="false"
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
      <my-form :selected-hub-id="custId" @add-complete="onAddComplete" />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './TenantForm';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { getAllTenantHubs, addCustomerTenant, updateCustomerTenant } from 'treeGQL';

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
          name: 'name',
          label: 'Alias Name',
          align: 'left',
          field: 'name',
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
      let res = [];
      let obj = {
        hubIdList: [this.custId]
      };
      const getTenantHubs = await this.getTenantHubs(obj);
      for (const tenantHub of getTenantHubs.data.getTenantHubs) {
        if (
          res.filter((x) => x.tenant_id === tenantHub.tenant_id && x.customer_id === tenantHub.hub_id)
            .length === 0
        ) {
          res.push({
            id: tenantHub.id,
            customer_id: tenantHub.customer_id,
            tenant_id: tenantHub.tenant_id,
            tenant_name: tenantHub.tenant.tenant.name,
            name: tenantHub.tenant.tenant.alias_name,
            active: tenantHub.active,
            xero_customer_id: tenantHub.xero_customer_id,
            cod: tenantHub.cod,
            credit_term: tenantHub.credit_term,
            payment_type: tenantHub.payment_type,
            delivery_instruction: tenantHub.delivery_instruction,
            delivery_charge: tenantHub.delivery_charge,
            minimum_order: tenantHub.minimum_order,
            commission_rate: tenantHub.commission_rate,
            auto_create_spree: tenantHub.auto_create_spree
          });
        }
      }
      this.data = res;
    },
    async onAddComplete(newData) {
      try {
        const res = await this.updateTenantHubs(newData);
        this.getData();
        if (res?.data?.addCustomerTenant) {
          Notice.ok('Tenants Added');
          this.showForm = false;
          this.getData();
        } else {
          Notice.fail(res.errors.message);
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async toggleActive(row) {
      row.active = !row.active;
      try {
        const res = await this.updateTenantHubs(row, false);
        if (res?.data?.updateCustomerTenant) {
          Notice.ok('Tenants updated');
          this.showForm = false;
        } else {
          Notice.fail(res.message);
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getUserType() {
      this.userTypeId = this.$store.state.user_type_id;
    },
    async getTenantHubs(obj) {
      try {
        return await this.$apollo
          .query({
            query: getAllTenantHubs,
            variables: {
              tenantId: obj.tenantIdList,
              hubId: obj.hubIdList
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async updateTenantHubs(payload, newData = true) {
      try {
        return await this.$apollo
          .mutate({
            mutation: newData ? addCustomerTenant : updateCustomerTenant,
            variables: {
              data: payload
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>
