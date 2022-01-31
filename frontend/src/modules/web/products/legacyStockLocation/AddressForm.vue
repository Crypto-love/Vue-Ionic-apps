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
          v-model="formData.address_type_id"
          :options="addressTypes"
          label="Address Type *"
          lazy-rules
          :rules="[(val) => !!val || 'Please choose something']"
          option-label="name"
          option-value="id"
          map-options
          emit-value
          dense
        />
        <div class="col-xs-12" v-if="formData.address_type_id === 1">
          <q-checkbox
            v-model="sameAsBilling"
            label="Same as billing address (if any)"
            color="primary"
            dense
          />
          <q-spinner class="q-ml-sm" color="primary" size="20px" v-if="checkAddressLoading" />
        </div>
        <div class="col-xs-12" v-else-if="formData.address_type_id === 2 || formData.address_type_id === 3">
          <q-checkbox
            v-model="sameAsDelivery"
            label="Same as delivery address (if any)"
            color="primary"
            dense
          />
          <q-spinner class="q-ml-sm" color="primary" size="20px" v-if="checkAddressLoading" />
        </div>
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
        id: null,
        floor_number: null,
        street_number: null,
        road: null,
        building: null,
        unit: null,
        stall: null,
        city: null,
        state: null,
        postal_code: null,
        country_id: null,
        address_type_id: null,
        active: 1
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
    },
    selectedAddressTypeName() {
      if (this.formData.address_type_id) {
        const at = this.addressTypes.find((v) => v.id === this.formData.address_type_id);
        return at.name;
      }
      return null;
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
    async sameAsBilling(v) {
      if (v) {
        if (!this.billingAddress) {
          await this.getBillingAddress();
        }
        this.setDeliveryAddressAsBillingAddress();
      }
    },
    async sameAsDelivery(v) {
      if (v) {
        if (!this.deliveryAddress) {
          await this.getDeliveryAddress();
        }
        this.setBillingAddressAsDeliveryAddress();
      }
    }
  },
  mounted() {
    if (this.isEditMode) {
      /** Separate unnecessary keys to prevent submit error */
      const { country, address_type, ...filteredFormData } = this.item;
      this.formData = { ...filteredFormData };
    }
    this.getAddressType();
    this.getCountries();
    this.geolocate();
  },
  methods: {
    setPlace(place) {
      this.currentPlace = place;
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
    async getAddressType() {
      const res = await this.$api.get('address_types', 'active = 1');
      this.addressTypes = res.data;
    },
    async getCountries() {
      const res = await this.$api.get('countries', 'active = 1');
      this.countries = res.data;
      this.countriesFiltered = res.data;
    },
    async getBillingAddress() {
      this.checkAddressLoading = true;
      const { data } = await this.$api.get('address', `customer_id = ${this.custId} AND address_type_id = 2`);
      if (data.length > 0) {
        this.billingAddress = data[0];
      }
      this.checkAddressLoading = false;
    },
    async getDeliveryAddress() {
      this.checkAddressLoading = true;
      const { data } = await this.$api.get('address', `customer_id = ${this.custId} AND address_type_id = 1`);
      if (data.length > 0) {
        this.deliveryAddress = data[0];
      }
      this.checkAddressLoading = false;
    },
    setDeliveryAddressAsBillingAddress() {
      if (this.billingAddress) {
        this.formData = {
          ...this.formData,
          floor_number: this.billingAddress.floor_number,
          street_number: this.billingAddress.street_number,
          road: this.billingAddress.road,
          building: this.billingAddress.building,
          unit: this.billingAddress.unit,
          city: this.billingAddress.city,
          state: this.billingAddress.state,
          postal_code: this.billingAddress.postal_code,
          country_id: this.billingAddress.country_id
        };
      }
    },
    setBillingAddressAsDeliveryAddress() {
      if (this.deliveryAddress) {
        this.formData = {
          ...this.formData,
          floor_number: this.deliveryAddress.floor_number,
          street_number: this.deliveryAddress.street_number,
          road: this.deliveryAddress.road,
          building: this.deliveryAddress.building,
          unit: this.deliveryAddress.unit,
          city: this.deliveryAddress.city,
          state: this.deliveryAddress.state,
          postal_code: this.deliveryAddress.postal_code,
          country_id: this.deliveryAddress.country_id
        };
      }
    },
    onSubmit() {
      const payload = {
        ...this.formData,
        address_type: this.selectedAddressTypeName
      };
      if (this.item) {
        this.$emit('edit-complete', payload);
      } else {
        this.$emit('add-complete', payload);
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
</style>
