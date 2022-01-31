<template>
  <q-page padding>
    <q-form @submit.prevent="onProfileEditSubmit" id="newForm" class="tdots-edit-form">
      <div class="q-ma-md">
        <div class="row">
          <span class="text-title text-primary text-subtitle2 text-weight-medium">
            <span
              @click="gotoRoute('/main/users/hosts/approval')"
              class="link-btn text-weight-medium cursor-pointer"
              >Hosts</span
            >
            / Add Host
          </span>
        </div>
      </div>
      <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
        <div class="row q-mb-lg full-width">
          <span class="text-title text-subtitle2 text-weight-bold"> Personal Details </span>
        </div>
        <div class="row">
          <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
            <div class="full-width justify-center flex q-mb-md">
              <q-avatar size="150px" style="height: auto">
                <img :src="photoProfile()" />
              </q-avatar>
            </div>
          </div>
          <div class="offset-md-1 col-md-9 col-sm-8 col-xs-12 tdots-edit-form">
            <div class="row q-mb-sm">
              <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">First Name</div>
                <q-input
                  type="text"
                  v-model="formUserData.first_name"
                  placeholder="First Name"
                  stack-label
                  outlined
                  lazy-rules
                  dense
                  :rules="[(val) => !!val || 'Please type something']"
                />
              </div>
              <div class="q-mr-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">Last Name</div>
                <q-input
                  type="text"
                  v-model="formUserData.last_name"
                  stack-label
                  placeholder="Last Name"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(val) => !!val || 'Please type something']"
                />
              </div>
            </div>
            <div class="row q-mb-sm">
              <div class="q-mr-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">Phone Number</div>
                <vue-tel-input
                  v-model="formUserData.mobile"
                  enabledCountryCode
                  validCharactersOnly
                  required
                  type="number"
                  pattern="[0-9]*"
                  placeholder="Phone"
                  wrapperClasses="col	no-box-shadow"
                  style="height: 40px"
                  ref="phone-field"
                  inputId="phone-field"
                  disabledFetchingCountry
                  :preferredCountries="$helper.getPreferedCountryCode()"
                  :defaultCountry="defaultCountry"
                  :maxLen="20"
                  @country-changed="(val) => (countryCode = val.dialCode)"
                />
              </div>
            </div>
            <div class="row">
              <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">Email</div>
                <q-input
                  type="text"
                  v-model="formUserData.email"
                  placeholder="Email"
                  stack-label
                  dense
                  outlined
                  lazy-rules
                  :rules="emailRules"
                />
              </div>
            </div>
            <div class="row">
              <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">
                  <span class="col-6 text-left">Password</span>
                  <span
                    class="col-6 text-right text-primary cursor-pointer"
                    style="text-decoration: underline"
                    @click="openChangePwd = true"
                    >Set Password</span
                  >
                </div>
                <q-input
                  type="password"
                  placeholder="No Password Set"
                  stack-label
                  dense
                  outlined
                  lazy-rules
                  disable
                />
              </div>
            </div>
            <div class="row">
              <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">Country</div>
                <q-select
                  v-model="selectedCountry"
                  :options="countryOptions"
                  stack-label
                  dense
                  outlined
                  lazy-rules
                  :rules="[(val) => !!val || 'Please choose something']"
                  option-label="description"
                  option-value="id"
                  use-input
                  input-debounce="0"
                  behavior="menu"
                  @filter="filterCountry"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No results </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
            <div class="row">
              <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                <div class="q-mb-xs row">Referral Number</div>
                <q-input
                  type="text"
                  v-model="formUserData.referred_number"
                  placeholder="User's Referral Number"
                  dense
                  stack-label
                  outlined
                  lazy-rules
                  :rules="[(val) => !!val || 'Please type something']"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
        <div class="row q-mb-lg full-width">
          <span class="text-title text-subtitle2 text-weight-bold"> Collection Points </span>
        </div>
        <q-item>
          <div class="q-pa-md full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="row">
              <div class="col-md-6">
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12 gmapAuto">
                    <div class="q-mb-xs row">Search Address</div>
                    <gmap-autocomplete @place_changed="setPlace" :value="formCPData.gmapAutoValue">
                    </gmap-autocomplete>
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Country</div>
                    <q-select
                      v-model="formCPData.country_id"
                      :options="countriesFiltered"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please choose something']"
                      option-label="description"
                      option-value="id"
                      placeholder="Country"
                      map-options
                      emit-value
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      @filter="filterCountry"
                      dense
                      outlined
                      disable
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">State</div>
                    <q-input
                      v-model="formCPData.state"
                      placeholder="State"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      disable
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">City</div>
                    <q-input
                      v-model="formCPData.city"
                      placeholder="City"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      disable
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Street</div>
                    <q-input
                      v-model="formCPData.road"
                      placeholder="Street"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      :disable="!gmapValueEdit"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Building Name</div>
                    <q-input
                      v-model="formCPData.building"
                      placeholder="Building Name"
                      dense
                      outlined
                      stack-label
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Postal Code</div>
                    <q-input
                      v-model="formCPData.postal_code"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      placeholder="Postal Code"
                      dense
                      outlined
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Unit No.</div>
                    <q-input
                      v-model="formCPData.unit"
                      dense
                      outlined
                      stack-label
                      placeholder="Optional"
                      :disable="!gmapValueEdit"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Floor No.</div>
                    <q-input
                      v-model="formCPData.floor_number"
                      dense
                      outlined
                      stack-label
                      placeholder="Optional"
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <gmap-map
                  ref="mapRef"
                  map-type-id="roadmap"
                  :center="formCPData.latlng"
                  :zoom="zoom"
                  :draggable="true"
                  :clickable="true"
                  @click="setGmapLocation"
                  :style="mapSize"
                  :options="{
                    zoomControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    disableDefaultUi: false
                  }"
                >
                  <gmap-custom-marker :marker="formCPData.latlng">
                    <div class="relative-position">
                      <q-img :src="gmarker" width="30px"></q-img>
                      <div
                        style="
                          position: absolute;
                          top: 4px;
                          left: 30px;
                          color: #c62828;
                          width: 150px;
                          font-weight: 600;
                        "
                      >
                        <p class="no-margin">{{ formCPData.road }},</p>
                        <p class="no-margin">{{ formCPData.state }} {{ formCPData.postal_code }}</p>
                      </div>
                    </div>
                  </gmap-custom-marker>
                </gmap-map>
              </div>
            </div>
            <q-separator class="q-my-md" />
            <div class="row">
              <div class="col-md-12">
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Profile</div>
                    <q-select
                      v-model="formCPData.profile"
                      label="Profile"
                      outlined
                      dense
                      lazy-rules
                      :options="customerProfiles"
                      :rules="[(v) => !!v || 'Profile cannot be empty']"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Whatsapp Link</div>
                    <q-input
                      v-model="formCPData.whatsapp_link"
                      dense
                      outlined
                      stack-label
                      placeholder="Enter Whatsapp Link"
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-sm-2 col-xs-12">
                    <div class="q-mb-xs row">&nbsp;</div>
                    <span>Halal</span>
                    <q-toggle
                      v-model="formCPData.halal"
                      :true-value="true"
                      :false-value="false"
                      :label="formCPData.halal === true ? 'Yes' : 'No'"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-sm-2 col-xs-12">
                    <div class="q-mb-xs row">&nbsp;</div>
                    <span>No Beef</span>
                    <q-toggle
                      v-model="formCPData.no_beef"
                      :true-value="true"
                      :false-value="false"
                      :label="formCPData.no_beef === true ? 'Yes' : 'No'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-item>
      </div>
      <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
        <div class="row q-mb-lg full-width">
          <span class="text-title text-subtitle2 text-weight-bold"> Bank Accounts </span>
        </div>
        <q-item>
          <div class="q-pa-md row full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="col-12">
              <div class="row q-mb-md">
                <div class="q-mr-md col-sm-4 col-xs-12">
                  <div class="q-mb-xs row">Bank Name</div>
                  <q-select
                    v-model="selectedBank"
                    :options="bankOptions"
                    stack-label
                    dense
                    outlined
                    lazy-rules
                    :disable="bankOptions.length == 0"
                    :hint="bankOptions.length == 0 ? 'Please choose country' : ''"
                    :rules="[(val) => !!val || 'Please choose something']"
                    option-label="bank_name"
                    option-value="id"
                  />
                </div>
              </div>
              <div class="row q-mb-sm">
                <div class="q-mr-md col-sm-4 col-xs-12">
                  <div class="q-mb-xs row">Account Number</div>
                  <q-input
                    type="number"
                    v-model="formBankData.account_number"
                    placeholder="Account Number"
                    stack-label
                    dense
                    outlined
                    lazy-rules
                    :rules="[(val) => !!val || 'Please type something']"
                  />
                </div>
                <div class="q-mr-md col-sm-4 col-xs-12">
                  <div class="q-mb-xs row">Account Name</div>
                  <q-input
                    type="text"
                    v-model="formBankData.account_name"
                    placeholder="Account Name"
                    stack-label
                    dense
                    outlined
                    lazy-rules
                    :rules="[(val) => !!val || 'Please type something']"
                  />
                </div>
              </div>
              <div class="row q-mb-sm">
                <div class="q-mr-md col-sm-4 col-xs-12">
                  <div class="q-mb-xs row">Bank Code</div>
                  <q-input
                    type="text"
                    v-model="formBankData.bank_code"
                    placeholder="Bank Code"
                    dense
                    stack-label
                    outlined
                    lazy-rules
                    :rules="[(val) => !!val || 'Please type something']"
                  />
                </div>
                <div class="q-mr-md col-sm-4 col-xs-12">
                  <div class="q-mb-xs row">Branch Code</div>
                  <q-input
                    type="text"
                    v-model="formBankData.branch_code"
                    placeholder="Branch Code"
                    dense
                    stack-label
                    outlined
                    lazy-rules
                    :rules="[(val) => !!val || 'Please type something']"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-item>
      </div>
      <div class="row q-mx-md q-px-md">
        <q-btn
          class="q-mt-md q-px-lg text-capitalize q-mr-md"
          color="primary"
          outline
          rounded
          type="submit"
          form="newForm"
          label="Save"
        />
        <q-btn
          class="q-mt-md q-px-lg text-capitalize"
          text-color="grey-8"
          outline
          rounded
          label="Cancel"
          @click="gotoRoute('/main/users/hosts/approval')"
        />
      </div>
    </q-form>
    <q-dialog v-model="openChangePwd">
      <password-dialog :type="false" @close="closePwd" @update="updatePwd"></password-dialog>
    </q-dialog>
    <q-dialog v-model="showUpdateLocationModal">
      <advocate-update-location @close="closePopUp(4)" @update="updateLocation" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import { aws_s3_bucket_public } from 'src/config';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { gmapApi } from 'gmap-vue';
import GmapCustomMarker from 'vue2-gmap-custom-marker';
import gmarker from 'assets/images/gmarker.svg';
import PasswordDialog from '../share/partial/PasswordDialog.vue';
import AdvocateUpdateLocation from './advocates/AdvocateUpdateLocation.vue';
import { allCountries } from 'treeGQL';
import { cipher } from 'services';
import { getAllBanks, addNewAdvocate } from 'treeGQL';
import { isEmailValid } from 'services';

export default {
  components: {
    GmapCustomMarker,
    PasswordDialog,
    AdvocateUpdateLocation
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      mapSize: 'width: 360px; height: 200px',
      zoom: 20,
      states: [],
      markers: [],
      currentPlace: null,
      mapByKeyIn: false,
      selectedCountry: null,
      countryOptions: [],
      selectedBank: null,
      openChangePwd: false,
      showUpdateLocationModal: false,
      gmapValueEdit: false,
      countries: [],
      countriesFiltered: [],
      encrypt: cipher(),
      gmarker: gmarker,
      formCPData: {
        country_id: undefined,
        state: undefined,
        city: undefined,
        road: undefined,
        street_number: undefined,
        building: undefined,
        floor_number: undefined,
        unit: undefined,
        stall: undefined,
        postal_code: undefined,
        latlng: {
          lat: 1.3743588,
          lng: 103.8626315
        },
        street: undefined,
        no_beef: false,
        halal: false,
        whatsapp_link: null,
        profile: null
      },
      formUserData: {
        first_name: null,
        last_name: null,
        image: null,
        mobile: null,
        referred_number: null,
        email: null,
        country: {
          description: null,
          id: null,
          name: null
        },
        status_approval: null,
        password: null
      },
      formBankData: {
        bank_id: null,
        account_name: null,
        account_number: null,
        bank_code: null,
        branch_code: null
      },
      countryCode: null,
      defaultCountry: '',
      emailRules: [
        (v) => {
          if (!v) return 'Please input email';
          if (v && isEmailValid(v)) return true;
          return 'Must be a valid email';
        }
      ],
      bankOptions: [],
      customerProfiles: this.$helper.getCustomerProfiles()
    };
  },
  computed: {
    google: gmapApi
  },
  async mounted() {
    await this.getCountries();
  },
  watch: {
    selectedCountry(v) {
      this.formUserData.country.id = v.id;
      this.formUserData.country.name = v.name;
      this.formUserData.country.description = v.description;
      this.getBanks();
    },
    selectedBank(v) {
      this.formBankData.bank_id = v.id;
    },
    'formCPData.country_id'(v) {
      if (v === 193) {
        this.formCPData.state = 'Singapore';
        this.formCPData.city = 'Singapore';
      }
    },
    'formCPData.state': function (val) {
      this.formCPData.state = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.city': function (val) {
      this.formCPData.city = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.building': function (val) {
      this.formCPData.building = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.road': function (val) {
      this.formCPData.road = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.unit': function (val) {
      this.formCPData.unit = val ? val.removeSpecialCharacter() : '';
    },
    'formUserData.email': function (val) {
      this.formUserData.email = val ? val.removeSpecialCharacter() : '';
    },
    'formUserData.mobile': function (val) {
      /* Remove all non-numeric character */
      this.formUserData.mobile = val ? val.replace(/\D/g, '') : '';

      /* Remove first char of phone number if it start with 0 */
      if (this.formUserData.mobile.length > 0 && this.formUserData.mobile[0] == '0')
        this.formUserData.mobile = this.formUserData.mobile.substring(1);
    }
  },
  methods: {
    async getCountries() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: allCountries,
            variables: {
              active: true
            }
          })
          .then((res) => {
            resolve(res?.data?.allCountries);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.countries = data;
      this.countryOptions = data;
      this.countriesFiltered = data;
    },
    async getBanks() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllBanks,
            variables: {
              countryId: this.formUserData.country.id
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllBanks);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.bankOptions = data;
    },
    async onProfileEditSubmit() {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      try {
        await this.$apollo
          .mutate({
            mutation: addNewAdvocate,
            variables: {
              jsonData: JSON.stringify({
                first_name: this.formUserData.first_name,
                last_name: this.formUserData.last_name,
                email: this.formUserData.email,
                mobile: this.countryCode + this.formUserData.mobile,
                password: this.encrypt(this.formUserData.password),
                country_id: this.formUserData.country.id,
                referred_number: this.formUserData.referred_number,
                status_approval: this.formUserData.status_approval,
                halal_products: this.formCPData.halal,
                beef_products: this.formCPData.no_beef,
                profile: this.formCPData.profile,
                whatsapp_link: this.formCPData.whatsapp_link,
                state: this.formCPData.state,
                city: this.formCPData.city,
                road: this.formCPData.road,
                street_number: this.formCPData.street_number,
                building: this.formCPData.building,
                postal_code: this.formCPData.postal_code,
                unit: this.formCPData.unit,
                stall: this.formCPData.stall,
                floor_number: this.formCPData.floor_number,
                latlng: {
                  lat: this.formCPData.latlng.lat,
                  lng: this.formCPData.latlng.lng
                },
                bank_id: this.formBankData.bank_id,
                account_name: this.formBankData.account_name,
                account_number: this.formBankData.account_number,
                bank_code: this.formBankData.bank_code,
                branch_code: this.formBankData.branch_code
              })
            }
          })
          .then(() => {
            this.$q.loading.hide();
            Notice.ok('Successfully updated!');
            this.gotoRoute('/main/users/hosts/approval');
          });
      } catch (error) {
        console.log(error);
        this.$q.loading.hide();
        Notice.fail('Failed to update!');
      }
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/advocate/${photoName}`;
      }
      return `${aws_s3_bucket_public}/advocate/no_image.png`;
    },
    phoneNumberFormat(number) {
      return `+${number.slice(0, 2)} ${number.slice(2, 4)} ${number.slice(6)}`;
    },
    gotoRoute(path) {
      this.$router.push(path);
    },
    async getAddressFromLatLng(latlng) {
      this.locationIsLoading = true;
      const geocoder = new google.maps.Geocoder();
      const getDetails = await new Promise((resolve, reject) => {
        geocoder
          .geocode({ location: latlng })
          .then((response) => {
            if (response.results[0]) {
              resolve(response.results[0]);
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'location error',
              message: err.message,
              buttonText: 'close'
            });
            this.locationIsLoading = false;
            reject(err.message);
          });
      });
      this.locationIsLoading = false;
      return getDetails;
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
    },
    setPlace(place) {
      this.currentPlace = place;
      this.addMarker();
    },
    setRoad(data) {
      let country = data.filter((x) => x.types[0] === 'country');
      country = country.length > 0 ? country[0].long_name : null;
      this.formCPData.country_id = this.countriesFiltered?.filter((x) => x.description === country)?.[0]?.id;

      let city = data.filter((x) => ['locality', 'administrative_area_level_2'].includes(x.types[0]));
      this.formCPData.city = city.length > 0 ? city[0].long_name : null;

      let state = data.filter((x) => x.types[0] === 'administrative_area_level_1'); //singapore dont have state jusr return singapore as state and city
      this.formCPData.state =
        country === 'Singapore' ? country : state.length > 0 ? state[0].long_name : null;

      let street = data.filter((x) => x.types[0] === 'street_number');
      street = street.length > 0 ? street[0].short_name : null;

      let route = data.filter((x) => x.types[0] === 'route');
      route = route.length > 0 ? route[0].short_name : 'N/A';
      return street ? street.concat(' ', route) : route;
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
        this.formCPData.latlng = marker;
        if (!this.currentPlace?.latLng && this.currentPlace?.geometry?.location) {
          this.center = marker;
          this.setRoad(this.currentPlace.address_components);
          this.formCPData.road = this.setRoad(this.currentPlace.address_components);
          this.formCPData.gmapAutoValue = this.formCPData.road;
          this.formCPData.postal_code = this.currentPlace?.address_components?.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formCPData.postal_code =
            this.formCPData.postal_code.length > 0 ? this.formCPData.postal_code[0].short_name : 'N/A';
        } else {
          this.currentPlace = !this.locationIsLoading
            ? await this.getAddressFromLatLng(marker)
            : this.currentPlace;
          // this.formCPData.road = this.formCPData.road ? this.formCPData.road : this.setRoad(this.currentPlace.address_componentsl);
          this.mapByKeyIn = this.formCPData.road && this.mapByKeyIn ? true : false;
          this.formCPData.road = this.mapByKeyIn
            ? this.formCPData.road
            : this.setRoad(this.currentPlace.address_components);
          this.formCPData.postal_code = this.currentPlace.address_components.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formCPData.postal_code =
            this.formCPData.postal_code.length > 0 ? this.formCPData.postal_code[0].short_name : 'N/A';
        }
        this.currentPlace = null;
        this.gmapValueEdit = true;
      }
    },
    closePwd() {
      this.openChangePwd = false;
    },
    updatePwd(val) {
      this.formUserData.password = val;
      this.openChangePwd = false;
    },
    setGmapLocation(place) {
      this.currentPlace = place;
      this.showUpdateLocationModal = true;
    },
    updateLocation() {
      this.showUpdateLocationModal = false;
      this.addMarker();
    },
    filterCountry(val, update) {
      if (val === '') {
        update(() => {
          this.countryOptions = this.countries;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.countryOptions = this.countries.filter((v) => v.description.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>
<style scoped>
.link-btn {
  color: #a2acb5;
  text-decoration: underline;
}
.link-btn:hover {
  color: var(--q-color-primary);
}
</style>
