<template>
  <form-card
    title="Edit Account Profile"
    style="width: 600px !important; height: 510px !important; min-width: unset !important"
  >
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-xs">
        <div class="col-xs-6 q-pa-md">
          <q-input v-model="formData.first_name" label="First Name" lazy-rules :rules="nameRules">
            <template v-slot:prepend>
              <q-icon name="eva-person-outline" />
            </template>
          </q-input>
        </div>
        <div class="col-xs-6 q-pa-md">
          <q-input v-model="formData.last_name" label="Last Name" :rules="lastNameRules" lazy-rules />
        </div>
      </div>
      <div class="row q-col-gutter-ls">
        <div class="col-xs-6 q-pa-md">
          <q-input v-model="formData.email" label="Email" lazy-rules :rules="emailRules">
            <template v-slot:prepend>
              <q-icon name="eva-email-outline" />
            </template>
          </q-input>
        </div>
        <div class="col-xs-6 q-pa-md">
          <q-input v-model="formData.mobile" label="Phone" lazy-rules :rules="accountNumberRules">
            <template v-slot:prepend>
              <q-icon name="eva-phone-outline" />
            </template>
          </q-input>
        </div>
      </div>
      <div class="row q-col-gutter-xs">
        <div class="col-xs-12 col-md-6 q-pr-md">
          <q-field
            borderless
            label="Gender"
            stack-label
            lazy-rules
            :value="formData.gender"
            :rules="[(val) => !!val || 'Please choose something']"
          >
            <template v-slot:control>
              <q-option-group v-model="formData.gender" :options="genders" color="primary" />
            </template>
          </q-field>
          <q-input
            readonly
            label="Birth Date"
            v-model="formData.birth_date"
            mask="####-##-##"
            :rules="[(val) => !!val || 'Please pick date']"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="formData.birth_date" @input="() => $refs.qDateProxy.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-xs-6 q-pa-md">
          <q-card bordered flat class="q-pa-xs">
            <image-upload :value="image" @input="updateImage" />
          </q-card>
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
import FormCard from '../partial/FormCard.vue';
import ImageUpload from '../partial/ImageUpload.vue';
import { isNumeric, isEmailValid, isValidName } from 'services';
export default {
  components: {
    FormCard,
    ImageUpload
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
        first_name: null,
        last_name: null,
        mobile: null,
        email: null,
        gender: null,
        birth_date: null,
        image: null
      },
      genders: [
        {
          label: 'Male',
          value: 'm'
        },
        {
          label: 'Female',
          value: 'f'
        }
      ],
      nameRules: [(v) => !!v || 'Please type something', (v) => isValidName(v) || 'Invalid characters'],
      lastNameRules: [(v) => v.length === 0 || isValidName(v) || (v && 'Invalid characters')],
      accountNumberRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ],
      emailRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isEmailValid(v) || 'Please use valid email'
      ]
    };
  },
  mounted() {
    const { id, first_name, last_name, mobile, email, gender, birth_date, image } = this.item;
    this.formData = {
      id,
      first_name,
      last_name,
      mobile,
      email,
      gender,
      birth_date,
      image
    };
  },
  computed: {
    image: {
      get() {
        return this.formData.image;
      },
      set(v) {
        this.formData.image = v;
      }
    }
  },
  methods: {
    onSubmit() {
      this.submitLoading = true;
      this.$emit('submit', { ...this.item, ...this.formData });
    },
    updateImage(val) {
      this.image = val;
    }
  }
};
</script>
<style scoped>
.avatar-container {
  background-color: #e4e4e4;
}
</style>
