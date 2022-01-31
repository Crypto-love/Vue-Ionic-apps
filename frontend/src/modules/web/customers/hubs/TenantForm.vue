<template>
  <form-card title="Add Tenant" style="height: 200px; width: 480px; min-width: unset; overflow: hidden">
    <q-form @submit.prevent="onSubmit" id="branchForm">
      <q-select
        v-model="selected"
        :options="custUntaggedFiltered"
        label="Select Tenants *"
        stack-label
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        @filter="filterFn"
        lazy-rules
        :rules="[(val) => !!val || 'Please choose something']"
        option-label="name"
        option-value="id"
        map-options
      />
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn flat label="Save" class="btn-save" type="submit" form="branchForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import { Api, isEmailValid, isNumeric } from 'services';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import FormCard from 'web/share/partial/FormCard.vue';
import AddressTable from './AddressTable.vue';
import { getAllCustomers } from 'treeGQL';

export default {
  components: {
    FormCard,
    AddressTable
  },
  props: {
    selectedHubId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      custUntagged: [],
      custUntaggedFiltered: [],
      selected: null,
      tenantId: null
    };
  },
  mounted() {
    this.getCustomerUntagged();
  },
  methods: {
    async getCustomerUntagged() {
      const res = await Api.get('v_tenants');
      this.custUntagged = res.data;
      this.custUntaggedFiltered = res.data;
    },
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLocaleLowerCase();
        this.custUntaggedFiltered = this.custUntagged.filter(
          (v) => v.name.toLocaleLowerCase().indexOf(needle) > -1
        );
      });
    },
    async onSubmit() {
      this.submitLoading = true;
      try {
        let obj = {
          tenantIdList: this.selected.tenant_id
        };
        const getAllCustomers = await this.getAllCustomers(obj);
        const tenant = getAllCustomers.data.getAllCustomers[0];

        const payload = {
          customer_id: this.selectedHubId,
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.name,
          name: tenant.alias_name,
          active: tenant.active,
          xero_customer_id: tenant.xero_id,
          cod: tenant.cod,
          credit_term: tenant.credit_term,
          payment_type: tenant.payment_type,
          delivery_instruction: tenant.delivery_instruction,
          delivery_charge: tenant.delivery_charge,
          minimum_order: tenant.minimum_order,
          commission_rate: tenant.tenant.commission_rate
          // auto_create_spree: tenant.auto_create_spree
        };
        this.$emit('add-complete', payload);
      } catch (error) {
        console.log(error.message);
      } finally {
        this.submitLoading = false;
      }

      this.submitLoading = false;
    },
    async getAllCustomers(obj) {
      try {
        return await this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              tenantId: obj.tenantIdList,
              hubId: obj.hubIdList,
              active: true,
              customer_type_id: 3
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
<style scoped>
.card-action {
  display: block;
  width: 100%;
  position: relative;
  text-align: right;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 0.5rem;
}
.btn-save {
  color: #ffffff;
  background: #04565a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-cancel {
  color: #666666;
  background: #e4e4e4;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
</style>
