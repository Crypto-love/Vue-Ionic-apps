<template>
  <form-card :title="isEditMode ? 'Edit User' : 'Add New User'">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <!-- <div class="text-body1 text-weight-medium">1) User Info</div> -->
          <div class="row">
            <div class="col-md-6">
              <q-input
                type="text"
                v-model="formData.first_name"
                placeholder="First Name *"
                stack-label
                lazy-rules
                :rules="nameRules"
              >
                <template v-slot:before>
                  <q-icon name="eva-person-outline" />
                </template>
              </q-input>
            </div>
            <div class="col-md-6">
              <q-input
                type="text"
                v-model="formData.last_name"
                placeholder="Last Name"
                stack-label
                lazy-rules
                :rules="lastNameRules"
              >
                <template v-slot:before></template>
              </q-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-5">
              <q-input
                type="text"
                v-model="formData.countryCode"
                placeholder="Country Code *"
                stack-label
                lazy-rules
                :rules="accountNumberRules"
                style="width: 110%"
              >
                <template v-slot:before>
                  <q-icon name="eva-phone-outline" />
                </template>
              </q-input>
            </div>
            <div class="col-md-6">
              <q-input
                type="text"
                v-model="formData.mobile"
                placeholder="Phone Number *"
                stack-label
                lazy-rules
                :rules="accountNumberRules"
                style="margin-left: 30px"
              >
              </q-input>
            </div>
          </div>
          <q-select
            v-model="formData.country_id"
            :options="listCountry"
            option-label="description"
            option-value="id"
            map-options
            emit-value
            label="Select Country"
            :rules="countryRules"
          >
            <template v-slot:before>
              <q-icon name="eva-globe-2-outline" />
            </template>
          </q-select>

          <q-input
            type="email"
            v-model="formData.email"
            placeholder="Email"
            :rules="emailRules"
            stack-label
            lazy-rules
          >
            <template v-slot:before>
              <q-icon name="eva-email-outline" />
            </template>
          </q-input>
          <q-input type="text" v-model="formData.username" placeholder="Username" stack-label lazy-rules>
            <template v-slot:before>
              <q-icon name="eva-person-done-outline" />
            </template>
          </q-input>
          <q-input
            :type="showPassword ? 'password' : 'text'"
            v-model="plainPassword"
            placeholder="Password *"
            stack-label
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
          >
            <template v-slot:before>
              <q-icon name="eva-lock-outline" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'eva-eye-outline' : 'eva-eye-off-outline'"
                @click="showPassword = !showPassword"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <div class="row">
            <div class="col-md-8">
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
            </div>
            <div class="col-md-4">
              <div class="col-auto column justify-center items-center">
                <q-img
                  class="col-auto q-mt-md"
                  placeholder-src="https://cdn3.iconfinder.com/data/icons/outline-style-1/512/profile-512.png"
                  :src="photoUrl"
                  style="height: 100px; width: 100px; border-radius: 50%"
                >
                  <div
                    style="border-radius: 50%; border: 4px solid green"
                    class="absolute-full bg-transparent text-subtitle2 flex flex-center"
                  />
                </q-img>

                <div style="text-align: center">
                  <q-btn
                    dense
                    fab-mini
                    text-color="grey-1"
                    icon="eva-image-outline"
                    @click="() => $refs.photoInput.pickFiles()"
                    style="transform: translate(32px, -36px); background-color: green"
                  />
                  <q-uploader
                    ref="photoInput"
                    @added="onPhotoChanged"
                    accept="image/*"
                    style="display: none"
                  />
                </div>
              </div>
            </div>
          </div>
          <q-input
            v-model="formData.birth_date"
            label="Birth Date *"
            mask="####-##-##"
            :rules="[(val) => !!val || 'Please choose something']"
            dense
            class="form-group mb-2 q-pb-sm"
          >
            <q-menu self="bottom left">
              <q-date mask="YYYY-MM-DD" v-model="formData.birth_date" dense class="form-group">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-menu>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
            </template>
          </q-input>
          <div class="row items-center justify-between">
            <div class="col-8 q-pr-md">
              <q-select
                v-model="selectedUserType"
                :options="userTypes"
                label="User Type *"
                stack-label
                lazy-rules
                :rules="[(val) => !!val || 'Please choose something']"
                option-label="name"
                option-value="id"
                map-options
              />
              <q-select
                v-show="formData.user_type_id === 6"
                v-model="selectedBuyerType"
                :options="buyerTypes"
                label="Buyer Type *"
                stack-label
                lazy-rules
                map-options
                :rules="formData.user_type_id === 6 ? [(val) => !!val || 'Please choose something'] : []"
              />
            </div>
            <div class="col-4 q-pr-md">
              <q-toggle
                v-model="formData.active"
                label="Activate"
                left-label
                :true-value="1"
                :false-value="0"
              />
            </div>
          </div>
          <q-btn
            class="full-width q-mt-md"
            color="primary"
            type="submit"
            form="myForm"
            :loading="submitLoading"
          >
            Save User Info
            <template v-slot:loading> <q-spinner-hourglass class="on-left" />Loading... </template>
          </q-btn>
        </div>
        <div class="col-xs-12 col-md-8 q-pl-md-md q-mt-xs-lg q-mt-md-none">
          <div class="q-mt-lg">
            <role-table :user-id="formData.id" :disabled="!isEditMode" />
          </div>
          <!-- <div class="q-mt-lg">
            <customer-table :user-id="formData.id" :disabled="!isEditMode" />
          </div> -->
          <div v-show="savedUserTypeId == 2" class="q-mt-lg">
            <tenant-table :user-id="formData.id" :disabled="!isEditMode" />
          </div>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Close" color="red" @click="$emit('close')" />
    </template>
    <!--Crop box -->
    <q-dialog v-model="showCropBox" persistent full-height @hide="onHideDialog">
      <crop-box :src="src" v-if="showCropBox" @submit="onCrop" />
    </q-dialog>
  </form-card>
</template>

<script>
import {
  Api,
  Notice,
  fileToBase64,
  cipher,
  decipher,
  isEmailValid,
  isNumeric,
  isValidName,
  isValidCountry
} from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import CropBox from 'web/share/partial/CropBox.vue';
import RoleTable from './RoleTable.vue';
import CustomerTable from './CustomerTable.vue';
import TenantTable from './TenantTable.vue';

export default {
  components: {
    FormCard,
    RoleTable,
    CustomerTable,
    TenantTable,
    CropBox
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      photoUrl: null,
      birthDate: new Date(),
      submitLoading: false,
      roles: [],
      customers: [],
      selectedUserType: null,
      selectedBuyerType: null,
      showPassword: true,
      formData: {
        id: null,
        first_name: null,
        last_name: null,
        username: null,
        email: null,
        password: null,
        countryCode: null,
        mobile: null,
        country_id: null,
        gender: 'm',
        birth_date: null,
        image: null,
        user_type_id: null,
        active: 1,
        buyer_type: null
      },
      newPhoto: null,
      showCropBox: false,
      src: null,
      nameRules: [(v) => !!v || 'Please type something', (v) => isValidName(v) || 'Invalid characters'],
      lastNameRules: [(v) => v.length === 0 || isValidName(v) || (v && 'Invalid characters')],
      countryRules: [
        (v) => !!v || 'Please select country',
        (v) => isValidCountry(v) || 'Currently we only support Singapore & Malaysia'
      ],
      accountNumberRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ],
      emailRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isEmailValid(v) || 'Please use valid email'
      ],
      userTypes: [
        {
          id: 1,
          name: 'super admin'
        },
        {
          id: 2,
          name: 'administrator'
        }
      ],
      buyerTypes: [
        {
          label: 'ALL',
          value: 0
        },
        {
          label: 'B2B',
          value: 1
        },
        {
          label: 'B2C',
          value: 2
        }
      ],
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
      listCountry: [],
      encrypt: cipher(),
      decrypt: decipher(),
      savedUserTypeId: null
    };
  },
  computed: {
    isEditMode() {
      return this.id !== null || this.formData.id !== null;
    },
    plainPassword: {
      get() {
        return this.formData.password ? this.decrypt(this.formData.password) : '';
      },
      set(val) {
        this.formData.password = this.encrypt(val);
      }
    }
  },
  watch: {
    selectedUserType(v) {
      this.formData.user_type_id = v.id;
    },
    selectedBuyerType(v) {
      this.formData.buyer_type = v && v.value ? v.value : null;
    }
  },
  mounted() {
    this.getData();
    this.getListCountry();
  },
  methods: {
    async getData() {
      if (this.isEditMode) {
        await this.getUsersDetail();
      }
    },
    async getUsersDetail() {
      try {
        const res = await Api.get('users', `id = ${this.id}`);
        if (!res.status) {
          throw res.message;
        }

        /**
         * We separate keys that is not needed by the formdata
         * If we don't there will be error when updating data
         */
        const { image, ...data } = res.data[0];
        this.photoUrl = image ? image.medium : null;
        this.selectedUserType = this.userTypes.find((v) => v.id === data.user_type_id);
        this.selectedBuyerType = this.buyerTypes.find((v) => v.value === data.buyer_type);
        this.formData = { ...data };
        this.savedUserTypeId = this.formData.user_type_id;
        this.formData.countryCode = this.formData.mobile.slice(0, 2);
        this.formData.mobile = this.formData.mobile.slice(2);
        if (!this.formData.birth_date) this.formData.birth_date = '1990-01-01';
        if (!this.formData.gender) this.formData.gender = 'm';
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getUserType() {
      try {
        const res = await Api.get('user_types');
        this.userTypes = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getListCountry() {
      try {
        const res = await Api.get('countries');
        this.listCountry = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async onSubmit() {
      this.submitLoading = true;
      if (this.isEditMode) {
        this.selectedUserType = this.userTypes.find((v) => v.id === this.formData.user_type_id);

        const res = await this.edit();

        if (!res.status) {
          Notice.fail(res.message);
        } else {
          this.$emit('edit-complete', res.data[0].id);
          this.savedUserTypeId = this.formData.user_type_id;
          Notice.ok('User edited successfully');
        }
      } else {
        const res = await this.add();
        if (!res.status) {
          Notice.fail(res.message);
        } else {
          this.formData.id = res.data[0].id; // Set isEditMode flag to true
          this.savedUserTypeId = this.formData.user_type_id;
          this.$emit('add-complete', res.data[0].id);
          Notice.ok('User added successfully');
        }
      }
      this.submitLoading = false;
    },
    onCrop(results) {
      this.photoUrl = results.large;
      this.newPhoto = results;

      this.onHideDialog();
    },
    onHideDialog() {
      this.src = null;
      this.showCropBox = false;

      // Reset queue so we can choose file again
      this.$refs.photoInput.reset();
      this.$refs.photoInput.removeQueuedFiles();
    },
    async onPhotoChanged(val) {
      if (val.length == 0) return;

      if (!val[0].type.includes('image')) {
        this.showDialog('Failed', 'File type must be image');
        return;
      }

      this.src = await fileToBase64(val[0]);
      this.showCropBox = true;
    },
    async add() {
      if (this.formData.user_type_id != 6) delete this.formData.buyer_type;
      const { id, ...payload } = this.formData;
      payload.image = this.newPhoto;
      payload.mobile = payload.countryCode + payload.mobile;
      delete payload.countryCode;
      const res = await Api.add('users', payload);
      return res;
    },
    async edit() {
      if (this.formData.user_type_id != 6) delete this.formData.buyer_type;
      const { ...payload } = this.formData;
      payload.image = this.newPhoto;
      payload.mobile = payload.countryCode + payload.mobile;
      delete payload.countryCode;
      const res = await Api.update('users', payload, this.formData.id);
      return res;
    }
  }
};
</script>
