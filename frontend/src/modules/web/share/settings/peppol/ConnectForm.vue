<template>
  <form-dialog title="Register Legal Entity" class="modal-md">
    <q-form id="myForm" @submit.prevent="onSubmit">
      <div class="row justify-between q-col-gutter-md">
        <div class="col-12">
          <q-input
            v-model="legalEntity.party_name"
            label="Company Name *"
            lazy-rules
            :rules="[(val) => !!val || 'Can\'t be empty']"
            stack-label
          />
        </div>
        <div class="col-12">
          <q-input
            v-model="legalEntity.line1"
            label="Address Line 1 *"
            lazy-rules
            :rules="[(val) => !!val || 'Can\'t be empty']"
            stack-label
          />
        </div>
        <div class="col-12">
          <q-input v-model="legalEntity.line2" label="Address Line 2" stack-label />
        </div>
        <div class="col-12">
          <q-select
            v-model="selectedCountry"
            label="Country *"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredCountries"
            @filter="filterCountries"
            option-label="description"
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => !!val || 'Can\'t be empty']"
            stack-label
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-6">
          <q-input
            v-model="legalEntity.city"
            label="City *"
            lazy-rules
            :rules="[(val) => !!val || 'Can\'t be empty']"
            stack-label
          />
        </div>
        <div class="col-6">
          <q-input v-model="legalEntity.county" label="County" lazy-rules stack-label />
        </div>
        <div class="col-12">
          <q-input
            v-model="legalEntity.zip"
            label="Zip Code *"
            lazy-rules
            :rules="numericRules"
            stack-label
          />
        </div>
        <div class="col-12">
          <q-input
            v-model="legalEntity.purchase_invoice_email_destination"
            label="Email Destination *"
            lazy-rules
            :rules="emailRules"
            stack-label
          />
        </div>
        <div class="col-12">
          <q-select
            v-model="selectedPeppolScheme"
            label="Peppol Scheme *"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredPeppolSchemes"
            @filter="filterPeppolSchemes"
            option-label="name"
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => !!val || 'Can\'t be empty']"
            stack-label
            :hint="!selectedCountry ? 'Please select country first' : ''"
            :loading="loadPeppolSchemes"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12">
          <q-input
            v-model="peppolIdentifier.identifier"
            label="Your Company's UEN*"
            lazy-rules
            :rules="peppolRules"
            stack-label
            :disable="!selectedPeppolScheme"
            :hint="!selectedPeppolScheme ? 'Please select peppol scheme first' : 'Ex: SGUEN201302761R'"
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <div class="q-gutter-x-sm">
        <q-btn color="red" label="Cancel" v-close-popup />
        <q-btn type="submit" color="primary" label="Submit" form="myForm" />
      </div>
    </template>
  </form-dialog>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import { isNumeric, isEmailValid, isPeppolIdentifier } from 'services';
export default {
  components: {
    FormCard,
    FormDialog
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      step: 1,
      countries: [],
      filteredCountries: [],
      selectedCountry: null,
      loadPeppolSchemes: false,
      peppolSchemes: [],
      filteredPeppolSchemes: [],
      selectedPeppolScheme: null,
      legalEntity: {
        party_name: null,
        line1: null,
        line2: null,
        city: null,
        zip: null,
        country: null,
        county: null,
        tenant_id: null,
        public: true,
        purchase_invoice_email_destination: null
      },
      peppolIdentifier: {
        identifier: null,
        scheme: null,
        superscheme: 'iso6523-actorid-upis'
      },
      numericRules: [(val) => !!val || "Can't be empty", (val) => isNumeric(val) || 'Must be numeric'],
      emailRules: [(val) => !!val || "Can't be empty", (val) => isEmailValid(val) || 'Invalid email'],
      peppolRules: [
        (val) => !!val || "Can't be empty",
        (val) => isPeppolIdentifier(val) || 'Invalid peppol identifier'
      ]
    };
  },
  computed: {
    credentials() {
      return this.$store.state;
    },
    isEditMode() {
      return this.item !== null;
    }
  },
  watch: {
    async selectedCountry(v) {
      if (v) {
        this.selectedPeppolScheme = null;
        try {
          this.loadPeppolSchemes = true;
          this.peppolSchemes = await this.getPeppolSchemes(v.id);
          this.filteredPeppolSchemes = [...this.peppolSchemes];

          if (this.peppolSchemes.length === 1) {
            this.selectedPeppolScheme = this.peppolSchemes[0];
          }
        } catch (error) {
          this.$notice.fail(error.message);
        } finally {
          this.loadPeppolSchemes = false;
        }
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.$q.loading.show({ message: 'Loading...' });
      try {
        this.countries = await this.getCountries();
        this.filteredCountries = [...this.countries];
      } catch (error) {
        this.$notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async getCountries() {
      const res = await this.$api.get('countries');
      if (!res.status) throw new Error(res.message);
      return res.data;
    },
    async getPeppolSchemes(countryId) {
      const res = await this.$api.get('peppol_schemes', `country_id = ${countryId}`);
      if (!res.status) throw new Error(res.message);
      return res.data;
    },
    filterCountries(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.filteredCountries = this.countries.filter(
          (v) => v.description.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    filterPeppolSchemes(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.filteredPeppolSchemes = this.peppolSchemes.filter(
          (v) => v.name.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    onSubmit() {
      this.legalEntity.country = this.selectedCountry.name;
      this.legalEntity.tenant_id = this.credentials.tenant_id;

      this.peppolIdentifier.scheme = this.selectedPeppolScheme.name;

      const payload = {
        legalEntity: this.legalEntity,
        peppolIdentifier: this.peppolIdentifier,
        peppolSchemeId: this.selectedPeppolScheme.id
      };

      this.$emit('on-submit', payload);
    }
  }
};
</script>

<style scoped>
.modal-body {
  padding: 0rem !important;
}
.modal-footer {
  padding: 0rem !important;
}
/* .toggle-label {
  color: #131313;
  font-weight: 500;
  display: block;
  text-align: right;
  padding-right: 10px;
}
.field-active {
  text-align: right;
}
.form-label {
  font-weight: 500;
  color: #131313;
}
.q-placeholder::placeholder {
  color: inherit;
  opacity: 0.35 !important;
} */
</style>
