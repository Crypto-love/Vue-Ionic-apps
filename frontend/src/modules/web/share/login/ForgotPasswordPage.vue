<template>
  <q-layout class="q-pa-xl window-height bg-primary" view="lHh Lpr lFf">
    <div class="full-width full-height">
      <div class="absolute-top-left column q-ma-md">
        <div class="col bg-white" style="width: 55px; font-size: 10px; border-radius: 20px">&nbsp;</div>
        <div class="col q-mt-md text-h2 text-white text-bold">TreeDots</div>
      </div>
      <q-img
        class="absolute-bottom-right text-subtitle2 q-ma-md"
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/app-logo.png"
        style="width: 60px"
      />
      <q-img
        class="absolute-center"
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/bg_forgot_password.svg"
        style="max-width: 75%; max-height: 75%"
      ></q-img>
      <q-form class="vertical-center" @submit="onSubmit" ref="loginForm">
        <div class="col bg-white q-py-lg" style="border-radius: 16px">
          <div class="q-mx-md q-mt-md text-h6 text-primary text-center">Forgot Password ?</div>

          <div class="text-caption q-ma-lg text-center text-grey">
            Enter your email or phone number and we'll send you a link
            <br />or verification code to get back into your account.
          </div>

          <q-input
            class="q-mx-lg"
            v-model="email"
            placeholder="Email or Phone Number"
            outlined
            :rules="[(val) => (val && val.length > 0) || 'Email or Phone Number cannot be empty']"
          />

          <div class="q-mx-lg bg-primary q-mt-sm shadow-1" style="border-radius: 10px">
            <q-btn
              no-caps
              flat
              rounded
              type="submit"
              class="q-py-xs full-width"
              color="white"
              label="Send"
              disable
              :loading="sending"
            />
          </div>

          <div class="row q-mx-lg q-mt-lg items-center">
            <q-separator class="col" />
            <div class="col-auto q-mx-md text-grey">OR</div>
            <q-separator class="col" />
          </div>

          <div class="row q-ma-md text-grey justify-center items-center">
            <q-btn dense flat no-caps color="primary" label="Sign In Now" @click="goBack" />
          </div>
        </div>
      </q-form>
    </div>
  </q-layout>
</template>

<script>
import AlertMessage from '../partial/AlertMessage.vue';

export default {
  data() {
    return {
      email: '',
      sending: false
    };
  },
  methods: {
    goBack() {
      if (this.sending) return;
      window.history.back();
    },

    onSubmit() {
      if (this.sending) return;

      this.$refs.loginForm.validate().then((success) => {
        if (success) this.sendRequest();
        else
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'Failed',
            message: 'Please enter a valid email or phone number'
          });
      });
    },

    sendRequest() {
      this.sending = true;
      setTimeout(
        function () {
          this.sending = false;
          this.goBack();
        }.bind(this),
        1000
      );
    }
  }
};
</script>
