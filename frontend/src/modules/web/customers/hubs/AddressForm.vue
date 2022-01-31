<template>
  <form-card
    :title="item ? 'Edit Hub Address' : 'Add Hub Address'"
    scroll-area-height="380"
    class="col-xs-12 col-md-12"
    style="height: 500px; max-width: unset; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="addressForm">
      <div class="row col-xs-12 justify-between">
        <div class="col-xs-7">
          <q-select
            outlined
            class="col-xs-6"
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
          <q-select
            outlined
            class="col-xs-6"
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
          <div class="row col-xs-6 justify-between">
            <q-input
              outlined
              v-model="formData.city"
              label="City *"
              lazy-rules
              :rules="[(val) => !!val || 'Please type something']"
              class="col-xs-5"
              dense
            />
            <q-input
              outlined
              v-model="formData.state"
              label="State *"
              lazy-rules
              :rules="[(val) => !!val || 'Please type something']"
              class="col-xs-5"
              dense
            />
          </div>
          <gmap-autocomplete slot-ref-name="gmapInput" @place_changed="setPlace">
            <template v-slot:input="">
              <q-input
                outlined
                v-model="formData.road"
                label="Street *"
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
                dense
                class="col-xs-6"
                ref="gmapInput"
              />
            </template>
          </gmap-autocomplete>
          <div class="col-xs-6 q-mb-md">
            <div class="row col-xs-12 justify-between">
              <q-input
                v-model="formData.building"
                class="col-xs-6"
                label="Building Name"
                dense
                outlined
                stack-label
              />
              <q-input
                v-model="formData.floor_number"
                class="col-xs-2"
                label="Floor umber"
                dense
                outlined
                stack-label
              />
              <div class="col-xs-1 text-center text-h6 q-pt-sm">-</div>
              <q-input
                v-model="formData.unit"
                class="col-xs-2"
                label="Unit number"
                dense
                outlined
                stack-label
              />
            </div>
          </div>
          <div class="row col-xs-6 q-mb-xs justify-between">
            <q-input
              v-model="formData.stall"
              label="Stall"
              lazy-rules
              :rules="[]"
              dense
              class="col-xs-7"
              outlined
            />
            <q-input
              v-model="formData.postal_code"
              label="Postal Code *"
              lazy-rules
              type="number"
              :rules="numericRules"
              class="col-xs-4"
              dense
              outlined
              stack-label
            />
          </div>
          <q-toggle
            v-model="formData.active"
            :false-value="0"
            :true-value="1"
            label="Active"
            class="col-xs-12"
          />
        </div>
        <div class="col col-xs-4">
          <gmap-map
            ref="mapRef"
            map-type-id="roadmap"
            :center="center"
            :zoom="zoom"
            :draggable="true"
            :clickable="true"
            @click="setPlace"
            :style="MapSize"
            :options="{
              zoomControl: false,
              scaleControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              streetViewControl: false,
              disableDefaultUi: true
            }"
          >
            <gmap-marker
              :key="index"
              v-for="(m, index) in markers"
              :position="m.position"
              :clickable="true"
              :draggable="true"
            />
          </gmap-map>
          <q-input
            v-model="latlng"
            label="latitude longitude"
            lazy-rules
            :rules="[]"
            dense
            class="col-xs-12"
            outlined
          />
          <q-toggle
            v-model="addressVerify"
            :false-value="false"
            :true-value="true"
            label="is Address Verified"
            class="col-xs-12"
            disable
          />
        </div>
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
import { gmapApi } from 'gmap-vue';
import { isEmailValid, isNumeric } from 'services';

export default {
  components: {
    FormCard,
    AddressTable,
    gmapApi
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
      latlng: [],
      addressVerify: false,
      MapSize: 'width: 24vw; height: 40vh',
      center: { lat: 45.508, lng: -73.587 },
      zoom: 17,
      markers: [],
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
        active: 1,
        latlng: null
      },
      numericRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ]
    };
  },
  computed: {
    google: gmapApi,
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
    }
  },
  async mounted() {
    if (this.isEditMode) {
      /** Separate unnecessary keys to prevent submit error */
      const { country, address_type, ...filteredFormData } = this.item;
      let latlng;
      //get latlng data by customer id
      const getAddress = await this.$api.get(
        'address',
        `customer_id = ${this.custId} and address_type_id = ${this.item.address_type_id}`
      );
      if (getAddress.data.length > 0) {
        latlng = getAddress.data[0].latlng ? getAddress.data[0].latlng : {};
        this.latlng = JSON.stringify(latlng);
      }
      this.formData = { ...filteredFormData };
      this.markers = latlng
        ? [
            {
              position: latlng
            }
          ]
        : [];
      this.center = latlng ? latlng : this.center;
      this.addressVerify = latlng ? true : false;
    } else {
      this.geolocate();
    }
    this.getAddressType();
    this.getCountries();
  },
  methods: {
    setPlace(place) {
      this.currentPlace = place;
      this.addMarker();
    },
    async addMarker() {
      if (this.currentPlace) {
        const marker = {
          lat: this.currentPlace.latLng
            ? this.currentPlace.latLng.lat()
            : this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.latLng
            ? this.currentPlace.latLng.lng()
            : this.currentPlace.geometry.location.lng()
        };
        this.markers = [{ position: marker }];
        this.formData.latlng = JSON.stringify(this.center);
        if (!this.currentPlace.latLng && this.currentPlace.geometry.location) {
          this.center = marker;
          this.formData.road = this.currentPlace.address_components.filter((x) => x.types[0] === 'route');
          this.formData.road = this.formData.road.length > 0 ? this.formData.road[0].short_name : '';
          this.formData.postal_code = this.currentPlace.address_components.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formData.postal_code =
            this.formData.postal_code.length > 0 ? this.formData.postal_code[0].short_name : '';
        } else {
          this.currentPlace = await this.getAddressFromLatLng(marker);
          this.formData.road = this.currentPlace.address_components.filter((x) => x.types[0] === 'route');
          this.formData.road = this.formData.road.length > 0 ? this.formData.road[0].short_name : '';
          this.formData.postal_code = this.currentPlace.address_components.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formData.postal_code =
            this.formData.postal_code.length > 0 ? this.formData.postal_code[0].short_name : '';
        }
        this.currentPlace = null;
      }
    },
    async getAddressFromLatLng(latlng) {
      const geocoder = new google.maps.Geocoder();
      return await geocoder
        .geocode({ location: latlng })
        .then((response) => {
          if (response.results[0]) {
            return response.results[0];
          }
        })
        .catch();
    },
    geolocate() {
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
    onSubmit() {
      const payload = {
        ...this.formData,
        address_type: this.selectedAddressTypeName,
        type: undefined,
        __typename: undefined
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
