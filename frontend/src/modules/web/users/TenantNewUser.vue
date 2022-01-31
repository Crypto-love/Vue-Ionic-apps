<template>
  <q-page padding>
    <div class="q-ma-md">
      <div class="row">
        <span class="text-title text-primary text-subtitle2 text-weight-medium">
          <span @click="gotoBack()" class="link-btn text-weight-medium cursor-pointer">{{
            type == 1 ? 'Group Buy Users' : type == 2 ? 'Business Users' : 'Internal Users'
          }}</span>
          / {{ type == 1 ? 'Add Group Buy User' : type == 2 ? 'Add Business Users' : 'Add Internal Users' }}
        </span>
      </div>
    </div>
    <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="row q-mb-lg full-width">
        <span class="text-title text-subtitle2 text-weight-bold"> User Details </span>
      </div>
      <div class="row">
        <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
          <div class="full-width justify-center flex q-mb-md">
            <q-avatar size="150px" style="height: auto">
              <img :src="photoProfile(personalDetails.image)" />
            </q-avatar>
          </div>
        </div>
        <q-form
          class="offset-md-1 col-md-9 col-sm-8 col-xs-12 tdots-edit-form"
          @submit.prevent="onProfileEditSubmit"
          id="editForm"
        >
          <div class="row q-mb-sm">
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs">First Name</div>
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
              <div class="q-mb-xs">Last Name</div>
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
          <div class="row q-mb-sm">
            <div class="q-mr-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs">Phone Number</div>
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
              <div class="q-mb-xs">Email</div>
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
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
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
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs">Active</div>
              <q-toggle
                v-model="formUserData.active"
                :true-value="true"
                :false-value="false"
                :label="formUserData.active === true ? 'Yes' : 'No'"
              />
            </div>
          </div>
          <div class="row">
            <q-btn
              class="q-mt-md q-px-xs text-capitalize q-mr-md"
              color="primary"
              outline
              rounded
              type="submit"
              form="editForm"
              :label="
                type == 1 ? 'Add Group Buy User' : type == 2 ? 'Add Business User' : 'Add Internal User'
              "
            />
            <q-btn
              class="q-mt-md q-px-lg text-capitalize"
              text-color="grey-8"
              outline
              rounded
              label="Cancel"
              @click="gotoBack()"
            />
          </div>
        </q-form>
      </div>
      <q-dialog v-model="openChangePwd">
        <password-dialog :type="false" @close="closePwd" @update="updatePwd"></password-dialog>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import { aws_s3_bucket_public } from 'src/config';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { updateSupplierUser } from 'treeGQL';
import { allCountries } from 'treeGQL';
import PasswordDialog from '../share/partial/PasswordDialog.vue';
import { cipher } from 'services';
import { isEmailValid } from 'services';

export default {
  components: {
    PasswordDialog
  },
  props: {
    type: {
      type: [String, Number],
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
      formUserData: {
        first_name: null,
        last_name: null,
        full_name: null,
        id: null,
        image: null,
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
    async onProfileEditSubmit() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierUser,
            variables: {
              jsonData: JSON.stringify({
                first_name: this.formUserData.first_name,
                last_name: this.formUserData.last_name,
                email: this.formUserData.email,
                password: this.encrypt(this.formUserData.password),
                mobile: this.countryCode + this.formUserData.mobile,
                country_id: this.formUserData.country_id,
                user_type_id: this.type == 3 ? 1 : 6,
                buyer_type: this.type == 3 ? null : this.type == 1 ? 2 : 1,
                gender: this.formUserData.gender,
                active: this.formUserData.active
              })
            }
          })
          .then(() => {
            Notice.ok('Successfully created');
            this.gotoBack();
          });
      } catch (error) {
        console.log(error);
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/profile-pictures/${photoName}`;
      }
      return `${aws_s3_bucket_public}/profile-pictures/no_image.png`;
    },
    gotoBack() {
      if (this.type == 1) {
        this.$router.push('/main/users/groupbuy_users');
      } else if (this.type == 2) {
        this.$router.push('/main/users/business_users');
      } else if (this.type == 3) {
        this.$router.push('/main/users/internal_users');
      }
    },
    closePwd() {
      this.openChangePwd = false;
    },
    updatePwd(val) {
      this.formUserData.password = val;
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
