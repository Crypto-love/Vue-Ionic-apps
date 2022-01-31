<template>
  <form-card
    :title="item ? 'Edit PIC' : 'Add PIC'"
    style="height: 480px; width: 460px; min-width: unset; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="personForm">
      <div class="row justify-between q-col-gutter-md">
        <q-input
          v-model="formData.first_name"
          class="col-6"
          label="First Name *"
          lazy-rules
          :rules="[(val) => !!val || 'Please type something']"
          dense
        />
        <q-input v-model="formData.last_name" class="col-6" label="Last Name" lazy-rules :rules="[]" dense />
      </div>
      <div class="col row items-center q-mt-sm q-py-sm" style="border-bottom: 0.5px solid silver">
        <vue-tel-input
          v-model="formData.phone"
          enabledCountryCode
          validCharactersOnly
          required
          type="number"
          pattern="[0-9]*"
          placeholder="Phone"
          wrapperClasses="col no-border	no-box-shadow"
          ref="phone-field"
          inputId="phone-field"
          disabledFetchingCountry
          :preferredCountries="$helper.getPreferedCountryCode()"
          :defaultCountry="defaultCountry"
          :maxLen="20"
          @country-changed="(val) => (countryCode = val.dialCode)"
        />
      </div>
      <q-input v-model="formData.fax" label="Fax" type="number" dense lazy-rules :rules="faxRules" />
      <q-input
        v-model="formData.email"
        label="Customer Email (Optional)"
        dense
        lazy-rules
        :rules="emailRules"
      />
      <q-select
        v-model="formData.position"
        label="Position"
        :options="positions"
        :option-disable="
          !item
            ? (v) => v == 'Key Contact' && keyContactExist
            : (v) => v == 'Key Contact' && keyContactExist && item.position != 'Key Contact'
        "
        :rules="[(v) => !!v || 'Position cannot be empty']"
        dense
      />

      <div class="row justify-between">
        <q-toggle v-model="formData.active" label="Activate" left-label :true-value="1" :false-value="0" />
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
      <q-btn flat label="Save" class="btn-save" type="submit" form="personForm" />
    </template>
  </form-card>
</template>

<script>
import { Api, Notice } from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import { isEmailValid, isNumeric } from 'services';
export default {
  components: {
    FormCard
  },
  props: {
    item: {
      type: Object,
      default: null
    },
    keyContactExist: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      positions: this.$helper.getPositions(),
      countryCode: null,
      defaultCountry: '',
      formData: {
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        fax: null,
        active: 1,
        position: null
      },
      phoneRules: [
        (v) => !!v || 'Phone cannot be empty',
        (v) => isNumeric(v) || 'Must be numeric',
        (v) => v.length >= 5 || 'Phone must be at least 5 characters'
      ],
      faxRules: [
        (v) => {
          if (!v) return true;
          if (v && isNumeric(v)) return true;
          return 'Must be numeric';
        },
        (v) => {
          if (!v) return true;
          if (v && v.length > 5) return true;
          return 'Fax must be at least 5 characters';
        }
      ],
      emailRules: [
        (v) => {
          if (!v) return true;
          if (v && isEmailValid(v)) return true;
          return 'Must be a valid email';
        }
      ]
    };
  },
  watch: {
    'formData.first_name': function (val) {
      this.formData.first_name = val ? val.removeSpecialCharacter() : '';
    },
    'formData.last_name': function (val) {
      this.formData.last_name = val ? val.removeSpecialCharacter() : '';
    },
    'formData.email': function (val) {
      this.formData.email = val ? val.removeSpecialCharacter() : '';
    },
    'formData.phone': function (val) {
      /* Remove all non-numeric character */
      this.formData.phone = val ? val.replace(/\D/g, '') : '';

      /* Remove first char of phone number if it start with 0 */
      if (this.formData.phone.length > 0 && this.formData.phone[0] == '0')
        this.formData.phone = this.formData.phone.substring(1);
    }
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },
  mounted() {
    if (this.isEditMode) {
      this.formData = { ...this.item };
      delete this.formData.id;

      this.splitPhoneAndCountryCode(this.formData.phone);
    }
  },
  methods: {
    splitPhoneAndCountryCode(fullPhoneNumber) {
      this.countryCode =
        fullPhoneNumber.length > 8 ? fullPhoneNumber.substring(0, 2) : this.$helper.getDefaultCountryCode();

      const country = this.$helper.findObjectByKey(
        this.$refs['phone-field'].allCountries, // List country
        'dialCode', // Key to find
        this.countryCode // value to find
      );

      this.defaultCountry = country ? country.iso2 : null;
      this.formData.phone =
        country && fullPhoneNumber.length > 8
          ? fullPhoneNumber.substring(2, fullPhoneNumber.length)
          : fullPhoneNumber;

      this.$refs['phone-field'].choose(this.defaultCountry);
    },

    onSubmit() {
      this.$emit('submit', {
        ...this.formData,
        country_code: this.countryCode,
        id: this.item ? this.item.id : undefined,
        user_id: this.$store.state.id
      });
    }
  }
};
</script>
<style scoped>
.pic-form {
  position: relative;
}
.card-action {
  display: block;
  width: 100%;
  position: relative;
  text-align: right;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 0.5rem;
}
.btn-save {
  color: #ffffff;
  background: #04565a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-cancel {
  color: #666666;
  background: #e4e4e4;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.q-field--with-bottom {
  padding-bottom: 15px;
}
</style>
