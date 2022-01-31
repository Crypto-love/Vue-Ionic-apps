<template>
  <q-card padding style="width: 750px; max-width: 750px">
    <q-form @submit.prevent="addInternalUser()" id="editForm">
      <q-card-section>
        <span class="text-weight-medium text-title text-h6"> Add Internal User </span>
      </q-card-section>
      <q-card-section class="row q-py-xs">
        <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
          <div class="full-width justify-center flex q-mb-md">
            <div class="col-auto column justify-center items-center">
              <q-img
                class="col-auto q-mt-md"
                placeholder-src="https://cdn3.iconfinder.com/data/icons/outline-style-1/512/profile-512.png"
                :src="formUserData.base64_image"
                style="height: 130px; width: 130px; border-radius: 50%"
              >
                <div
                  style="border-radius: 50%; border: 4px solid #dadce0"
                  class="absolute-full bg-transparent text-subtitle2 flex flex-center"
                />
              </q-img>
              <div style="text-align: center">
                <q-btn
                  dense
                  fab-mini
                  text-color="#DADCE0"
                  icon="eva-image-outline"
                  @click="() => $refs.photoInput.pickFiles()"
                  style="transform: translate(32px, -36px); background-color: #dadce0"
                />
                <q-uploader ref="photoInput" @added="onPhotoChanged" accept="image/*" style="display: none" />
              </div>
            </div>
          </div>
        </div>
        <div class="offset-md-1 col-md-9 col-sm-8 col-xs-12 tdots-edit-form">
          <div class="row">
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
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
            <div class="q-pr-md col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Last Name</div>
              <q-input
                type="text"
                v-model="formUserData.last_name"
                placeholder="Last Name"
                stack-label
                outlined
                dense
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
              />
            </div>
          </div>
          <div class="row">
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
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
            <div class="q-pr-md col-sm-6 col-xs-12">
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
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
              <div class="q-mb-xs row col-12">
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
                :placeholder="isEditMode ? 'Change password' : 'No Password Set'"
                stack-label
                dense
                outlined
                lazy-rules
                disable
              />
            </div>
          </div>
          <div class="row">
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
              <div class="q-mb-xs">Country</div>
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
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
              <div class="q-mb-xs">Gender</div>
              <q-btn-toggle
                v-model="formUserData.gender"
                no-caps
                outline
                toggle-color="black"
                toggle-text-color="primary"
                color="primary"
                text-color="black"
                :options="[
                  { label: 'Male', value: 'm' },
                  { label: 'Female', value: 'f' }
                ]"
              />
            </div>
          </div>
          <div class="row">
            <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
              <div class="q-mb-xs">Active</div>
              <q-toggle
                v-model="formUserData.active"
                :true-value="true"
                :false-value="false"
                :label="formUserData.active === true ? 'Yes' : 'No'"
              />
            </div>
          </div>
          <div class="row q-mb-sm">
            <q-btn
              class="q-px-xs text-capitalize q-mr-md"
              color="primary"
              outline
              rounded
              type="submit"
              form="editForm"
              :label="isEditMode ? 'Save' : 'Add Internal User'"
            />
            <q-btn
              class="q-px-lg text-capitalize"
              text-color="grey-8"
              outline
              rounded
              label="Cancel"
              @click="$emit('close')"
            />
          </div>
        </div>
      </q-card-section>
    </q-form>
    <q-dialog v-model="openChangePwd">
      <password-dialog :type="false" @close="closePwd" @update="updatePwd"></password-dialog>
    </q-dialog>
    <q-dialog v-model="showCropBox" persistent full-height @hide="onHideDialog">
      <crop-box :src="src" v-if="showCropBox" @submit="onCrop" />
    </q-dialog>
  </q-card>
</template>

<script>
import FormDialog from 'web/share/partial/FormDialog.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { allCountries } from 'treeGQL';
import PasswordDialog from '../../share/partial/PasswordDialog.vue';
import { cipher } from 'services';
import { isEmailValid, fileToBase64, Notice } from 'services';
import CropBox from 'web/share/partial/CropBox.vue';

export default {
  components: {
    PasswordDialog,
    FormDialog,
    CropBox
  },
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      personalDetails: [],
      selectedCountry: null,
      countryOptions: [],
      openChangePwd: false,
      countries: [],
      encrypt: cipher(),
      countryCode: null,
      defaultCountry: '',
      isEditMode: false,
      src: null,
      showCropBox: false,
      formUserData: {
        first_name: null,
        last_name: null,
        base64_image: null,
        mobile: null,
        email: null,
        active: true,
        country_id: null,
        password: null,
        status_approval: null,
        user_type_id: null
      },
      emailRules: [
        (v) => {
          if (!v) return 'Please input email';
          if (v && isEmailValid(v)) return true;
          return 'Must be a valid email';
        }
      ]
    };
  },
  computed: {},
  async mounted() {
    await this.getCountries();
    if (this.user) {
      this.isEditMode = true;
      this.formUserData = this.user;
      this.selectedCountry = this.countries.filter((item) => item.id === this.user.country_id)[0];
    }
  },
  watch: {
    selectedCountry(v) {
      this.formUserData.country_id = v.id;
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
    },
    closePwd() {
      this.openChangePwd = false;
    },
    updatePwd(val) {
      this.formUserData.password = this.encrypt(val);
      this.openChangePwd = false;
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
    },
    addInternalUser() {
      if (!this.formUserData.password) {
        Notice.fail('Please set password');
      }
      this.$emit('addUser', this.formUserData);
    },
    onCrop(results) {
      this.formUserData.base64_image = results.large;
      this.onHideDialog();
    },
    onHideDialog() {
      this.src = null;
      this.showCropBox = false;

      // Reset queue so we can choose file again
      this.$refs.photoInput.reset();
      this.$refs.photoInput.removeQueuedFiles();
    },
    async onPhotoChanged(val) {
      if (val.length == 0) return;

      if (!val[0].type.includes('image')) {
        this.showDialog('Failed', 'File type must be image');
        return;
      }

      this.src = await fileToBase64(val[0]);
      this.showCropBox = true;
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
.form-group {
  margin-bottom: 0.5rem;
}
.mb-2 {
  margin-bottom: 1rem !important;
}
</style>
