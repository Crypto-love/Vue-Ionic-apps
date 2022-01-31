<template>
  <q-card padding style="width: 450px; max-width: 450px">
    <q-card-section>
      <span class="text-weight-medium text-title text-h6">
        {{ type ? 'Change Password' : 'Set Password' }}
      </span>
    </q-card-section>
    <q-card-section class="row q-py-sm">
      <div class="q-mb-xs">{{ type ? 'Enter New Password' : 'Enter Password' }}</div>
      <q-input
        style="width: 80%"
        :type="isNewPwd ? 'password' : 'text'"
        v-model="newPassword"
        stack-label
        dense
        outlined
        lazy-rules
        :rules="[(val) => !!val || 'Please type something']"
      >
        <template v-slot:append>
          <q-icon
            :name="isNewPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isNewPwd = !isNewPwd"
          />
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="row q-py-sm q-mb-md">
      <div class="q-mb-xs">Confirm Password</div>
      <q-input
        style="width: 80%"
        :type="isConPwd ? 'password' : 'text'"
        v-model="confirmPassword"
        stack-label
        dense
        outlined
        lazy-rules
        :rules="[(val) => !!val || 'Please type something']"
      >
        <template v-slot:append>
          <q-icon
            :name="isConPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isConPwd = !isConPwd"
          />
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="row col-12">
      <div class="q-pr-md col-6" v-close-popup>
        <q-btn
          label="Cancel"
          text-color="grey-8"
          outline
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="$emit('close')"
        />
      </div>
      <div class="q-pl-md col-6">
        <q-btn
          :label="type ? 'Change Password' : 'Set Password'"
          color="primary"
          rounded
          class="q-px-sm text-capitalize full-width"
          @click="setPwd()"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { createNewSupplierUserPassword } from 'treeGQL';
import { cipher } from 'services';
export default {
  components: {},
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    type: {
      type: [Boolean],
      default: true
    }
  },
  data() {
    return {
      newPassword: null,
      confirmPassword: null,
      encrypt: cipher(),
      isNewPwd: true,
      isConPwd: true
    };
  },
  methods: {
    async setPwd() {
      if (this.type) {
        if (this.newPassword !== null && this.newPassword === this.confirmPassword) {
          const password = this.encrypt(this.newPassword);
          const updateUserPassword = await new Promise((resolve, reject) => {
            return this.$apollo
              .mutate({
                mutation: createNewSupplierUserPassword,
                variables: {
                  userId: parseInt(this.id),
                  newPassword: password
                }
              })
              .then((res) => {
                return resolve(res?.data?.createNewSupplierUserPassword);
              })
              .catch((err) => {
                return reject(err?.message);
              });
          });
          if (updateUserPassword.id) {
            this.$q.notify('Successfully updated!');
            this.$emit('update');
          } else {
            this.$q.notify('Failed to update!');
          }
        } else if (this.newPassword === null || this.confirmPassword === null) {
          this.$q.notify('Please input password');
        } else if (this.newPassword !== this.confirmPassword) {
          this.$q.notify('Not Match between New Password and Confirm Password.');
        }
      } else {
        if (this.newPassword !== null && this.newPassword === this.confirmPassword) {
          this.$emit('update', this.newPassword);
        } else if (this.newPassword === null || this.confirmPassword === null) {
          this.$q.notify('Please input password');
        } else if (this.newPassword !== this.confirmPassword) {
          this.$q.notify('Not Match between New Password and Confirm Password.');
        }
      }
    }
  }
};
</script>
<style scoped></style>
