<template>
  <q-card padding style="width: 450px; max-width: 450px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6"> Add New City </span>
    </q-card-section>
    <q-card-section class="row q-py-sm">
      <div class="col-12 q-mb-xs">Country</div>
      <q-select
        v-model="selectCountry"
        style="width: 80%"
        label="Select country"
        outlined
        dense
        lazy-rules
        option-value="id"
        option-label="description"
        :disable="selectCountry != null"
        :options="countryList"
        :rules="[(v) => !!v || 'Profile cannot be empty']"
      />
    </q-card-section>
    <q-card-section class="row q-py-sm q-mb-md">
      <div class="col-12 q-mb-xs">State</div>
      <q-select
        v-model="selectedState"
        style="width: 80%"
        label="Select State"
        outlined
        dense
        lazy-rules
        option-value="value"
        option-label="label"
        :disable="!selectCountry"
        :options="stateOptions"
        :rules="[(v) => !!v || 'Profile cannot be empty']"
      />
    </q-card-section>
    <q-card-section class="row col-12">
      <div class="q-pr-md col-6" v-close-popup>
        <q-btn
          label="Cancel"
          text-color="grey-8"
          outline
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="$emit('close')"
        />
      </div>
      <div class="q-pl-md col-6">
        <q-btn
          label="Save"
          color="primary"
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="addState()"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { allStates } from 'treeGQL';
export default {
  components: {},
  props: ['country'],
  data() {
    return {
      selectedState: null,
      selectCountry: null,
      countryList: [
        {
          id: 193,
          description: 'Singapore'
        },
        {
          id: 127,
          description: 'Malaysia'
        }
      ],
      stateOptions: null
    };
  },
  mounted() {
    this.selectCountry = this.country;
  },
  watch: {
    selectCountry(val) {
      this.getStates(val.id);
    }
  },
  methods: {
    addState() {
      if (!this.selectedState) return;
      this.$emit('addState', {
        country: this.selectCountry.description,
        stateId: this.selectedState.value,
        stateLabel: this.selectedState.label,
        active: true
      });
    },
    async getStates(country_id) {
      this.$apollo
        .query({
          query: allStates,
          variables: {
            country_id: country_id
          }
        })
        .then((data) => {
          this.stateOptions = data.data.allStates.map((state) => {
            return {
              value: state.id,
              label: state.name
            };
          });
        });
    }
  }
};
</script>
<style scoped></style>
