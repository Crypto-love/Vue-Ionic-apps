<template>
  <form-dialog :title="title" class="multiple-sku modal-md">
    <q-form @submit.prevent="onSubmit">
      <div class="row justify-between q-col-gutter-xl">
        <div class="col-sm-5">
          <div style="background: #ffffff">
            <q-form @submit.prevent="onAddSpec" id="addSpecForm" ref="addSpecForm">
              <div class="form-group q-mb-sm">
                <div class="form-label">
                  Product
                  <span class="require">*</span>
                </div>
                <q-select
                  outlined
                  dense
                  v-model="selectedProduct"
                  :options="filteredProducts"
                  option-label="name"
                  option-value="id"
                  map-options
                  label="Choose one"
                  lazy-rules
                  :rules="[(v) => !!v || 'Please choose something']"
                  :loading="isLoading"
                  use-input
                  input-debounce="0"
                  @filter="filterProduct"
                  :readonly="isEditMode"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">No results</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="form-group q-mb-sm">
                <div class="form-label">
                  Specs Name
                  <span class="require">*</span>
                </div>
                <q-select
                  outlined
                  dense
                  v-model="selectedSpec"
                  :options="filteredSpecs"
                  option-label="name"
                  option-value="id"
                  map-options
                  lazy-rules
                  :rules="[(v) => !!v || 'Please choose something']"
                  label="Choose one"
                  :loading="isLoading"
                  use-input
                  input-debounce="0"
                  @filter="filterSpec"
                />
              </div>
              <template v-if="selectedSpec && selectedSpec.name !== 'Packaging'">
                <div class="form-group q-mb-sm">
                  <div class="form-label">
                    Value
                    <span class="require">*</span>
                  </div>
                  <q-select
                    outlined
                    dense
                    :multiple="!isEditMode"
                    :use-chips="!isEditMode"
                    v-model="selectedValue"
                    :options="filteredValues"
                    lazy-rules
                    :rules="[(v) => !!v || 'Please choose something']"
                    label="Choose One"
                    use-input
                    input-debounce="0"
                    @filter="filterValue"
                  />
                </div>
                <div class="form-group q-mb-sm text-right">
                  <q-btn color="primary" type="submit" form="addSpecForm">Add</q-btn>
                </div>
              </template>
              <template v-else-if="selectedSpec">
                <div class="form-group q-mb-sm">
                  <div class="form-label">
                    Packaging
                    <span class="require">*</span>
                  </div>
                  <div class="row">
                    <div class="col">
                      <q-input
                        v-model="packaging_1"
                        lazy-rules
                        :rules="[(v) => !!v || 'Please choose something']"
                        outlined
                        dense
                      />
                    </div>
                    <span style="margin-top: 8px; margin-left: 5px; margin-right: 5px">x</span>
                    <div class="col">
                      <q-input v-model="packaging_2" outlined dense />
                    </div>
                    <span style="margin-left: 5px; margin-right: 5px"></span>
                    <div class="col">
                      <q-select
                        v-model="packaging_3"
                        :options="uoms"
                        lazy-rules
                        :rules="[(v) => !!v || 'Please choose something']"
                        outlined
                        dense
                      />
                    </div>
                  </div>
                </div>
                <div class="form-group q-mb-sm text-right">
                  <q-btn color="primary" type="submit" form="addSpecForm">Add</q-btn>
                </div>
              </template>
              <!-- <div class="form-group q-mb-sm">
                <image-chooser v-model="selectedImage" />
              </div>-->
            </q-form>
          </div>
        </div>
        <div class="col-sm-7">
          <div style="background: #ffffff">
            <div class="prev-header">Preview</div>
            <div class="form-group">
              <div class="prev-label">Product</div>
              <div class="prev-text">{{ selectedProduct ? selectedProduct.name : '-' }}</div>
            </div>
            <div class="form-group q-mt-sm" v-for="s in specRecap" :key="s.name">
              <div>
                <span class="text-weight-bold">{{ s.name }}</span>
                <q-btn
                  class="q-ml-sm"
                  outline
                  round
                  dense
                  color="red"
                  icon="close"
                  size="xs"
                  @click="deleteSpec(s.name)"
                />
              </div>
              <div class="prev-list" v-for="v in s.values" :key="v">{{ v }}</div>
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
        <q-btn flat label="Cancel" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn
          flat
          label="Save"
          class="btn-save"
          @click="onSubmit"
          :disable="!selectedProduct || specRecap.length === 0"
        />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import { Api, Notice } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import { Voucher } from 'services';
import { env } from 'src/config';

export default {
  components: {
    FormDialog,
    ImageChooser
  },
  props: {
    title: {
      type: String,
      default: 'Generate SKU'
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      /** 12 X 5 KG ====== packaging_1(12),packaging_1(5),packaging_1(KG) */
      packaging_1: null,
      packaging_2: null,
      packaging_3: null,
      uoms: [],
      isLoading: false,
      submitLoading: false,
      selectedProduct: null,
      selectedSpec: null,
      selectedValue: null,
      selectedPackaging: null,
      selectedImage: null,
      voucherify_sku_id: null,
      specRecap: [],
      products: [],
      filteredProducts: [],
      specs: [],
      filteredSpecs: [],
      filteredValues: []
    };
  },
  computed: {
    values() {
      if (this.selectedSpec) {
        return this.selectedSpec.description.split(',');
      }
      return [];
    },
    payload() {
      return [];
    },
    isEditMode() {
      return this.item !== null;
    }
  },
  watch: {
    selectedSpec(v) {
      this.selectedValue = null;
      this.selectedPackaging = null;
    }
  },
  mounted() {
    this.getData().then(() => {
      if (this.isEditMode) {
        this.setEditData();
      }
    });
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        const [p, s, u] = await Promise.all([this.getProducts(), this.getSpecs(), this.getUoms()]);
        this.products = [...p];
        this.specs = [...s];
        this.uoms = [...u];
        this.isLoading = false;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getProducts() {
      if (this.$store.state.tenant_id != null) {
        let tenant_id = this.$store.state.tenant_id;
        const res = await Api.get('products', `tenant_id = ${tenant_id} and active = 1`);
        if (!res.status) {
          throw new Error(res.message);
        }
        return res.data;
      } else {
        const res = await Api.get('products');
        if (!res.status) {
          throw new Error(res.message);
        }
        return res.data;
      }
    },
    async getSpecs() {
      const res = await Api.get('specs');
      if (!res.status) {
        throw new Error(res.message);
      }
      return res.data;
    },
    async getUoms() {
      const res = await Api.get('uom', null, 'id as value,name as label');
      if (!res.status) {
        throw new Error(res.message);
      }
      return res.data;
    },
    setEditData() {
      const specs = typeof this.item.specs === 'string' && JSON.parse(this.item.specs);

      this.selectedProduct = this.products.find((v) => v.id === this.item.product_id);
      for (let specName in specs) {
        this.specRecap.push({
          id: 0,
          name: specName,
          values: [specs[specName]]
        });
      }
    },
    filterProduct(val, update, abort) {
      if (val === '') {
        update(() => {
          this.filteredProducts = this.products;
        });
        return;
      }

      this.selectedProduct = null; // reset it
      update(() => {
        const needle = val.toLowerCase();
        this.filteredProducts = this.products.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterSpec(val, update, abort) {
      if (val === '') {
        update(() => {
          this.filteredSpecs = this.specs;
        });
        return;
      }

      this.selectedSpec = null;
      update(() => {
        const needle = val.toLowerCase();
        this.filteredSpecs = this.specs.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterValue(val, update, abort) {
      if (val === '') {
        update(() => {
          this.filteredValues = this.values;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.filteredValues = this.values.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });
    },
    onAddSpec() {
      const { id, name } = this.selectedSpec;

      // Find duplicate
      const dupeIdx = this.specRecap.findIndex((v) => v.name === name);
      if (dupeIdx === -1) {
        const spec = { id, name };

        if (spec.name == 'Packaging') {
          this.selectedPackaging = `(${this.packaging_1} ${this.packaging_2 ? 'X' : ''} ${
            this.packaging_2 ? this.packaging_2 : ''
          } ${this.packaging_3.label})`;
          spec.values = Array.isArray(this.selectedPackaging)
            ? [...this.selectedPackaging]
            : [this.selectedPackaging];
          this.specRecap.push(spec);
        } else {
          spec.values = Array.isArray(this.selectedValue) ? [...this.selectedValue] : [this.selectedValue];
          this.specRecap.push(spec);
        }
      } else {
        this.specRecap[dupeIdx].values = Array.isArray(this.selectedValue)
          ? [...this.selectedValue]
          : [this.selectedValue];
      }

      this.selectedSpec = null;
      this.$refs.addSpecForm.resetValidation();
    },
    deleteSpec(specName) {
      const idx = this.specRecap.findIndex((v) => v.name === specName);
      if (idx > -1) {
        this.specRecap.splice(idx, 1);
      }
    },
    generateCombination(arr) {
      const res = [];
      const maxI = arr.length - 1;

      const crawl = (tempArr = [], i = 0) => {
        for (var j = 0; j < arr[i].length; j++) {
          var a = tempArr.slice(0);
          a.push(arr[i][j]);
          if (i === maxI) res.push(a);
          else crawl(a, i + 1);
        }
      };

      crawl();

      return res;
    },
    sortCombination(specs) {
      /**
       * Freshness is always number 1 (IF ANY)
       * Packaging is always on the last (IF ANY)
       * Brand is before packaging (IF ANY)
       * Origin is before brand (IF ANY)
       * Else, sort ordering is based on user input
       */
      const sorted = [];

      for (let spec of specs) {
        if (spec.name.toLowerCase() === 'freshness') {
          sorted.unshift(spec);
        } else if (spec.name.toLowerCase() === 'packaging') {
          // Check if origin or brand exists on sorted array
          const originIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'origin');
          const brandIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'brand');

          if (originIdx > -1) {
            sorted.splice(originIdx + 1, 0, spec);
          } else if (brandIdx > -1) {
            sorted.splice(brandIdx + 1, 0, spec);
          } else {
            sorted.push(spec);
          }
        } else if (spec.name.toLowerCase() === 'brand') {
          const packagingIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'packaging');
          const originIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'origin');

          if (originIdx > -1) {
            sorted.splice(originIdx + 1, 0, spec);
          } else if (packagingIdx > -1) {
            sorted.splice(packagingIdx, 0, spec);
          } else {
            sorted.push(spec);
          }
        } else if (spec.name.toLowerCase() === 'origin') {
          const packagingIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'packaging');
          const brandIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'brand');

          if (brandIdx > -1) {
            sorted.splice(brandIdx, 0, spec);
          } else if (packagingIdx > -1) {
            sorted.splice(packagingIdx, 0, spec);
          } else {
            sorted.push(spec);
          }
        } else {
          const packagingIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'packaging');
          const brandIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'brand');
          const originIdx = sorted.findIndex((v) => v.name.toLowerCase() === 'origin');

          if (originIdx > -1) {
            sorted.splice(originIdx, 0, spec);
          } else if (brandIdx > -1) {
            sorted.splice(brandIdx, 0, spec);
          } else if (packagingIdx > -1) {
            sorted.splice(packagingIdx, 0, spec);
          } else {
            sorted.push(spec);
          }
        }
      }

      return sorted;
    },
    /**
     * @param {String} productName
     * @param {Array} specs
     */
    skuNaming(productName, specs) {
      const freshnessIdx = specs.findIndex((v) => v.name.toLowerCase() === 'freshness');

      if (freshnessIdx > -1) {
        const specCopy = [...specs]; // To protect original array from mutating
        const [freshness] = specCopy.splice(freshnessIdx, 1);
        return freshness.value + ' ' + productName + ' ' + specCopy.map((v) => v.value).join(' ');
      } else {
        return productName + ' ' + specs.map((v) => v.value).join(' ');
      }
    },
    onSubmit() {
      this.save();
    },
    async save() {
      const spec = this.specRecap.map((v) => {
        const vMapped = v.values.map((vv) => ({
          name: v.name,
          value: vv
        }));
        return vMapped;
      });
      const combinations = this.generateCombination(spec);
      const sortedCombinations = combinations.map((v) => {
        return this.sortCombination(v);
      });

      // get voucherify_id from table product
      const resProducts = await Api.get('v_products', `id=${this.selectedProduct.id}`);
      let product_id = [];
      if (resProducts) {
        product_id = resProducts.data[0].voucherify_id;
      } else {
      }

      const payloadProductVoucherify = sortedCombinations.map((v) => {
        return {
          sku: this.skuNaming(this.selectedProduct.name, v),
          voucherify_sku_id: null,
          attributes: {
            specs: v.reduce((res, vv) => {
              res[vv.name] = vv.value;
              return res;
            }, {})
          },

          product_id: this.selectedProduct.id,
          name: this.skuNaming(this.selectedProduct.name, v),
          specs: v.reduce((res, vv) => {
            res[vv.name] = vv.value;
            return res;
          }, {})
        };
      });

      payloadProductVoucherify.forEach(async (sku) => {
        // payload for voucherify
        const p = {
          sku: sku.sku,
          attributes: sku.attributes
        };

        if (env === 'development') {
          // payload for table skus without uploading data to voucherify
          const p2 = [
            {
              product_id: sku.product_id,
              name: sku.name,
              specs: sku.specs,
              b2c: 0,
              voucherify_sku_id: null
            }
          ];

          this.$emit('on-save', p2);
        } else {
          const skuVoucherifyRes = await Voucher.addSku(product_id, p);
          if (skuVoucherifyRes) {
            let voucherifyData = skuVoucherifyRes.data[0];

            // payload for table skus
            const p2 = [
              {
                product_id: sku.product_id,
                name: sku.name,
                specs: sku.specs,
                b2c: 0,
                voucherify_sku_id: voucherifyData.id
              }
            ];

            this.$emit('on-save', p2);
          } else {
          }
        }
      });
    }
  }
};
</script>
<style scoped>
.form-group {
  margin-bottom: 1rem;
}
.form-group .form-label {
  font-weight: 400;
}
.form-group .form-label .require {
  color: #a90000;
}
.prev-header {
  font-weight: 500;
  color: #04565a;
  margin-bottom: 1rem;
}
.prev-label {
  color: #000000;
  font-weight: 600;
  margin-bottom: 15px;
}
.prev-text {
  color: #888888;
  margin-bottom: 1.5rem;
}
.prev-list {
  color: #888888;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>
