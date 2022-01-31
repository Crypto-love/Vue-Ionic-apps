<template>
  <q-layout class="q-pa-xl window-height" view="lHh Lpr lFf">
    <div class="full-width full-height">
      <div class="absolute-top-left top-logo column q-ma-md">
        <div class="col bg-primary" style="width: 35px; font-size: 5px; border-radius: 20px">&nbsp;</div>
        <div class="col q-mt-md text-h2 text-primary text-bold text-logo">TreeDots Titan</div>
      </div>
      <app-mode></app-mode>
      <div class="vertical-center">
        <div>
          <div class="form-container">
            <q-form @submit="onSubmit" class="col-8 self-center" ref="loginForm">
              <div style="text-align: center">
                <div class="title" @click="showAppMode">
                  {{ $t('sign_in') }}
                </div>
                <div class="tagline">{{ $t('login_header_tagline') }}</div>
                <q-input
                  autofocus
                  borderless
                  dense
                  v-model="username"
                  :placeholder="$t('username')"
                  type="username"
                  class="txt-username"
                >
                  <template v-slot:prepend>
                    <q-icon name="eva-person-outline" class="icon-color" />
                  </template>
                </q-input>

                <q-input
                  class="txt-password"
                  borderless
                  dense
                  :type="isPwd ? 'password' : 'text'"
                  v-model="password"
                  :placeholder="$t('password')"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" class="icon-color" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                      class="icon-color cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <div class="forgot">
                  <a href="forgot-password">
                    <p class="forgot-link">{{ $t('forgot_password') }} ?</p>
                  </a>
                </div>

                <q-btn
                  type="submit"
                  class="btn_login"
                  text-color="white"
                  no-caps
                  dense
                  style="border-radius: 8px"
                  :loading="authenticating"
                  >{{ $t('sign_in') }}</q-btn
                >
              </div>
              <q-select
                v-model="lang"
                :options="langOptions"
                label="Language"
                dense
                borderless
                emit-value
                map-options
                options-dense
                style="min-width: 150px"
              />
            </q-form>
          </div>
        </div>
      </div>
      <div class="logo-version-container column q-ma-md">
        <div class="logo-version">
          <q-img
            src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/app-logo.png"
            class="logo"
          />
          <div class="version">v{{ `${version}/${getContentVersion}` }}</div>
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script>
import AlertMessage from '../partial/AlertMessage.vue';
import AppMode from '../partial/AppMode.vue';
import SelectAppMode from '../partial/SelectAppMode.vue';
import { Api, Socket, cipher } from 'services';
import meta from '../../../../../package.json';
import { loginDashboard, countries, getUserCustomerDetails } from 'treeGQL';

export default {
  name: 'login',
  components: {
    AppMode
  },
  data() {
    return {
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en-us', label: 'English' },
        { value: 'zh-cn', label: 'Chinese (Simplified)' },
        { value: 'zh-tw', label: 'Chinese (Traditional)' }
      ],
      hitCounter: 0,
      version: '0.0.0',
      signInMethod: null,
      countryCode: null,
      username: '',
      password: '',
      isPwd: true,
      authenticating: false,
      encrypt: cipher(),
      allCountries: []
    };
  },
  async mounted() {
    this.version = meta.version;
  },
  apollo: {
    allCountries: countries
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang;
    }
  },
  computed: {
    getContentVersion() {
      const contentVersion = (this.$store.state.version || '').toString();
      return contentVersion.substring(contentVersion.length, 6);
    }
  },
  methods: {
    showAppMode() {
      if (this.hitCounter > 5) {
        this.$q.dialog({
          parent: this,
          component: SelectAppMode,
          title: 'Developer Menu',
          message: 'Choose Server'
        });
        this.hitCounter = 0;
      } else {
        this.hitCounter++;
      }
    },
    onSubmit() {
      if (this.authenticating) return;
      this.$refs.loginForm.validate().then((success) => {
        if (success) this.login();
        else
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'Failed',
            message: 'Please enter a valid username and password'
          });
      });
    },
    async login() {
      try {
        this.authenticating = true;
        const identity = this.username;
        const password = this.encrypt(this.password);
        this.$apollo
          .mutate({
            mutation: loginDashboard,
            variables: {
              identity: identity,
              password: password
            }
          })
          .then(async (res) => {
            await this.setUserToPlatform(res.data.signIn);
          })
          .catch((err) => {
            this.$store.commit('clearStore');
            this.authenticating = false;
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.authenticating = false;
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async setUserToPlatform(res) {
      //TODO: change the method to get user_customers for advocate into graphQL's

      const userType = res.type.name;
      if (userType !== 'super' && !res.tenant)
        throw new Error('Tenant not found. Please contact the administrator.');

      if (userType !== 'super' && !res.tenant.id)
        throw new Error('Tenant not found. Please contact the administrator.');

      const data_to_store = this.$helper.adjustUserCredential(res);

      this.$store.commit('setUser', data_to_store);
      //to get user customers data for advocate
      const user_customers = await this.getUserCustomerDetails();

      this.$store.state.customers = user_customers?.data?.getUserCustomers?.customer;

      // if (this.$store.state.user_type_id === 11 && this.$store.state.customers.length < 2) {
      //   this.$store.commit('clearStore');
      //   throw new Error(`Advocate isn't linked with any hub.`);
      // }

      this.$router.replace('/main').catch(() => {});

      /* connect to socket if have token */
      if (Socket.token()) Socket.connect(true);
    },
    async getUserCustomerDetails() {
      this.isLoading = true;
      try {
        return await this.$apollo
          .query({
            query: getUserCustomerDetails
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.loading.hide();
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.loading.hide();
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>

<style scoped>
.bg-facebook {
  background: #3b5998;
}
.text-logo {
  font-size: 32px;
  margin-top: 0;
}
.form-container {
  margin: 0 auto;
  width: 360px;
  height: auto;
  border: 1px solid #04565a;
  padding: 30px 30px 40px;
  border-radius: 15px;
  background: #ffffff;
}
.form-container .title {
  color: #04565a;
  text-align: left;
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 1rem;
}
.form-container .tagline {
  color: #9e9e9e;
  text-align: left;
  font-size: 13px;
  margin-bottom: 0.85rem;
}
.form-container .icon-color {
  color: #666666;
}
.form-container .txt-username {
  width: 100%;
  display: block;
  margin-bottom: 0.65rem;
  border: 1px solid #f0f0f0;
  border-radius: 0.35rem;
  padding: 0 1rem;
}
.form-container .txt-password {
  width: 100%;
  display: block;
  margin-bottom: 1.5rem;
  border: 1px solid #f0f0f0;
  border-radius: 0.35rem;
  padding: 0 1rem;
}
.form-container .forgot {
  text-align: right;
  margin-bottom: 1.5rem;
}
.form-container .forgot a {
  text-decoration: none;
  color: #666666;
}
.form-container .forgot a:hover {
  color: #666666;
}
.form-container .btn_login {
  background-color: #04565a;
  color: #ffffff;
  display: block;
  width: 100%;
  text-transform: uppercase;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-bottom: 1rem;
}
.logo-version-container {
  position: absolute;
  bottom: 0;
  right: 0;
}
.logo-version-container .logo-version {
  text-align: center;
}
.logo-version-container .logo-version .logo {
  width: 42px;
  height: 42px;
  border: 1px solid #ececec;
  border-radius: 0.25rem;
  margin-bottom: 0.135rem;
  background: #ffffff;
}
.logo-version-container .logo-version .version {
  color: #888;
  font-size: 11px;
}
@media only screen and (max-width: 599px) {
  .absolute-top-left {
    position: relative;
  }
  .vertical-center {
    position: relative;
    display: block;
    top: unset !important;
    left: unset !important;
    transform: translateX(0%) translateY(0%) !important;
  }
  .full-width {
    width: unset !important;
    height: unset !important;
  }
  .full-height {
    height: unset !important;
  }
  .top-logo {
    display: block;
    width: 100%;
  }
  .form-container {
    margin: 0 auto;
    display: block;
    width: 100%;
    max-width: 360px;
  }
  .logo-version-container {
    position: relative;
    text-align: center;
  }
}
</style>
