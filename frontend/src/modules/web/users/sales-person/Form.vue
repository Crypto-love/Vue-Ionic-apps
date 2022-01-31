<template>
  <form-card :title="item ? 'Edit Data' : 'Add Data'">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-lg">
        <div class="col-6">
          <q-input
            v-model="formData.sales_person_code"
            label="Sales Person Code *"
            hint="ex: 8512"
            lazy-rules
            :rules="codeRules"
          />
          <q-input v-model="formData.name" label="Name *" lazy-rules :rules="nameRules" />
          <q-input
            v-model="formData.phone"
            label="Phone Number *"
            mask="###############"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please type something']"
          />
          <q-field label="Gender" value="asd" :rules="[(val) => (val && val.length > 0) || 'Required']">
            <template v-slot:control>
              <q-option-group v-model="formData.gender" :options="genderOption" color="primary" />
            </template>
          </q-field>
        </div>
        <div class="col-6">
          <q-input v-model="formData.email" label="Email *" lazy-rules :rules="emailRules" />
          <q-input
            v-model="formData.password"
            type="password"
            label="Password *"
            lazy-rules
            :rules="passwordRules"
            :disable="this.item !== null"
          />
          <div>
            <div class="text-center">
              <q-img
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/man.png"
                spinner-color="white"
                style="width: 120px"
              />
            </div>
            <div class="text-center q-mt-md">
              <q-btn outline color="black" @click="$refs.photoInput.$el.click()">Choose Image</q-btn>
              <q-input
                ref="photoInput"
                @input="
                  (val) => {
                    file = val[0];
                  }
                "
                type="file"
                style="display: none"
              />
            </div>
          </div>
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
import FormCard from 'web/share/partial/FormCard.vue';
import { isEmailValid, isNumeric, isValidName } from 'services';
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
        sales_person_code: null,
        name: null,
        phone: null,
        gender: '',
        email: null,
        password: null,
        avatar: null
      },
      file: null,
      genderOption: [
        {
          label: 'Male',
          value: 'M'
        },
        {
          label: 'Female',
          value: 'F'
        }
      ],
      nameRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isValidName(v) || 'length must bigger than 3'
      ],
      codeRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ],
      emailRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isEmailValid(v) || 'Please use valid email'
      ]
    };
  },
  computed: {
    passwordRules() {
      if (!this.item) {
        return [(val) => (val && val.length > 0) || 'Please type something'];
      }
      return null;
    }
  },
  mounted() {
    if (this.item) {
      this.formData = this.item;
    }
  },
  methods: {
    onSubmit() {
      this.submitLoading = true;
      setTimeout(() => {
        if (this.item) {
          this.$emit('edit-complete', this.formData);
        } else {
          this.$emit('add-complete', this.formData);
        }
      }, 2000);
    }
  }
};
</script>
