<template>
  <form-card
    title="Change Password"
    style="width: 600px !important; height: 360px !important; min-width: unset !important"
  >
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-12">
          <q-input
            class="text-caption"
            v-model="formData.last_password"
            :type="lastPasswordHide ? 'password' : 'text'"
            label="Last Password"
            lazy-rules
            outlined
            :rules="passwordRules"
          >
            <template v-slot:append>
              <q-icon
                :name="lastPasswordHide ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                @click="lastPasswordHide = !lastPasswordHide"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <router-link to="/forgot-password">
            <div class="text-right text-primary">Forgot Password ?</div>
          </router-link>
        </div>
        <div class="col-12 q-mt-md">
          <q-input
            class="text-caption"
            v-model="formData.new_password"
            :type="newPasswordHide ? 'password' : 'text'"
            label="New Password"
            lazy-rules
            outlined
            :rules="passwordRules"
          >
            <template v-slot:append>
              <q-icon
                :name="newPasswordHide ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                @click="newPasswordHide = !newPasswordHide"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
        <div class="col-12 q-mt-lg">
          <q-input
            class="text-caption"
            v-model="formData.confirm_password"
            :type="confirmPasswordHide ? 'password' : 'text'"
            label="Confirm New Password"
            lazy-rules
            outlined
            :rules="confirmPasswordRules"
          >
            <template v-slot:append>
              <q-icon
                :name="confirmPasswordHide ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                @click="confirmPasswordHide = !confirmPasswordHide"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" color="red" v-close-popup />
        <q-btn flat label="Save" color="primary" type="submit" form="myForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from '../partial/FormCard';
import { isNumeric } from 'services';
export default {
  components: {
    FormCard
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      formData: {
        last_password: null,
        new_password: null,
        confirm_password: null
      },
      passwordRules: [
        (val) => !!val || 'Please type something',
        (val) => val.length >= 6 || 'Minimum 6 characters'
      ],
      lastPasswordHide: true,
      newPasswordHide: true,
      confirmPasswordHide: true
    };
  },
  computed: {
    confirmPasswordRules() {
      return [
        ...this.passwordRules,
        (val) => val === this.formData.new_password || 'Password is not the same'
      ];
    }
  },
  methods: {
    onSubmit() {
      this.submitLoading = true;
      const payload = { ...this.formData };
      if (this.item) {
        this.$emit('edit-complete', payload);
      } else {
        this.$emit('add-complete', payload);
      }
    }
  }
};
</script>
<style scoped>
.router-link-active {
  text-decoration: none;
}
</style>
