<template>
  <form-card
    :title="item ? 'Edit Tenant' : 'Add Tenant'"
    style="height: 200px; width: 480px; min-width: unset; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="branchForm">
      <q-select
        v-model="selected"
        :options="custUntaggedFiltered"
        label="Select Tenants *"
        stack-label
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
import FormCard from 'web/share/partial/FormCard.vue';
import AddressTable from './AddressTable.vue';
import BranchTable from './BranchTable.vue';

export default {
  components: {
    FormCard,
    AddressTable,
    BranchTable
  },
  props: {
    item: {
      type: Object,
      default: null
    },
    custId: {
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
  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },
  mounted() {
    if (this.isEditMode) {
      /**
       * Keep in mind that branch_id is the Primary Key of table "branches"
       * And customer_id is the Primary key of table "Customers"
       * So, `this.selected` is referencing table "customers", NOT "branches"
       */
      this.selected = {
        id: this.item.customer_id,
        name: this.item.tenant_name,
        account_number: this.item.account_number,
        active: this.item.active
      };
      this.tenantId = this.item.id;
    }
    this.getCustomerUntagged();
  },
  methods: {
    async getCustomerUntagged() {
      const res = await Api.get('v_tenants');
      this.custUntagged = res.data;
      this.custUntaggedFiltered = res.data;
    },
    async onSubmit() {
      // this.submitLoading = true;

      /**
       * This payload referencing "customers" table
       * Needed to be displayed on BranchTable
       */
      const res = await Api.get('v_customer_branch_details', `id=${this.custId}`);
      const detail = res.data[0];

      const payload = {
        customer_id: detail.id, // remember, this.selected is referencing table "customers"
        tenant_id: this.selected.tenant_id,
        active: detail.active,
        xero_customer_id: detail.xero_id,
        cod: detail.cod,
        alias_name: detail.alias_name,
        credit_term: detail.credit_term,
        payment_type: detail.payment_type,
        delivery_instruction: detail.delivery_instruction,
        delivery_charge: detail.delivery_charge,
        minimum_order: detail.minimum_order
      };

      if (this.isEditMode) {
        this.$emit('edit-complete', payload, this.tenantId);
      } else {
        this.$emit('add-complete', payload);
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
