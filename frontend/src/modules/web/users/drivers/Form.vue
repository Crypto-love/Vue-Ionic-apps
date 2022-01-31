<template>
  <form-card :title="item ? 'Edit Data' : 'Add Data'">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-lg">
        <div class="col-6">
          <q-input
            v-model="formData.tookan_id"
            label="Tookan ID *"
            hint="ex: 89776"
            lazy-rules
            stack-label
            :rules="tookanIdRules"
          />
          <q-input v-model="formData.name" label="Driver Name *" lazy-rules stack-label :rules="nameRules" />
          <q-field
            v-model="formData.gender"
            label="Gender *"
            stack-label
            borderless
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please input something']"
          >
            <template v-slot:control>
              <q-option-group v-model="formData.gender" :options="genders" color="primary" />
            </template>
          </q-field>
        </div>
        <div class="col-6">
          <q-input
            v-model="formData.report_time"
            label="Report Time *"
            mask="time"
            :rules="[(val) => (val && val.length > 0) || 'Please pick time']"
            hint="Click on the clock icon to open time picker"
          >
            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer"></q-icon>
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time v-model="formData.report_time" />
              </q-popup-proxy>
            </template>
          </q-input>
          <image-upload class="q-mt-lg" v-model="files" />
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
import ImageUpload from 'web/share/partial/ImageUpload.vue';
import { isNumeric, isValidName } from 'services';
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
      files: [],
      formData: {
        tookan_id: null,
        name: null,
        mobile: null,
        gender: null,
        report_time: null,
        avatar: null
      },
      nameRules: [(v) => !!v || 'Please type something', (v) => isValidName(v) || 'Invalid characters'],
      genders: [
        { label: 'Male', value: 'm' },
        { label: 'Female', value: 'f' }
      ],
      tookanIdRules: [
        (val) => (val && val.length > 0) || 'Please type something',
        (val) => isNumeric(val) || 'Please use numeric character only'
      ]
    };
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
