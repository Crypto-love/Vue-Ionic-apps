<template>
  <q-layout :class="this.$isMobile ? 'bg-white' : 'q-pa-xl window-height bg-grey-3'" view="lHh Lpr lFf">
    <div class="full-width full-height">
      <q-toolbar v-if="this.$isMobile">
        <q-btn
          flat
          round
          dense
          icon="eva-arrow-back-outline"
          class="text-black"
          size="12px"
          @click="goBack"
        />
        <div class="row q-px-sm text-h6 items-center text-black full-width" style="height: 56px" />
      </q-toolbar>

      <div v-else class="absolute-top-left top-logo column q-ma-md">
        <div class="col bg-primary" style="width: 35px; font-size: 5px; border-radius: 20px">&nbsp;</div>
        <div class="col q-mt-md text-h2 text-primary text-bold text-logo">TreeDots</div>
      </div>

      <div class="vertical-center">
        <div>
          <div :class="this.$isMobile ? 'form-container no-shadow' : 'form-container'">
            <q-form class="col-8 self-center">
              <div style="text-align: center">
                <q-img
                  src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/verifycode.png"
                  class="verify-icon"
                />
                <div class="title">Verify your number</div>
                <div class="tagline">
                  Please enter the verification code that has been sent to your phone number.
                </div>
                <div v-if="user && user.mobile" class="text-bold text-body2">
                  +{{ countryCode }} {{ user.mobile }}
                </div>
                <div class="row">
                  <div class="col-xs-3">
                    <div class="q-ml-sms q-mr-sm">
                      <q-input
                        v-model="code1"
                        type="number"
                        ref="code1"
                        pattern="[0-9]*"
                        maxlength="1"
                        class="text-center text-black code-input"
                        input-style="text-align: center; opacity: 1 !important"
                        color="primary"
                        :disable="fullCode.length != 0"
                        v-on:keyup.delete="onBackSpace('code1', code1)"
                      />
                    </div>
                  </div>
                  <div class="col-xs-3">
                    <div class="q-ml-sm q-mr-sm">
                      <q-input
                        v-model="code2"
                        type="number"
                        ref="code2"
                        pattern="[0-9]*"
                        maxlength="1"
                        class="text-center non-selectable code-input"
                        input-style="text-align: center"
                        color="primary"
                        :disable="fullCode.length != 1"
                        v-on:keyup.delete="onBackSpace('code2', code2)"
                      />
                    </div>
                  </div>
                  <div class="col-xs-3">
                    <div class="q-ml-sm q-mr-sm">
                      <q-input
                        v-model="code3"
                        type="number"
                        ref="code3"
                        pattern="[0-9]*"
                        maxlength="1"
                        class="text-center code-input"
                        input-style="text-align: center"
                        color="primary"
                        :disable="fullCode.length != 2"
                        v-on:keyup.delete="onBackSpace('code3', code3)"
                      />
                    </div>
                  </div>
                  <div class="col-xs-3">
                    <div class="q-ml-sm q-mr-sm">
                      <q-input
                        v-model="code4"
                        type="number"
                        ref="code4"
                        pattern="[0-9]*"
                        maxlength="1"
                        class="text-center code-input"
                        input-style="text-align: center"
                        color="primary"
                        :disable="fullCode.length < 3"
                        v-on:keyup.delete="onBackSpace('code4', code4)"
                      />
                    </div>
                  </div>
                </div>
                <div class="row items-center justify-center" style="font-size: 12px">
                  <div class="col-auto text-grey-7">Didn't get code?</div>
                  <q-btn
                    v-if="seconds <= 0"
                    class="col-auto"
                    flat
                    unelevated
                    dense
                    no-caps
                    :ripple="false"
                    label="Resend Code"
                    color="primary"
                    style="font-size: 12px"
                    @click="requestVerificationCode"
                  />
                </div>
                <div v-if="seconds > 0" class="text-bold" style="font-size: 12px">
                  Resend Code in 00:{{ ('0' + seconds).slice(-2) }}
                </div>
              </div>
            </q-form>
          </div>
        </div>
      </div>
      <div v-if="!this.$isMobile" class="logo-version-container column q-ma-md">
        <div class="logo-version">
          <q-img
            src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/app-logo.png"
            class="logo"
          />
          <div class="version">v.05.02.20</div>
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script>
import AlertMessage from './AlertMessage';
import { Api, cipher, signupNotif } from 'services';

export default {
  name: 'verify',
  data() {
    return {
      code1: null,
      code2: null,
      code3: null,
      code4: null,
      signingUp: false,
      seconds: 0,
      isEmpty: { code1: false, code2: false, code3: false, code4: false },
      encrypt: cipher()
    };
  },

  props: {
    user: {
      type: Object
    },
    countryCode: {
      type: Number | String
    }
  },

  computed: {
    fullCode() {
      let code = '';
      if (this.code1) code += this.code1;
      if (this.code2) code += this.code2;
      if (this.code3) code += this.code3;
      if (this.code4) code += this.code4;

      return code;
    }
  },

  watch: {
    seconds: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.seconds--;
          }, 1000);
        }
      },
      immediate: true // This ensures the watcher is triggered upon creation
    },

    code1(newVal, oldVal) {
      if (newVal) {
        this.requestFocus('code2');
        this.isEmpty.code1 = true;
      } else {
        this.setIsEmpty(() => (this.isEmpty.code1 = false));
      }
    },
    code2(newVal, oldVal) {
      if (newVal) {
        this.requestFocus('code3');
        this.isEmpty.code2 = true;
      } else {
        this.setIsEmpty(() => (this.isEmpty.code2 = false));
      }
    },
    code3(newVal, oldVal) {
      if (newVal) {
        this.requestFocus('code4');
        this.isEmpty.code3 = true;
      } else {
        this.setIsEmpty(() => (this.isEmpty.code3 = false));
      }
    },
    code4(newVal, oldVal) {
      if (newVal) {
        this.isEmpty.code4 = true;
        this.verifyCode();
      } else this.setIsEmpty(() => (this.isEmpty.code4 = false));
    }
  },

  mounted() {
    this.requestVerificationCode();
  },

  methods: {
    goBack() {
      if (this.signingUp) return;
      this.$emit('back');
    },

    requestFocus(ref) {
      setTimeout(
        function () {
          this.$refs[ref].focus();
        }.bind(this),
        10
      );
    },

    setIsEmpty(cb) {
      setTimeout(
        function () {
          cb();
        }.bind(this),
        200
      );
    },

    onBackSpace(ref, model) {
      if (!this.$refs.code4.value && !this.isEmpty.code4) {
        this.isEmpty.code4 = true;
        this.code3 = '';
        this.requestFocus('code3');
      } else if (!this.$refs.code3.value && !this.isEmpty.code3) {
        this.isEmpty.code3 = true;
        this.code2 = '';
        this.requestFocus('code2');
      } else if (!this.$refs.code2.value && !this.isEmpty.code2) {
        this.isEmpty.code2 = true;
        this.code1 = '';
        this.requestFocus('code1');
      } else if (!this.$refs.code1.value && !this.isEmpty.code1) {
        this.isEmpty.code1 = true;
      }
    },

    async requestVerificationCode() {
      this.$q.loading.show({
        message: 'Sending verification code'
      });

      const response = await Api.add('twv_Verifications', {
        To: `+${this.countryCode}${this.user.mobile}`,
        Channel: 'sms',
        Locale: 'en'
      });

      this.$q.loading.hide();

      if (response.status) this.seconds = 59;
      else this.$emit('failed', 'Cannot send verification code');
    },

    async verifyCode() {
      this.$q.loading.show({
        message: 'Verifying code'
      });

      const response = await Api.add('twv_VerificationCheck', {
        To: `+${this.countryCode}${this.user.mobile}`,
        Code: this.fullCode
      });

      const data = response.data[0];

      this.$q.loading.hide();

      if (response.status && data.valid) this.saveUserData();
      else this.$emit('failed', 'Wrong verification code');
    },

    async saveUserData() {
      this.$q.loading.show();
      this.signingUp = true;

      const payload = {
        ...this.user,
        mobile: `${this.countryCode}${this.user.mobile}`,
        password: this.encrypt(this.user.password)
      };

      const { status, message } = await this.$api.add('users', payload);

      this.signingUp = false;
      this.$q.loading.hide();

      if (status) {
        this.$emit('success');
        // Send notif to slack
        const notif = signupNotif(this.user);

        if (notif) {
        }
      } else {
        this.$emit('failed', message);
      }
    }
  }
};
</script>

<style scoped>
.text-logo {
  font-size: 32px;
  margin-top: 0;
}
.form-container {
  margin: 0 auto;
  width: 360px;
  height: auto;
  padding: 30px 30px 40px;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 0 6px 1px #aaa;
}
.no-shadow {
  box-shadow: 0 0 0px 0px !important;
}
.form-container .verify-icon {
  width: 100px;
  height: auto;
}
.form-container .title {
  color: #04565a;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.form-container .tagline {
  color: #9e9e9e;
  text-align: center;
  font-size: 13px;
  margin-bottom: 0.85rem;
}
.form-container .code-input {
  border-radius: 0 !important;
  background: none !important;
  outline: 0 !important;
  padding: 6px 0 !important;
  color: #04565a !important;
  font-size: 32px !important;
  display: inline-block;
}
.code-input .q-input-target {
  text-align: center !important;
}
.form-container .btn_verify {
  background-color: #04565a;
  color: #ffffff;
  display: block;
  width: 100%;
  text-transform: unset;
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
    min-width: 300px;
  }
  .logo-version-container {
    position: relative;
    text-align: center;
  }
}
</style>
