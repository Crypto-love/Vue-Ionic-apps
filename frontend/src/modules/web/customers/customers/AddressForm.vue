<template>
  <form-card
    :title="item ? 'Edit Customer Address' : 'Add Customer Address'"
    scroll-area-height="380"
    class="address-form"
    style="height: 540px; max-width: unset; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="addressForm">
      <div class="row justify-between q-col-gutter-md col-xs-12">
        <div class="col-xs-7">
          <q-select
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
            outlined
          />
          <q-input
            v-model="formData.city"
            label="City *"
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
            class="col-xs-6"
            dense
            outlined
          />
          <q-input
            v-model="formData.state"
            label="State *"
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
            class="col-xs-6"
            dense
            outlined
          />
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
                @click="currentPlace = null"
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
import BranchTable from './BranchTable.vue';
import { gmapApi } from 'gmap-vue';
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
    google: gmapApi,
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
        this.formData.latlng = marker;
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
        this.latlng = JSON.stringify(marker);
        this.currentPlace = null;
      }
    },
    geolocate() {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
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
