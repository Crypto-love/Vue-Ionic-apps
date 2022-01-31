<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Peppol Settings</div>
          <div>We use storecove as a service for peppol</div>
        </div>
      </div>
      <div class="header-right">&nbsp;</div>
    </div>
    <div class="content">
      <connect-peppol-page v-if="!legalEntityId" @on-finish="getData" />
      <div class="row q-col-gutter-sm" v-else>
        <div class="col-8">
          <q-list bordered padding>
            <q-item-label header>Legal Entity Information</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">Legal Entity ID</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.id }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">Party Name</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.party_name }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">Country</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.country }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">City</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.city }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">County</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.county || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">Address</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.line1 }}</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.line2 || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label class="text-body1">Zip code</q-item-label>
                <q-item-label class="">{{ legalEntityInfo.zip || '-' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-4">
          <q-list bordered padding>
            <q-item-label header>Your Peppol Identifier</q-item-label>
            <q-item v-for="val in legalEntityInfo.peppol_identifiers" :key="val.identifier">
              <q-item-section>
                <q-item-label class="text-body1">{{ val.identifier }}</q-item-label>
                <q-item-label class="text-caption">Scheme: {{ val.scheme }}</q-item-label>
                <q-item-label class="text-caption">{{ sendOnly }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script>
import { Api, Notice } from 'services';
import { xero_login_url } from 'src/config';
import ConnectPeppolPage from './peppol/ConnectPeppolPage';
import { store } from 'quasar/wrappers';

export default {
  components: {
    ConnectPeppolPage
  },
  data() {
    return {
      legalEntityId: null,
      legalEntityInfo: null,
      sendOnly: null
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

        const res = await this.getLegalEntityId();
        if (res) {
          const { legalEntityId, peppolId, sendOnly } = res;
          const storecoveData = await this.getStorecoveData(legalEntityId);
          this.legalEntityId = legalEntityId;
          this.legalEntityInfo = storecoveData[0];
          this.sendOnly = sendOnly === 1 ? 'Send Only' : 'Send & Receive';
        }
      } catch (error) {
        this.$notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async getLegalEntityId() {
      const res = await this.$api.get(
        'tenants_integration_storecove',
        `tenant_id = ${this.credentials.tenant_id}`
      );
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) return null;
      return {
        legalEntityId: res.data[0].legal_entity_id,
        peppolId: res.data[0].peppol_id,
        sendOnly: res.data[0].send_only
      };
    },
    async getStorecoveData(legalEntityId) {
      const res = await this.$api.get(`sc_legal_entities/${legalEntityId}`);
      if (!res.status) throw new Error(res.messaage);
      return res.data;
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
