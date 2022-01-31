<template>
  <form-dialog :title="`Edit SKU`" class="FormContainer modal-md" id="#FormContainer">
    <q-form @submit.prevent="onSubmit" id="SkuForm">
      <div class="row">
        <div class="col-sm-6 sm-content">
          <div class="q-pb-md">
            <q-input
              v-model="formData.name"
              label="Sku Name"
              dense
              readonly
              hint="You can edit spec by clicking on this field"
              @click="onClickNameField"
            />
          </div>
          <div class="q-pb-md">
            <q-input v-model="formData.alias" label="Alias" hint="default : null" dense />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model="formData.price"
              label="Price"
              hint="default : 0"
              prefix="$"
              dense
              :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model="formData.weight"
              label="Weight (KG)"
              hint="default : 0"
              dense
              :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model.number="formData.increment_qty"
              label="Increment Qty"
              hint="default : 1"
              type="number"
              dense
              :rules="[(val) => (val >= 1 && val <= 50) || '1 => value =< 50']"
            />
          </div>
          <div class="q-pb-md">
            <q-select
              outlined
              v-model="selectedOom"
              stack-label
              :options="uom"
              option-label="name"
              option-value="id"
              label="OOM *"
              dense="dense"
              lazy-rules
              :rules="[(val) => !!val.name || 'Please select something']"
              hint="Order of Measurement"
            />
          </div>
          <div class="q-pb-md">
            <q-select
              outlined
              v-model="selectedUom"
              stack-label
              :options="uom"
              option-label="name"
              option-value="id"
              label="UOM *"
              dense="dense"
              lazy-rules
              :rules="[(val) => !!val.name || 'Please select something']"
              hint="Unit of Measurement"
            />
          </div>
          <div class="row">
            <div class="col-sm-6 sm-content">
              <div class="q-pb-md q-pl-1">
                <q-toggle
                  v-model="formData.halal"
                  label="Halal"
                  left-label
                  :true-value="1"
                  :false-value="0"
                />
              </div>
              <div class="q-pb-md q-pl-1">
                <q-toggle v-model="formData.b2c" label="B2C" left-label :true-value="1" :false-value="0" />
              </div>
            </div>
            <div class="col-sm-6 sm-content">
              <div class="q-pb-md q-pl-1">
                <q-toggle
                  v-model="formData.perishable"
                  label="Perishable"
                  left-label
                  :true-value="1"
                  :false-value="0"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-6 right-content">
          <div class="q-pr-md q-pl-md q-pb-md">
            <image-chooser v-model="productImage" />
          </div>
          <div class="q-pr-md q-pl-md q-pb-md text-center">
            <qrcode v-if="qr" :value="qr" :options="{ width: 200 }" />
          </div>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat class="btn-cancel q-mr-sm" label="Cancel" v-close-popup />
        <q-btn flat class="btn-save" label="Save" type="submit" form="SkuForm" />
      </template>
    </template>

    <q-dialog v-model="showSpecForm" persistent>
      <generate-sku title="Edit Spec" :item="specFormItem" @on-save="onEditSpec" />
    </q-dialog>
  </form-dialog>
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode';

import FormDialog from '../FormDialog';
import ImageUpload from '../ImageUpload';
import ImageChooser from '../ImageChooser';
import GenerateSku from './GenerateSku';
import { Api } from 'services';
export default {
  components: {
    FormDialog,
    ImageUpload,
    ImageChooser,
    GenerateSku,
    qrcode: VueQrcode
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
      uom: [],
      selectedUom: {},
      selectedOom: {},
      showSpecForm: false,
      productImage: null,
      formData: {
        id: null,
        name: null,
        alias: null,
        price: 0,
        weight: 0,
        increment_qty: 0,
        halal: 1,
        perishable: 0,
        uom_id: null,
        oom_id: null,
        image: {},
        specs: null,
        b2c: null
      }
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    },
    specFormItem() {
      if (this.isEditMode) {
        return {
          product_id: this.item.product_id,
          specs: this.formData.specs ? JSON.parse(this.formData.specs) : null
        };
      }
      return null;
    },
    qr() {
      if (this.isEditMode) {
        return `${this.formData.id};${this.formData.name}`;
      }
      return null;
    }
  },
  watch: {
    selectedUom(v) {
      this.formData.uom_id = v.id;
    },
    selectedOom(v) {
      this.formData.oom_id = v.id;
    }
  },
  mounted() {
    if (this.item) {
      this.formData = {
        id: this.item.id,
        name: this.item.product_name,
        alias: this.item.product_alias,
        price: this.item.price,
        weight: this.item.weight,
        increment_qty: this.item.increment_qty,
        halal: this.item.halal,
        perishable: this.item.perishable,
        uom_id: this.item.uom_id,
        oom_id: this.item.oom_id,
        specs: this.item.specs,
        b2c: this.item.b2c
      };
      this.selectedOom = { name: this.item.oom, id: this.item.oom_id };
      this.selectedUom = { name: this.item.uom, id: this.item.uom_id };
      this.productImage = this.item.image ? this.item.image.medium : null;
    }
    this.getData();
  },
  methods: {
    async getData() {
      const res = await Api.get('uom', 'active=1');
      this.uom = res.data;
    },
    onSubmit() {
      if (typeof this.productImage !== 'string') this.formData.image = this.productImage;
      this.$emit('edit-complete', this.formData);
    },
    onClickNameField() {
      this.showSpecForm = true;
    },
    onEditSpec(v) {
      const editedData = v[0];
      this.formData.name = editedData.name;
      this.formData.specs = JSON.stringify(editedData.specs);
      this.showSpecForm = false;
    }
  }
};
</script>

<style scoped>
.q-pr-1 {
  padding-right: 0.5rem;
}
.q-pl-1 {
  padding-left: 0.5rem;
}
.separator {
  border-bottom: 2px dashed #dedede;
  margin-bottom: 1rem;
  margin-top: 1rem;
}
.product-preview {
  border: 1px solid #dedede;
  background: #f8f8f8;
  border-radius: 15px;
  padding: 0.5rem 1rem;
}
.product-preview .title {
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #3cbe00;
  text-transform: uppercase;
}
.product-preview .subtitle {
  font-weight: 600;
  color: #131313;
}
.product-preview .value,
.product-preview .value-inline {
  color: #9d9d9d;
}
.product-preview .value-inline {
  display: inline-block;
  width: 50%;
  text-align: left;
}
.product-preview .halal {
  margin-top: 0.5rem;
  width: 30px;
  height: 30px;
}

@media only screen and (max-width: 600px) {
  .sm-content {
    width: 100%;
  }
  .q-pl-1 {
    margin-left: 0;
    padding-left: 0;
  }
  .q-pr-1 {
    margin-right: 0;
    padding-right: 0;
  }
}
</style>
