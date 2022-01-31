<template>
  <form-dialog :title="`Tier Pricing`" class="center modal-sm" id="#FormContainer">
    <q-form @submit.prevent="onSubmit" id="TierPricingForm">
      <div class="row">
        <div class="col-sm-12 sm-content">
          <div class="q-pb-md">
            <q-input v-model="formData.product.name" label="Product Name" dense readonly />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model="formData.quantity"
              label="Quantity"
              hint="default : 0"
              dense
              :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model="formData.discount"
              label="Discount"
              hint="default : 0.00"
              mask="#.######"
              fill-mask="0"
              reverse-fill-mask
              suffix="%"
              dense
              :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            />
          </div>
          <div class="q-pb-md">
            <q-input
              v-model="formData.rank"
              label="Rank"
              hint="default : 0"
              dense
              :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            />
          </div>
          <div class="row">
            <!-- <div class="col-sm-6 sm-content">
              <div class="q-pb-md q-pl-1">
                <q-toggle
                  v-model="formData.default"
                  label="Default"
                  left-label
                  :true-value="1"
                  :false-value="0"
                />                
              </div>
            </div> -->
            <div class="col-sm-6 sm-content">
              <div class="q-pb-md q-pl-1">
                <q-toggle
                  v-model="formData.active"
                  label="Active"
                  left-label
                  :true-value="1"
                  :false-value="0"
                />
              </div>
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
        <q-btn flat class="btn-cancel q-mr-sm" label="Cancel" v-close-popup />
        <q-btn flat class="btn-save" label="Save" type="submit" form="TierPricingForm" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormDialog from 'web/share/partial/FormDialog.vue';
import FormCard from 'web/share/partial/FormCard.vue';
import { Api } from 'services';
export default {
  components: {
    FormDialog,
    FormCard
  },
  props: {
    product: {
      type: Object,
      default: null
    },
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
        id: 0,
        sku_id: this.product.id,
        product: this.product,
        quantity: 0,
        discount: 0,
        rank: 0,
        default: 0,
        active: 0
      }
    };
  },
  computed: {
    isEdit() {
      return this.item !== null;
    }
  },
  watch: {},
  mounted() {
    if (this.item) {
      this.formData = {
        id: this.item.id,
        sku_id: this.item.product.id,
        product: this.item.product,
        quantity: this.item.quantity,
        discount: this.item.discount,
        rank: this.item.rank,
        default: this.item.default,
        active: this.item.active
      };
    }
    this.getData();
  },
  methods: {
    async getData() {},
    onSubmit() {
      if (this.isEdit) {
        this.$emit('on-submit-complete', this.formData, true);
      } else {
        this.$emit('on-submit-complete', this.formData, false);
      }
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
