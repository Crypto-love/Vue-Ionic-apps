<template>
  <form-card
    :title="cardTitle"
    style="width: 600px !important; height: 555px !important; min-width: unset !important"
  >
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-x-md">
        <div class="col-xs-12">
          <q-checkbox v-model="isInventoryTracking" label="Inventory Tracking" />
          <q-select
            v-model="formData.customer_id"
            :options="suppliers"
            option-label="name"
            option-value="id"
            label="Supplier *"
            :rules="[(val) => !!val || 'Please choose something']"
            emit-value
            map-options
            dense
            class="form-group"
            stack-label
          />
          <q-input v-model="selectedSku.name" disable label="SKU" dense stack-label />
          <q-select
            v-model="formData.product_type_id"
            :options="productTypes"
            option-label="name"
            option-value="id"
            label="Product Type *"
            :rules="[(val) => !!val || 'Please choose something']"
            emit-value
            map-options
            dense
            class="form-group"
            stack-label
          />
        </div>
        <div class="col-xs-12 col-md-4">
          <q-input
            v-model="selectedSku.unit_per_oom"
            :label="`Number of ${selectedSku.uom || '-'} per ${selectedSku.oom || '-'}`"
            lazy-rules
            :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            dense
            disable
            stack-label
          />
        </div>
        <div class="col-xs-12 col-md-4">
          <q-input
            v-model="formData.unit_price"
            label="Unit Cost Price *"
            lazy-rules
            :rules="[(val) => (!isNaN(val) && val >= 0) || 'Number Only']"
            dense
            stack-label
            mask="#.##"
            fill-mask="0"
            reverse-fill-mask
          >
            <template v-slot:prepend>
              <div>{{ formData.currency_symbol }}</div>
            </template>
          </q-input>
        </div>
        <div class="col-xs-12 col-md-4" v-if="isInventoryTracking">
          <q-input
            v-model="formData.quantity"
            :disable="!isInventoryTracking"
            label="Quantity"
            lazy-rules
            :rules="qtyRules"
            dense
            stack-label
          />
        </div>
        <div class="col-xs-12 q-my-md">
          <div class="text-body1 text-weight-medium">Price</div>
          <div>{{ formData.currency_symbol }} {{ price }}</div>
        </div>
        <div class="col-xs-12">
          <q-input
            v-model="formData.expired_at"
            label="Expired Date (Optional)"
            mask="####-##-##"
            hint="Click on calendar icon to open date picker"
            dense
            class="form-group mb-2 q-mt-md"
            stack-label
          >
            <q-menu self="bottom left">
              <q-date
                mask="YYYY-MM-DD"
                v-model="formData.expired_at"
                :options="filterDate"
                dense
                class="form-group"
              />
            </q-menu>
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
            </template>
          </q-input>
          <q-select
            v-model="selectedLogisticType"
            :options="logisticTypes"
            label="Logistic Type"
            multiple
            use-chips
            emit-value
            map-options
            stack-label
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
      <q-btn flat label="Save" class="btn-save" type="submit" form="myForm" />
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import { Api, Notice, isNumeric, disableYesterdayDates, required, numeric, greaterThan } from 'services';
export default {
  components: {
    FormCard
  },
  props: {
    title: {
      type: String,
      default: null
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      suppliers: [],
      products: [],
      productTypes: [],
      logisticTypes: [],
      selectedSku: {},
      selectedLogisticType: [],
      uom: null,
      oom: null,
      weight: null,
      isInventoryTracking: true, // if false, then set quantity = -1 (unlimited), else, default is 0
      formData: {
        customer_id: null,
        sku_id: null,
        product_type_id: null,
        unit_price: 0,
        price: null,
        quantity: null,
        expired_at: null,
        logistic_type: null,
        currency_symbol: null
      },
      qtyRules: [...numeric(), ...greaterThan(-1)]
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    },
    /** We use this function to give better UX, because there will be a visual bug if we don't use this func */
    logisticTypeJoined() {
      return this.selectedLogisticType.join(',');
    },
    cardTitle() {
      if (this.title) {
        return this.title;
      } else {
        return this.item ? 'Edit Data' : 'Add Data';
      }
    },
    price() {
      if (!this.selectedSku.unit_per_oom) {
        return 0;
      }
      return (this.formData.unit_price * this.selectedSku.unit_per_oom).toFixed(2);
    }
  },
  watch: {
    selectedSku(v) {
      this.formData.sku_id = v.id;
    },
    isInventoryTracking(v) {
      if (!v) {
        this.formData.quantity = -1;
      } else {
        this.formData.quantity = 0;
      }
    }
  },
  mounted() {
    // i usually avoid to use async await in mounted() or created()
    this.getData().then(() => {
      if (this.isEditMode) {
        const { logistic_type, ...rest } = this.item;

        this.formData = {
          id: rest.id || null,
          customer_id: rest.customer_id || null,
          sku_id: rest.sku_id || null,
          product_type_id: rest.product_type_id || null,
          unit_price: rest.unit_price || null,
          price: rest.price || null,
          quantity: rest.quantity || '0',
          expired_at: rest.expired_at || null,
          logistic_type: null,
          currency_symbol: rest.currency_symbol || null,
          currency_code: rest.currency_code || null
        };

        if (logistic_type) {
          this.selectedLogisticType = [...logistic_type];
        }
        if (rest.quantity === -1) {
          this.isInventoryTracking = false;
        }
      }
    });
  },
  methods: {
    filterDate(date) {
      return disableYesterdayDates(date);
    },
    async getData() {
      try {
        const [suppliers, sku, productTypes, logisticTypes] = await Promise.all([
          this.getSupplier(),
          this.getSku(),
          this.getProductType(),
          this.getLogisticType()
        ]);
        this.suppliers = [...suppliers];
        this.selectedSku = {
          id: sku.id || null,
          name: sku.product_name || null,
          b2c: sku.b2c || null,
          unit_per_oom: sku.unit_per_oom || null,
          total_price: sku.total_price || null,
          uom: sku.uom || null,
          oom: sku.oom || null
        };
        this.productTypes = [...productTypes];
        this.logisticTypes = logisticTypes.map((v) => v.name);
      } catch (error) {
        Notice.fail(error);
      }
    },
    async getSupplier() {
      if (this.$store.state.tenant_id != null) {
        let tenant_id = this.$store.state.tenant_id;
        const { data, status, message } = await Api.get(
          'v_customer_page_dashboard',
          'customer_type_id = 1 and tenant_id = ' + tenant_id
        );
        if (!status) {
          throw message;
        }
        return data;
      } else {
        const { data, status, message } = await Api.get('customers', 'customer_type_id = 1');
        if (!status) {
          throw message;
        }
        return data;
      }
    },
    async getSku() {
      const { data, status, message } = await Api.get('v_skus', `id = ${this.item.sku_id}`);
      if (!status) {
        throw message;
      }
      return data[0] || {};
    },
    async getProductType() {
      const { data, status, message } = await Api.get('product_types');
      if (!status) {
        throw message;
      }
      return data;
    },
    async getLogisticType() {
      const { data, status, message } = await Api.get('logistic_types');
      if (!status) {
        throw message;
      }
      return data;
    },
    onSubmit() {
      this.formData.unit_amount = this.selectedSku.unit_per_oom;
      this.formData.logistic_type = this.logisticTypeJoined;
      this.formData.price = this.price;
      if (this.isEditMode) {
        delete this.formData.currency_code;

        this.$emit('edit-complete', {
          ...this.formData,
          quantity: this.formData.quantity || 0
        });
      } else {
        this.$emit('add-complete', {
          ...this.formData,
          quantity: this.formData.quantity || 0
        });
      }
    }
  }
};
</script>
<style scoped>
.form-group {
  margin-bottom: 0.5rem;
}
.mb-2 {
  margin-bottom: 1rem !important;
}
</style>
