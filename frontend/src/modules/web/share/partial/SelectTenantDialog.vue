<template>
  <form-card title="Choose a Tenant" style="height: 200px">
    <q-form id="myForm" @submit.prevent="onSubmit">
      <q-select
        v-model="selectedTenant"
        outlined
        label="Select Tenant"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="filteredTenants"
        @filter="filterFn"
        lazy-rules
        :rules="[(v) => !!v || 'Please choose Tenant']"
        option-label="tenant"
        map-options
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">No results</q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-form>
    <template v-slot:actions>
      <q-btn v-if="selectedTenantId" flat no-caps label="Cancel" color="grey" v-close-popup />
      <q-btn flat label="Choose" class="btn-save" type="submit" form="myForm" :loading="isLoading" />
    </template>
  </form-card>
</template>

<script>
import { Api, Notice } from 'services';
export default {
  components: {
    FormCard: () => import('./FormCard')
  },
  data() {
    return {
      tenants: [],
      filteredTenants: [],
      selectedTenant: null,
      selectedTenantId: null,
      isLoading: false
    };
  },
  computed: {
    userId() {
      return this.$store.state.id;
    }
  },
  created() {
    this.selectedTenantId = this.$store.state.tenant_id;
    this.getTenants();
  },
  methods: {
    async getTenants() {
      try {
        const res = await Api.get(
          'v_tenants',
          null,
          `name as tenant, tenant_id, id as tenant_customer_id, 
          country,
          country_code,
          country_id,
          currency_code,
          currency_symbol`
        );
        if (!res.status) throw new Error(res.message);
        this.tenants = [...res.data];
        this.filteredTenants = [...res.data];
        this.selectedTenant = this.tenants.find((t) => t.tenant_id == this.selectedTenantId);
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLocaleLowerCase();
        this.filteredTenants = this.tenants.filter((v) => v.tenant.toLocaleLowerCase().indexOf(needle) > -1);
      });
    },

    async onSubmit() {
      // Get xero tenant id
      if (this.isLoading) return;

      this.isLoading = true;
      const { status, message, data } = await this.$api.get(
        'tenants_integration_xero',
        `tenant_id = ${this.selectedTenant.tenant_id}`,
        'xero_tenant_id'
      );
      this.isLoading = false;

      if (status)
        this.$emit('on-submit', {
          country: this.selectedTenant.country,
          country_code: this.selectedTenant.country_code,
          country_id: this.selectedTenant.country_id,
          currency_code: this.selectedTenant.currency_code,
          currency_symbol: this.selectedTenant.currency_symbol,
          tenant: this.selectedTenant.tenant,
          tenant_id: this.selectedTenant.tenant_id,
          tenant_customer_id: this.selectedTenant.tenant_customer_id,
          xero_tenant_id: data && data.length > 0 ? data[0].xero_tenant_id : null
        });
    }
  }
};
</script>
