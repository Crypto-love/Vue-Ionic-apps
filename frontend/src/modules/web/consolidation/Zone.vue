<template>
  <form-dialog title="Add Zones/Area Code" id="FormMaster" class="form-master modal-sm">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row justify-between">
        <div class="col-5 q-mb-md">
          <label class="form-label">Zone*</label>
          <q-input
            v-model="formData.name"
            lazy-rules
            :rules="[(val) => (!!val && NumberOnly(val)) || 'Please type number only']"
            dense
            placeholder="Code"
          />
        </div>
        <div class="col-5 q-mb-md">
          <label class="form-label">Area Code*</label>
          <q-input
            v-model="formData.description"
            lazy-rules
            dense
            :rules="[(val) => (!!val && val.length == 2) || 'Please type 2 character length']"
            placeholder="2 first digit of postal code"
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Cancel" class="btn-cancel q-mr-sm" v-close-popup /><q-btn
        flat
        label="Save"
        type="submit"
        class="btn-save"
        form="myForm"
      />
    </template>
  </form-dialog>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import FormDialog from 'web/share/partial/FormCard.vue';
import { isNumeric } from 'services';
export default {
  components: {
    FormCard,
    FormDialog
  },
  data() {
    return {
      formData: {
        name: null,
        description: null
      }
    };
  },
  methods: {
    onSubmit() {
      const payload = { ...this.formData };
      this.$emit('add-complete', payload);
    },
    NumberOnly(data) {
      return isNumeric(data);
    }
  }
};
</script>

<style scoped>
.toggle-label {
  color: #131313;
  font-weight: 500;
  display: block;
  text-align: right;
  padding-right: 10px;
}
.field-active {
  text-align: right;
}
.form-label {
  font-weight: 500;
  color: #131313;
}
.q-placeholder::placeholder {
  color: inherit;
  opacity: 0.35 !important;
}
</style>
