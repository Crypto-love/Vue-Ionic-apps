<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Xero Settings</div>
        </div>
      </div>
      <div class="header-right">&nbsp;</div>
    </div>
    <div class="content">
      <div class="row">
        <div class="col-sm-8 col-xs-12">
          <div class="form-group row q-mb-md">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Connect to Xero</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-btn
                v-if="credentials.xero_tenant_id === null"
                color="blue"
                label="Click to Connect"
                @click="onClickConnect"
              />
              <q-btn v-else color="blue" :label="`Connected: ${credentials.xero_tenant_id}`" disable />
            </div>
          </div>
          <div class="form-group q-mb-md">
            <div class="form-label col-12">Chart Account to use to record</div>
          </div>
          <div class="form-group row q-mb-sm">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Sales Revenue</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-select
                dense
                outlined
                v-model="sales_revenue"
                :options="filteredAccounts"
                option-value="accountID"
                option-label="name"
                emit-value
                map-options
                use-input
                hide-selected
                fill-input
                input-debounce="500"
                @filter="filterFn"
                :disable="credentials.xero_tenant_id === null"
              ></q-select>
            </div>
          </div>
          <div class="form-group row q-mb-sm">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Cash Payment</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-select
                dense
                outlined
                v-model="cash_payment"
                :disable="credentials.xero_tenant_id === null"
              ></q-select>
            </div>
          </div>
          <div class="form-group row q-mb-sm">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Bank Transfer</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-select
                dense
                outlined
                v-model="bank_transfer"
                :disable="credentials.xero_tenant_id !== null"
              ></q-select>
            </div>
          </div>
          <div class="form-group row q-mb-sm">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Card Payment</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-select
                dense
                outlined
                v-model="card_payment"
                :disable="credentials.xero_tenant_id === null"
              ></q-select>
            </div>
          </div>
          <div class="form-group row q-mb-sm">
            <div class="form-label col-sm-3 col-md-3 col-xs-12">Cheque Payment</div>
            <div class="col-sm-9 col-md-9 col-xs-12">
              <q-select
                dense
                outlined
                v-model="cheque_payment"
                :disable="credentials.xero_tenant_id === null"
              ></q-select>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-9 col-md-9 offset-sm-3 offset-md-3">
              <q-btn color="primary" label="Save" icon="eva-save" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script>
import { Api, Notice } from 'services';
import { xero_login_url } from 'src/config';
export default {
  components: {},
  data() {
    return {
      registrationNo: null,
      model: null,
      sales_revenue: null,
      cash_payment: null,
      bank_transfer: null,
      card_payment: null,
      cheque_payment: null,
      accounts: [],
      filteredAccounts: []
    };
  },
  computed: {
    credentials() {
      return this.$store.state;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.$q.loading.show({ message: 'Please wait...' });
        this.registrationNo = await this.getTenantRegistrationNo();

        const t = this.$route.query.t;
        if (!this.credentials.xero_tenant_id && t) {
          await this.checkXeroTenantId(t);
        }

        if (this.credentials.xero_tenant_id) {
          this.accounts = await this.getXeroAccounts();
          this.filteredAccounts = [...this.accounts];
        }
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    async getTenantRegistrationNo() {
      const res = await Api.get('tenants', `id = ${this.credentials.tenant_id}`);
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) throw new Error('Invalid tenant');
      return res.data[0].registration_number;
    },

    async checkXeroTenantId(t) {
      const res = await Api.get('v_tenant_xeros', `xero_tenant_id = '${t}'`);
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) {
        throw new Error('xero tenant id not recognized');
      }

      const xeroTenantId = res.data[0].xero_tenant_id;
      this.$store.commit('setXeroTenantId', xeroTenantId);
    },

    async getXeroAccounts() {
      const res = await Api.xero('getAccounts');
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) return [];
      return res.data[0].accounts;
    },

    onClickConnect() {
      const userSession = this.credentials.token;
      window.location.replace(xero_login_url + `?t=${userSession}&q=${this.registrationNo}`);
    },

    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.filteredAccounts = this.accounts.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>
<style scoped>
.form-label {
  font-weight: 500;
  padding-top: calc(0.375rem + 1px);
  padding-bottom: calc(0.375rem + 1px);
  margin-bottom: 0;
  font-size: inherit;
  line-height: 1.5;
}
</style>
