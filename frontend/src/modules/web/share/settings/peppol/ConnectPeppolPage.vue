<template>
  <div class="row">
    <div class="col-sm-9 col-md-9 col-xs-12">
      <q-btn color="blue" label="Connect to Storecove" @click="showForm = true" />
      <q-dialog v-model="showForm">
        <connect-form @on-submit="onSubmit" />
      </q-dialog>
    </div>
  </div>
</template>

<script>
import ConnectForm from './ConnectForm';

export default {
  components: {
    ConnectForm
  },
  data() {
    return {
      showForm: false
    };
  },
  computed: {
    credentials() {
      return this.$store.state;
    }
  },
  methods: {
    /**
     * 0) Preflight peppolIdentifier
     * 1) Submit legal entity
     * 2) Submit Peppol Id
     * 3) Save to table 'tenants_integration_storecove'
     * 4) If any of previous step failed, then delete the legal entity
     */
    async onSubmit({ legalEntity, peppolIdentifier, peppolSchemeId }) {
      let legalEntityId;
      let isSendOnly = false;

      try {
        this.$q.loading.show({ message: 'Please wait...' });

        /**
         * Preflight
         * If the UEN already registered in Peppol Network, it means that they are not using Storecove to register their UEN
         * So they can only send the invoice. But can't receive it
         */
        isSendOnly = await this.isPeppolIdRegistered(peppolIdentifier);

        /** Create legal entity */
        const newLegalEntity = await this.submitLegalEntity(legalEntity, isSendOnly);
        legalEntityId = newLegalEntity.id;

        /** Submit Peppol Identifier for this legal entity */
        const newPeppolId = await this.submitPeppolIdentifier(legalEntityId, peppolIdentifier, isSendOnly);

        /** Save to 'tenants_integration_storecove' */
        await this.saveToDb(legalEntityId, newPeppolId.identifier, peppolSchemeId, isSendOnly);

        /** Emit event to parent component */
        this.$emit('on-finish');
      } catch (error) {
        this.$notice.fail(error.message);

        if (legalEntityId) {
          // Delete Storecove legal entity
          await this.deleteLegalEntityByID(legalEntityId, isSendOnly);
        }
      } finally {
        this.$q.loading.hide();
      }
    },

    async isPeppolIdRegistered({ scheme, identifier }) {
      const payload = {
        publicIdentifiers: [
          {
            scheme,
            id: identifier
          }
        ]
      };
      const res = await this.$api.add('sc_invoice_submissions/preflight', payload);
      if (!res.status) throw new Error(`There's an error when preflighting the UEN: ${res.message}`);
      if (res.data.length === 0) throw new Error("There's an error when preflighting the UEN");

      return res.data[0].code === 'ok';
    },

    async submitLegalEntity(legalEntity, isSendOnly) {
      const res = await this.$api.raw({
        method: 'add',
        name: 'sc_legal_entities',
        send_only: isSendOnly,
        value: legalEntity
      });
      if (!res.status) throw new Error(`Error when creating legal entity: ${res.message}`);
      return res.data[0];
    },

    async submitPeppolIdentifier(legalEntityId, peppolIdentifier, isSendOnly) {
      // const res = await this.$api.add(
      //   `sc_legal_entities/${legalEntityId}/peppol_identifiers`,
      //   peppolIdentifier
      // );
      const res = await this.$api.raw({
        method: 'add',
        name: `sc_legal_entities/${legalEntityId}/peppol_identifiers`,
        send_only: isSendOnly,
        value: peppolIdentifier
      });
      if (!res.status) throw new Error(`Error when creating Peppol Identifier: ${res.message}`);
      return res.data[0];
    },

    async deleteLegalEntityByID(legalEntityId, isSendOnly) {
      // const res = await this.$api.delete(`sc_legal_entities/${legalEntityId}`);
      const res = await this.$api.raw({
        method: 'delete',
        name: `sc_legal_entities/${legalEntityId}`,
        send_only: isSendOnly
      });
      if (!res.status) throw new Error(`Error when deleting Legal Entity: ${res.message}`);
      return res.data[0];
    },

    async saveToDb(legalEntityId, peppolId, peppolSchemeId, isSendOnly) {
      const payload = {
        tenant_id: this.credentials.tenant_id,
        legal_entity_id: legalEntityId,
        peppol_id: peppolId,
        peppol_scheme_id: peppolSchemeId,
        send_only: isSendOnly ? 1 : 0,
        created_by: this.credentials.id
      };
      const res = await this.$api.add('tenants_integration_storecove', payload);
      if (!res.status) throw new Error(`Error when saving data to DB: ${res.message}`);
      return res.data[0];
    }
  }
};
</script>
