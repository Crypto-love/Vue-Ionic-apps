<template>
  <form-dialog :title="item ? 'Edit Data' : 'Add Data'" class="modal-md">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-xl">
        <div class="col-xs-6">
          <q-input
            v-model="formData.code"
            label="Product Code *"
            stack-label
            lazy-rules
            :rules="requiredRule"
          />
          <q-input
            v-model="formData.name"
            label="Product Name *"
            stack-label
            lazy-rules
            :rules="requiredRule"
          />
          <div class="row justify-start">
            <q-toggle v-model="formData.is_halal" label="Halal" color="primary" />
            <q-toggle v-model="formData.is_carton" label="Sold in Carton" color="primary" />
          </div>
          <div class="row justify-between items-center">
            <q-input
              class="col-4"
              v-model="formData.unit_price"
              label="Unit Price *"
              stack-label
              lazy-rules
              :rules="numericRules"
            >
              <template v-slot:prepend>
                <div>$</div>
              </template>
            </q-input>
            <div class="col-1 text-center text-h6">/</div>
            <q-input
              class="col-2"
              v-model="formData.unit"
              label="Unit *"
              stack-label
              lazy-rules
              :rules="requiredRule"
            />
            <q-input
              class="col-3"
              v-model="formData.unit_amount"
              label="Unit Amount *"
              stack-label
              lazy-rules
              :rules="numericRules"
            />
          </div>
          <div class="row q-gutter-x-md">
            <q-input
              v-model="formData.selling_unit"
              label="Selling Unit *"
              stack-label
              lazy-rules
              :rules="numericRules"
            >
              <template v-slot:prepend>
                <div>$</div>
              </template>
            </q-input>
            <q-input
              v-model="formData.quantity"
              label="Quantity *"
              stack-label
              lazy-rules
              :rules="numericRules"
            />
          </div>
          <div class="row justify-between items-center">
            <q-input
              class="col-3"
              v-model="formData.current_no_of_unit"
              label="Current No. of Unit *"
              stack-label
              lazy-rules
              :rules="numericRules"
            />
            <q-input
              class="col-3"
              v-model="formData.qmu"
              label="QMU *"
              stack-label
              lazy-rules
              :rules="numericRules"
            />
            <q-select
              class="col-3"
              v-model="formData.oom"
              :options="oomOptions"
              label="Measurement *"
              stack-label
              lazy-rules
              :rules="[(val) => !!val || 'Please pick something']"
            />
          </div>
          <q-input
            v-model="formData.package_size"
            label="Packaging Size *"
            stack-label
            lazy-rules
            :rules="numericRules"
          />
          <q-input v-model="formData.origin" label="Origin *" stack-label lazy-rules :rules="numericRules" />
        </div>
        <div class="col-xs-6">
          <q-input v-model="formData.description" label="Description" stack-label type="textarea" />
          <q-select
            v-model="formData.category_id"
            :options="categories"
            label="Category *"
            stack-label
            lazy-rules
            :rules="[(val) => !!val || 'Please pick something']"
          />
          <div class="row justify-between q-gutter-x-md">
            <q-input class="col-5" v-model="formData.remark" label="Remark" stack-label type="textarea" />
            <div class="col-5">
              <image-upload v-model="files" />
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
  </form-dialog>
</template>

<script>
import FormDialog from '../FormDialog';
import ImageUpload from '../ImageUpload';
import { isNumeric } from 'services';
export default {
  components: {
    FormDialog,
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
      oomOptions: ['Kg', 'g', 'Pcs'],
      categories: [],
      files: [],
      formData: {
        code: null,
        name: null,
        is_halal: false,
        is_carton: false,
        unit_price: null,
        unit: null,
        unit_amount: null,
        selling_unit: null,
        quantity: null,
        current_no_of_unit: null,
        qmu: null,
        oom: null,
        package_size: null,
        origin: null,
        description: null,
        category_id: null,
        remark: null,
        image: null
      },
      numericRules: [
        (val) => !!val || 'Please type something',
        (val) => isNumeric(val) || 'Please use numeric character only'
      ],
      requiredRule: [(val) => !!val || 'Please type something']
    };
  },
  mounted() {
    if (this.item) {
      this.formData = { ...this.item };
    }
  },
  methods: {
    onSubmit() {
      this.submitLoading = true;
      if (this.item) {
        this.$emit('edit-complete', this.formData);
      } else {
        this.$emit('add-complete', this.formData);
      }
    }
  }
};
</script>
