<template>
  <q-layout v-if="!verifyMode" view="lHh Lpr lFf">
    <div v-if="$q.screen.gt.sm" class="fixed-top-right q-ma-lg">
      <q-img
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/darkgreen-logo.png"
        style="width: 130px"
      />
    </div>

    <div class="form-container vertical-center q-pa-md latofont">
      <q-form @submit="onSubmit" ref="loginForm">
        <div class="column items-left justify-center">
          <div class="text-dark q-mx-sm q-mb-lg">
            <div class="text-weight-bold q-py-sm" style="font-size: 32px">Join With Us Today</div>
            <div class="text-weight-regular" style="font-size: 16px">
              Create Your Account
              <br />And Let's Reduce Food Loss With TreeDots
            </div>
          </div>

          <div class="input-data column">
            <div class="row">
              <q-input
                dense
                class="col q-ml-sm q-mr-sm q-my-sm"
                filled
                v-model="user.first_name"
                :rules="[
                  (val) => (val && val.length > 0) || 'First name cannot be empty',
                  (val) => val.length >= 2 || 'First name must be at least 2 characters'
                ]"
                label="First Name*"
              />
              <q-input
                dense
                class="col q-mr-sm q-ml-sm q-my-sm"
                filled
                v-model="user.last_name"
                :rules="[]"
                label="Last Name"
              />
            </div>

            <div
              class="col row items-center q-mx-sm q-my-sm bg-grey-3"
              style="border-bottom: 0.5px solid silver"
            >
              <vue-tel-input
                class="bg-transparent"
                v-model="user.mobile"
                enabledCountryCode
                validCharactersOnly
                required
                type="number"
                pattern="[0-9]*"
                placeholder="Mobile Phone*"
                wrapperClasses="col no-border	no-box-shadow"
                :preferredCountries="['SG', 'MY']"
                :maxLen="20"
                @country-changed="(val) => (countryCode = val.dialCode)"
              />
            </div>

            <q-input
              class="q-mx-sm q-my-sm"
              v-model="user.email"
              ref="emailField"
              dense
              filled
              label="Email"
              type="email"
              @input="isExist.email = false"
              :rules="[(v) => !!v || 'Email cannot be empty', (v) => !isExist.email || 'Email already exist']"
            ></q-input>

            <q-select
              class="q-mx-sm q-my-sm"
              dense
              filled
              v-model="user.buyer_type"
              :options="buyerTypes"
              option-label="label"
              option-value="value"
              map-options
              emit-value
              label="Account Type"
              :rules="[(v) => !!v || 'Account type cannot be empty']"
            ></q-select>

            <q-input
              class="q-mx-sm q-my-sm"
              dense
              v-model="user.password"
              ref="passwordField"
              :type="peekPassword ? 'text' : 'password'"
              :rules="[
                (v) => !!v || 'Password cannot be empty',
                (v) => v.length >= 6 || 'Password must be at least 6 characters'
              ]"
              filled
              label="Create Password*"
            >
              <template v-slot:append>
                <q-icon
                  :name="peekPassword ? 'eva-eye-off-outline' : 'eva-eye-outline'"
                  class="cursor-pointer"
                  @click="peekPassword = !peekPassword"
                />
              </template>
            </q-input>

            <q-input
              class="q-mx-sm q-my-sm"
              dense
              filled
              v-model="confirmPassword"
              :type="peekConfirmPassword ? 'text' : 'password'"
              :rules="[
                (val) => !!val || 'Confirm password cannot be empty',
                (val) => val == this.$refs.passwordField.value || 'Confirm password does not match'
              ]"
              label="Confirm Password*"
            >
              <template v-slot:append>
                <q-icon
                  :name="peekConfirmPassword ? 'eva-eye-off-outline' : 'eva-eye-outline'"
                  class="cursor-pointer"
                  @click="peekConfirmPassword = !peekConfirmPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="text-weight-light text-italic text-black q-ma-sm" style="font-size: 12px">
            After you have successfully created an account, please Sign In through the TreeDots Application.
          </div>

          <div class="q-mx-md q-mt-md text-h6 text-primary text-center">
            <q-btn
              color="dark"
              no-caps
              unelevated
              class="q-px-xl"
              label="Create Account"
              size="md"
              style="border-radius: 4px"
              type="submit"
              :loading="signingUp"
            />
          </div>
          <div class="text-black text-center text-weight-light q-ml-sm q-mt-md" style="font-size: 16px">
            There is no TreeDots Apps on your Smartphone?
          </div>

          <div class="text-black text-center text-weight-bold q-mt-sm q-mb-md" style="font-size: 16px">
            Get The App Now
          </div>
          <div class="row justify-center q-gutter-xs items-start">
            <q-btn flat style="border-radius: 8px; max-width: 164px" @click="appStore()">
              <img
                height="42px"
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/appstore.png"
                alt="appstore"
              />
            </q-btn>
            <q-btn flat style="border-radius: 8px; max-width: 164px" @click="playStore()">
              <img
                height="42px"
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/playstore.png"
                alt="playstore"
              />
            </q-btn>
          </div>
        </div>
      </q-form>
    </div>
  </q-layout>
  <VerifyCode
    v-else
    :user="user"
    :countryCode="countryCode"
    @back="verifyMode = false"
    @success="showDialog('Success', 'Sign up is success', goBack)"
  />
</template>

<script>
import AlertMessage from '../partial/AlertMessage';
import VerifyCode from '../partial/VerifyCode';
import { Api, Notice, cipher } from 'services';

const buyerTypes = [
  {
    value: 2,
    label: 'Personal'
  },
  {
    value: 1,
    label: 'Business'
  }
];

export default {
  data() {
    return {
      user: {
        first_name: '',
        last_name: '',
        mobile: '',
        email: '',
        password: '',
        user_type_id: 6, // User type for buyer
        buyer_type: null,
        active: 1
      },
      isExist: {
        email: false
      },
      countryCode: null,
      confirmPassword: '',
      buyerTypes,
      peekPassword: false,
      peekConfirmPassword: false,
      signingUp: false,
      verifyMode: false,
      encrypt: cipher()
    };
  },

  components: { VerifyCode },

  watch: {
    'user.mobile': function (val) {
      /* Remove all non-numeric character */
      this.user.mobile = val ? val.replace(/\D/g, '') : '';

      /* Remove first char of phone number if it start with 0 */
      if (this.user.mobile.length > 0 && this.user.mobile[0] == '0')
        this.user.mobile = this.user.mobile.substring(1);
    }
  },

  mounted() {
    document.addEventListener('backbutton', this.goBack, false);
  },

  destroyed() {
    document.removeEventListener('backbutton', this.goBack, false);
  },

  methods: {
    goBack() {
      if (this.signingUp) return;
      this.$router.replace('login');
    },

    showDialog(title, message, callback) {
      this.$q
        .dialog({
          parent: this,
          component: AlertMessage,
          title: title,
          message: message
        })
        .onDismiss(() => {
          if (callback) callback();
        });
    },

    onSubmit() {
      if (this.authenticating) return;
      this.$refs.loginForm.validate().then((success) => {
        if (success) this.checkData();
      });
    },

    async checkData() {
      const fullPhoneNumber = `${this.countryCode}${this.user.mobile}`;

      if (!this.countryCode) {
        this.showDialog('Failed', 'Please choose country code');
        return;
      }
      this.signingUp = true;

      const { status, message, data } = await this.$api.get(
        'v_username',
        `mobile = '${fullPhoneNumber}' OR email = '${this.user.email}' `,
        `CASE WHEN mobile = '${fullPhoneNumber}' THEN TRUE ELSE FALSE END AS mobile, CASE WHEN email = '${this.user.email}' THEN TRUE ELSE FALSE END AS email`
      );

      this.signingUp = false;

      if (status) {
        if (data && data.length > 0) {
          data.forEach((value) => {
            if (value.mobile) this.showDialog('Failed', 'Phone number already registered');

            if (value.email) this.isExist.email = true;

            this.$refs.emailField.validate();
          });
        } else {
          this.verifyMode = true;
        }
      } else {
        this.showDialog('Failed', message);
      }
    },

    /**
     * This function is copied from LoginPage.vue.
     * The difference should be only on catch block.
     */
    async login() {
      return;
      try {
        this.$q.loading.show();
        const payload = {
          secret: `${this.countryCode}${this.user.mobile}`,
          pass: this.encrypt(this.user.password)
        };
        const res = await Api.exec('p_login', [JSON.stringify(payload)]);
        if (res.status) {
          const userType = res.data[0].user_type;
          const allowedTypes = ['super', 'administrator', 'beneficiary', 'buyer', 'sales', 'driver'];
          if (this.$isMobile && !allowedTypes.includes(userType)) {
            throw 'Access denied!';
          }

          // Handle login success here
          res.data[0].menus = res.data[0].menus ? res.data[0].menus.sort((a, b) => a.id - b.id) : [];
          this.$store.commit('setUser', res.data[0]);

          if (this.$isMobile) {
            let buyer_type = this.$store.state.buyer_type;
            if (userType == 'buyer' && buyer_type == '2') {
              await this.getDefaultHub();
            }
          }
          this.$router.replace('/main');

          /* connect to socket if have token */
          if (Socket.token()) Socket.connect(true);
        } else {
          throw 'Please check your email & password';
        }
      } catch (err) {
        this.$q.loading.hide();
        this.goBack();
      }
    },

    /**
     * This function is copied from LoginPage.vue
     */
    /** get 1 available hub that have maximum current order */
    async getDefaultHub() {
      const res = await this.$api.get('v_hubs', null, null, 'current_order desc,name asc', '1');
      if (res.status) {
        this.$store.commit('setCompany', res.data[0]);
      }
    },
    playStore: function () {
      window.open('https://play.google.com/store/apps/details?id=com.thetreedots');
    },
    appStore: function () {
      window.open('https://apps.apple.com/id/app/treedots/id1448811993?l=id');
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lato&display=swap');

.latofont {
  font-family: 'Lato';
  line-height: normal;
  letter-spacing: normal;
}

.lightgreen {
  color: #c9d397;
}
.orange {
  color: #ff975e;
}

.lightblue {
  color: #b2ebf2;
}

.lightyellow {
  color: #ffecb3;
}

.greybg {
  color: #f6f6f6;
}
</style>

<style scoped>
.form-container {
  margin: 0 auto;
  width: 412px;
  height: auto;
  padding: 10px 10px 10px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.16);
}

@media only screen and (max-width: 599px) {
  .vertical-center {
    position: relative;
    display: block;
    top: unset !important;
    left: unset !important;
    transform: translateX(0%) translateY(0%) !important;
  }

  .form-container {
    margin-top: 5vh;
    margin-bottom: 5vh;
    display: block;
    width: 90%;
  }
}
</style>
