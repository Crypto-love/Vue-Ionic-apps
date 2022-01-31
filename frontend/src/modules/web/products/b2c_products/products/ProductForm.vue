<template>
  <form-card
    :title="item ? 'Edit Master Product' : 'Add New Master Product'"
    class="product-form"
    style="width: 800px !important; height: 420px !important"
  >
    <q-form id="ProductForm" @submit.prevent="onSubmit">
      <div class="row justify-between q-col-gutter-md">
        <div class="col-6">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                outlined
                v-model="product_id"
                :options="filteredProduct"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                use-input
                clearable
                label="Products *"
                dense="dense"
                @filter="filterProduct"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                dense
                v-model="product_name"
                label="Name *"
                lazy-rules
                :rules="[(v) => !!v || 'Cannot be empty']"
              />
            </div>
            <div class="col-12">
              <q-select
                outlined
                v-model="category_id"
                :options="filteredCategory"
                option-label="category"
                option-value="id"
                map-options
                emit-value
                use-input
                clearable
                label="Categories *"
                dense="dense"
                @filter="filterCategory"
                lazy-rules
                :rules="[(v) => !!v || 'Cannot be empty']"
              />
            </div>
          </div>
        </div>
        <div class="col-6">
          <image-chooser class="col-6 q-mt-sm" v-model="product_image" />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn flat label="Save" type="submit" form="ProductForm" class="btn-save" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import { Api, Notice } from 'services';
import { Voucher } from 'services';
export default {
  components: {
    FormCard,
    ImageChooser
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
      selectedMainCategory: null,
      product_name: null,
      product_image: null,
      category_id: null,
      product_id: null,
      category: [],
      product: [],
      filteredCategory: [],
      filteredProduct: []
    };
  },
  mounted() {
    this.getCategory();
    this.getProduct();
    if (this.item) {
      this.category_id = this.item.category_id;
      this.product_name = this.item.name;
      this.product_image = this.item.image ? this.item.image.medium : null;
    }
  },
  watch: {
    product_id: function (val) {
      if (val != '') {
        this.getProductById(val);
      }
    }
  },
  methods: {
    filterCategory(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.filteredCategory = this.category;
        } else if (needle.length >= 2) {
          this.filteredCategory = this.category.filter((v) => v.category.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    filterProduct(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.filteredProduct = this.product;
        } else if (needle.length >= 2) {
          this.filteredProduct = this.product.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    async onSubmit() {
      if (this.item) {
        /** Payload product voucherify */
        const payloadProduct = {
          object: 'product',
          name: this.product_name
        };

        const payload = {
          id: this.item.id,
          name: this.product_name,
          category_id: this.category_id
        };
        if (this.product_image && typeof this.product_image !== 'string') {
          payload.image = this.product_image;
        }

        /** Update data to voucherify */
        const voucherifyRes = await Voucher.updateProduct(this.item.voucherify_id, payloadProduct);
        if (voucherifyRes.status) {
          Notice.ok('Voucherify product updated');
        } else {
          Notice.fail(voucherifyRes.message);
        }

        if (this.$store.state.tenant_id != null) {
          let tenant_id = this.$store.state.tenant_id;
          payload.tenant_id = tenant_id;
        } else {
          payload.tenant_id == null;
        }

        const cekProduct = await Api.get(`products`, `name='${this.product_name}'`);

        if (cekProduct.data.length <= 0) {
          payload.active = 2;
          Notice.fail('Your Edit Product Waiting Approval');
        } else {
        }

        this.$emit('edit-complete', payload);
      } else {
        /** Payload product voucherify */
        const payloadProduct = {
          object: 'product',
          name: this.product_name
        };

        /** Payload product */
        const payload = {
          name: this.product_name,
          image: this.product_image,
          category_id: this.category_id
        };

        /** Add data to voucherify */
        const voucherifyRes = await Voucher.addProduct(payloadProduct);
        if (voucherifyRes.status) {
          let voucherifyData = voucherifyRes.data[0];
          payload.voucherify_id = voucherifyData.id;
          // Notice.ok("New voucherify contact added");
        } else {
          Notice.fail(voucherifyRes.message);
        }

        if (this.$store.state.tenant_id != null) {
          let tenant_id = this.$store.state.tenant_id;
          payload.tenant_id = tenant_id;
        } else {
          payload.tenant_id == null;
        }

        // Checking products
        const cekProduct = await Api.get(`products`, `name='${this.product_name}'`);

        if (cekProduct.data.length <= 0) {
          payload.active = 2;
          Notice.fail('New Product Waiting Approval');
        } else {
        }

        this.$emit('add-complete', payload);
      }
    },
    async getCategory() {
      try {
        const res = await Api.get('v_categories');
        this.category = res.data;
        this.filteredCategory = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getProduct() {
      try {
        const res = await Api.get('v_products');
        this.product = res.data;
        this.filteredProduct = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getProductById(id) {
      try {
        const res = await Api.get('v_products', `id = ${id}`);
        const result = res.data[0];
        this.product_name = result.name;
        this.category_id = result.category_id;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
<style scoped>
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
</style>
