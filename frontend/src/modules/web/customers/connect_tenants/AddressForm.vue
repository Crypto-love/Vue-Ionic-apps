<template>
  <form-card
    :title="item ? 'Edit Customer Address' : 'Add Customer Address'"
    scroll-area-height="380"
    class="address-form"
    style="height: 540px; width: 480px; min-width: unset; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="addressForm">
      <div class="row justify-between q-col-gutter-md">
        <q-select
          class="col-xs-12"
          v-model="formData.country_id"
          :options="countriesFiltered"
          label="Country *"
          lazy-rules
          :rules="[(val) => !!val || 'Please choose something']"
          option-label="description"
          option-value="id"
          map-options
          emit-value
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          @filter="filterCountry"
          dense
        />
        <q-input
          v-model="formData.city"
          label="City *"
          lazy-rules
          :rules="[(val) => !!val || 'Please type something']"
          class="col-xs-6"
          dense
        />
        <q-input
          v-model="formData.state"
          label="State *"
          lazy-rules
          :rules="[(val) => !!val || 'Please type something']"
          class="col-xs-6"
          dense
        />
        <q-input
          v-model="formData.road"
          label="Street *"
          lazy-rules
          :rules="[(val) => !!val || 'Please type something']"
          dense
          class="col-xs-12"
        />
        <q-input v-model="formData.building" label="Building Name" class="col-xs-6" dense />
        <div class="row col-xs-6 justify-between">
          <q-input v-model="formData.floor_number" label="Floor umber" class="col-xs-5" dense stack-label />
          <div class="col-xs-1 text-center text-h6 q-pt-sm">-</div>
          <q-input v-model="formData.unit" label="Unit number" class="col-xs-5" dense stack-label />
        </div>
        <q-input v-model="formData.stall" label="Stall" lazy-rules :rules="[]" dense class="col-xs-6" />
        <q-input
          v-model="formData.postal_code"
          label="Postal Code *"
          lazy-rules
          type="number"
          :rules="numericRules"
          class="col-xs-6"
          dense
        />
        <div class="place-auto-complete">
          <div></div>
          <gmap-autocomplete placeholder="Enter address" class="introInput" @place_changed="setPlace" />
        </div>
        <q-toggle
          v-model="formData.is_default"
          :false-value="0"
          :true-value="1"
          label="Set as Default"
          class="col-xs-12"
        />
        <q-toggle
          v-model="formData.active"
          :false-value="0"
          :true-value="1"
          label="Active"
          class="col-xs-12"
        />
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn flat label="Save" type="submit" form="addressForm" class="btn-save" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import AddressTable from './AddressTable.vue';
import BranchTable from './BranchTable.vue';
import { isEmailValid, isNumeric } from 'services';

export default {
  components: {
    FormCard,
    AddressTable,
    BranchTable
  },
  props: {
    custId: {
      type: Number,
      required: true
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
      submitLoading: false,
      deliveryAddressAsBillingAddress: false,
      countries: [],
      countriesFiltered: [],
      addressTypes: [],
      selectedAddressType: null,
      sameAsBilling: false,
      sameAsDelivery: false,
      checkAddressLoading: false,
      checkDeliveryAddressLoading: false,
      billingAddress: null,
      deliveryAddress: null,
      formData: {
        id: undefined,
        customer_id: undefined,
        floor_number: undefined,
        street_number: undefined,
        road: undefined,
        building: undefined,
        unit: undefined,
        stall: undefined,
        city: undefined,
        state: undefined,
        postal_code: undefined,
        country_id: undefined,
        address_type_id: 1,
        latlng: null,
        active: 1,
        is_default: 0
      },
      numericRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ]
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },
  watch: {
    'formData.country_id'(v) {
      if (v === 193) {
        this.formData.state = 'Singapore';
        this.formData.city = 'Singapore';
      }
    },
    'formData.state': function (val) {
      this.formData.state = val ? val.removeSpecialCharacter() : '';
    },
    'formData.city': function (val) {
      this.formData.city = val ? val.removeSpecialCharacter() : '';
    },
    'formData.building': function (val) {
      this.formData.building = val ? val.removeSpecialCharacter() : '';
    },
    'formData.road': function (val) {
      this.formData.road = val ? val.removeSpecialCharacter() : '';
    },
    'formData.unit': function (val) {
      this.formData.unit = val ? val.removeSpecialCharacter() : '';
    },
    'formData.active'(v) {
      if (v === 0) {
        this.formData.is_default = 0;
      }
    }
  },
  mounted() {
    if (this.isEditMode) {
      /** Separate unnecessary keys to prevent submit error */
      const { country, address_type, ...filteredFormData } = this.item;
      this.formData = { ...filteredFormData };
    }
    this.getCountries();
    this.geolocate();
  },
  methods: {
    setPlace(place) {
      this.currentPlace = place;
      const latlgn = {
        lat: this.currentPlace.geometry.location.lat(),
        lng: this.currentPlace.geometry.location.lng()
      };
      this.formData.latlng = latlgn;
    },
    addMarker() {
      if (this.currentPlace) {
        const marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng()
        };
        this.markers.push({ position: marker });
        this.places.push(this.currentPlace);
        this.center = marker;
        this.currentPlace = null;
      }
    },
    geolocate: function () {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    },
    async getCountries() {
      const res = await this.$api.get('countries', 'active = 1');
      this.countries = res.data;
      this.countriesFiltered = res.data;
    },
    onSubmit() {
      this.formData.customer_id = this.custId;
      if (this.isEditMode) {
        this.$emit('edit-complete', this.formData, this.formData.id);
      } else {
        this.$emit('add-complete', this.formData);
      }
    },
    filterCountry(val, update, abort) {
      if (val === '') {
        update(() => {
          this.countriesFiltered = this.countries;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.countriesFiltered = this.countries.filter(
          (v) => v.description.toLowerCase().indexOf(needle) > -1
        );
      });
    }
  }
};
</script>
<style scoped>
.form-group {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.card-action {
  display: block;
  width: 100%;
  position: relative;
  text-align: right;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
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
.q-field--with-bottom {
  padding-bottom: 15px;
}

.place-auto-complete {
  width: 100%;
}

.introInput {
  width: 100%;
}

.introInput:focus {
  border-color: #04565a;
}
</style>
