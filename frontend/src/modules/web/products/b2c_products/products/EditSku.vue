<template>
  <form-dialog title="Edit SKU" class="FormContainer modal-md" id="#FormContainer">
    <q-form @submit.prevent="onSubmit" id="SkuForm">
      <div class="content">
        <q-stepper
          flat
          v-model="step"
          ref="stepper"
          alternative-labels
          color="primary"
          animated
          class="step-wrapper"
        >
          <!-- START STEP 1 -->
          <q-step :name="1" title="SKU Product Info" icon="eva-cube-outline" class="q-mb-xs" :done="step > 1">
            <q-form id="stepOneForm" @submit.prevent="onContinueClick">
              <div class="row">
                <div class="col-7">
                  <div class="q-gutter-lg">
                    <q-input
                      v-model="formData.name"
                      dense
                      outlined
                      label="SKU Name"
                      readonly
                      hint="You can edit spec by clicking on this field"
                      @click="showSpecForm = true"
                    />
                    <q-input v-model="formData.alias" dense outlined label="Alias" />
                    <q-input
                      v-model="formData.description"
                      dense
                      outlined
                      type="textarea"
                      label="Description"
                      style="height: 110px"
                    />
                    <q-input v-model="formData.country_of_origin" dense outlined label="Country Of Origin" />
                    <q-toggle
                      v-model="formData.halal"
                      label="Halal"
                      left-label
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="formData.perishable"
                      label="Perishable"
                      left-label
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-toggle
                      v-model="formData.is_slack_notifiable"
                      label="Slack Notification"
                      left-label
                      :true-value="1"
                      :false-value="0"
                    />
                  </div>
                </div>
                <div class="col-5 content-right">
                  <div class="q-pr-md q-pl-md q-pb-md">
                    <image-chooser v-model="skuImage" />
                  </div>
                </div>
              </div>
            </q-form>
          </q-step>
          <!-- END OF STEP 1 -->

          <!-- START STEP 2 -->
          <q-step
            :name="2"
            title="SKU Product Price"
            icon="eva-percent-outline"
            class="q-mb-xs"
            :done="step > 2"
          >
            <q-form id="stepTwoForm" @submit.prevent="onContinueClick">
              <!-- <div class="row">
                <div class="col-12">
                  <div class="q-gutter-lg q-mb-md">
                    <q-toggle
                      v-model="formData.is_sample"
                      label="Sample"
                      left-label
                      :true-value="1"
                      :false-value="0"
                    />
                  </div>
                </div>
              </div> -->
              <!-- <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="q-gutter-md">
                    <q-select
                      outlined
                      dense
                      v-model="selectedUom"
                      :options="uom"
                      option-label="name"
                      option-value="id"
                      label="Unit of Measurement"
                      lazy-rules
                      :rules="[ val => !!val.name || 'Please select something']"
                    />
                    <q-input
                      v-model="formData.price"
                      label="Unit Price"
                      prefix="$"
                      dense
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-if="!formData.is_sample"
                      v-model="formData.market_unit_price"
                      label="Market Unit Price"
                      prefix="$"
                      dense
                      :rules="[
                        ...requiredRule
                      ]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-model="formData.increment_qty"
                      label="Increment Quantity"
                      dense
                      :rules="[
                        ...requiredRule,
                        ...numericRule,
                        ...zeroRule
                      ]"
                    />
                    
                  </div>
                </div>
                <div class="col-6">
                  <div class="q-gutter-md">
                    <q-select
                      dense
                      outlined
                      v-model="selectedOom"
                      :options="uom"
                      option-label="name"
                      option-value="id"
                      label="Order of Measurement"
                      lazy-rules
                      :rules="[ val => !!val.name || 'Please select something']"
                    />
                    <q-input
                      v-model="formData.weight"
                      :label="`Weight per ${selectedOom.name} (KG)`"
                      dense
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-model="formData.unit_per_oom"
                      :label="`Number of ${selectedUom.name} per ${selectedOom.name}`"
                      dense
                      stack-label
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <div class="row q-col-gutter-sm q-mt-sm">
                      <div class="col">
                        <div class="box-val">
                          <div class="label">Total Price</div>
                          <div class="value text-primary">${{ totalPrice.toFixed(2) }}</div>
                        </div>
                      </div>
                      <div class="col" v-if="formData.is_sample == 0">
                        <div class="box-val">
                          <div class="label">Market Price</div>
                          <div class="value text-primary">${{ totalMarketUnitPrice.toFixed(2) }}</div>
                        </div>
                      </div>
                      <div class="col" v-if="formData.is_sample == 0">
                        <div class="box-val">
                          <div class="label">Discount</div>
                          <div class="value text-primary">{{ discount.toFixed(2) }}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> -->
              <div class="row q-col-gutter-lg" v-if="formData.b2c == 1">
                <div
                  class="text-weight-medium text-center full-width q-mb-md q-mt-md"
                  style="font-size: 15px"
                >
                  Set SKU Product Price for Household (B2C)
                </div>
                <div class="col-6">
                  <div class="q-gutter-md">
                    <q-select
                      outlined
                      dense
                      v-model="selectedB2CUom"
                      :options="uom"
                      option-label="name"
                      option-value="id"
                      label="B2C Unit of Measurement"
                      lazy-rules
                      :rules="[(val) => !!val.name || 'Please select something']"
                    />
                    <q-input
                      v-model="formData.b2c_unit_price"
                      label="Unit Price"
                      :prefix="formData.currency_symbol"
                      dense
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.####"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-model="formData.b2c_market_unit_price"
                      label="Market Unit Price"
                      :prefix="formData.currency_symbol"
                      dense
                      :rules="[...requiredRule]"
                      mask="#.####"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-model="formData.b2c_increment_qty"
                      label="Increment Quantity"
                      dense
                      :rules="[...requiredRule, ...numericRule, ...zeroRule]"
                    />
                    <q-toggle
                      v-model="formData.is_b2c_pooling"
                      label="Pooling"
                      left-label
                      :true-value="1"
                      :false-value="0"
                    />
                    <q-input
                      v-if="formData.is_sample === 0 && formData.is_b2c_pooling === 1"
                      v-model="formData.b2c_pooling_qty"
                      label="Pooling Quantity"
                      dense
                      :rules="[...requiredRule, ...numericRule, ...zeroRule]"
                    />
                    <packaging-input v-model="formData.b2c_packaging" label="B2C Packaging" />
                  </div>
                </div>
                <div class="col-6">
                  <div class="q-gutter-md">
                    <q-select
                      dense
                      outlined
                      v-model="selectedB2COom"
                      :options="uom"
                      option-label="name"
                      option-value="id"
                      label="B2C Order of Measurement"
                      lazy-rules
                      :rules="[(val) => !!val.name || 'Please select something']"
                    />
                    <q-input
                      v-model="formData.b2c_weight"
                      :label="`Weight per ${selectedB2COom.name} (KG)`"
                      dense
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                    <q-input
                      v-model="formData.b2c_unit_per_oom"
                      :label="`Number of ${selectedB2CUom.name} per ${selectedB2COom.name}`"
                      dense
                      stack-label
                      :rules="[...requiredRule, ...zeroRule]"
                      mask="#.##"
                      fill-mask="0"
                      reverse-fill-mask
                    />
                  </div>
                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Total Price</div>
                        <div class="value text-primary">
                          {{ formData.currency_symbol }} {{ b2cTotalPrice.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Market Price</div>
                        <div class="value text-primary">
                          {{ formData.currency_symbol }} {{ b2cTotalMarketUnitPrice.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Discount</div>
                        <div class="value text-primary">{{ b2cDiscount.toFixed(2) }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-form>
          </q-step>
          <!-- END OF STEP 2 -->

          <!-- START STEP 3 -->
          <q-step :name="3" title="SKU Preview" class="q-mb-xs" icon="eva-file-text-outline">
            <q-form id="stepThreeForm" @submit.prevent="onContinueClick">
              <div class="row q-col-gutter-lg">
                <div class="col-12" v-if="formData.b2c == 1">
                  <div class="prev-title">Preview SKU for Household (B2C)</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">Unit of Measurement</div>
                        <div class="value text-primary">{{ selectedB2CUom.name }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">Ordering Measurement</div>
                        <div class="value text-primary">{{ selectedB2COom.name }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="row q-col-gutter-sm q-mt-xs">
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">Unit Price</div>
                        <div class="value text-primary">
                          {{ formData.currency_symbol }} {{ formData.b2c_unit_price }}
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">Weight per {{ selectedB2COom.name }} (KG)</div>
                        <div class="value text-primary">{{ formData.b2c_weight }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="row q-col-gutter-sm q-mt-xs">
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">Market Unit Price</div>
                        <div class="value text-primary">
                          {{ formData.currency_symbol }} {{ formData.b2c_market_unit_price }}
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="box-val">
                        <div class="label">
                          Number of {{ selectedB2CUom.name }} per {{ selectedB2COom.name }}
                        </div>
                        <div class="value text-primary">{{ formData.b2c_unit_per_oom }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="line"></div>
                  </div>
                  <div class="row q-gutter-sm">
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Total Price</div>
                        <div class="value text-primary">
                          {{ formData.currency_symbol }} {{ b2cTotalPrice.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Market Price</div>
                        <div class="value text-primary">${{ b2cTotalMarketUnitPrice.toFixed(2) }}</div>
                      </div>
                    </div>
                    <div class="col">
                      <div class="box-val">
                        <div class="label">Discount</div>
                        <div class="value text-primary">{{ b2cDiscount.toFixed(2) }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 q-mt-xs q-mb-xs" v-if="formData.b2c == 1">
                  <div class="line"></div>
                </div>
                <div :class="{ 'col-12': formData.b2c == 1, 'col-6': formData.b2c == 0 }">
                  <div class="row q-col-gutter-sm">
                    <div
                      :class="{
                        'col-6 text-center': formData.b2c == 1,
                        'col-12 q-mb-md q-ml-lg': formData.b2c == 0
                      }"
                    >
                      <div class="text-caption text-grey">Product Image</div>
                      <div class="prev-product-image">
                        <q-img
                          v-if="previewImg === null"
                          src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/add_image.png"
                          style="width: 250px"
                        />
                        <q-img v-else :src="previewImg" style="width: 250px" />
                      </div>
                    </div>
                    <div
                      :class="{ 'col-6 text-center': formData.b2c == 1, 'col-12 q-ml-lg': formData.b2c == 0 }"
                    >
                      <div class="text-caption text-grey">QR Code of the Product</div>
                      <div class="prev-qr">
                        <qrcode v-if="qr" :value="qr" :options="{ width: 200 }" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-form>
          </q-step>
          <!-- END OF STEP 3 -->

          <template v-slot:navigation></template>
        </q-stepper>
      </div>
    </q-form>
    <template v-slot:actions>
      <template>
        <q-stepper-navigation
          style="margin-top: 0; padding-top: 0; flex: auto; margin-left: 1rem"
          class="content-left"
        >
          <q-btn
            type="submit"
            :form="currentForm"
            color="primary"
            class="q-pr-lg q-pl-lg"
            :label="step === 3 ? 'Save' : 'Continue'"
          />
          <q-btn
            v-if="step > 1"
            flat
            color="primary"
            @click="$refs.stepper.previous()"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat class="text-negative q-mr-md" label="Cancel" v-close-popup />
      </template>
    </template>
    <q-dialog v-model="showSpecForm">
      <generate-sku :item="item" @on-save="onEditSpec" />
    </q-dialog>
  </form-dialog>
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ImageUpload from 'web/share/partial/ImageUpload.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import GenerateSku from './GenerateSku.vue';
import PackagingInput from './PackagingInput.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import { Api, required, numeric, greaterThan } from 'services';

export default {
  components: {
    FormDialog,
    ImageUpload,
    ImageChooser,
    GenerateSku,
    qrcode: VueQrcode,
    PackagingInput
  },

  props: {
    item: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      step: 1,
      submitLoading: false,
      uom: [],
      selectedUom: {},
      selectedOom: {},
      selectedB2CUom: {},
      selectedB2COom: {},
      showSpecForm: false,
      skuImage: null,
      requiredRule: required(),
      numericRule: numeric(),
      zeroRule: greaterThan(0),
      packaging: {
        a: null,
        b: null,
        uom: null
      },
      previousTotalPrice: null,
      formData: {
        id: null,
        name: null,
        is_sample: null,
        alias: null,
        halal: 1,
        perishable: 0,
        oom_id: null,
        uom_id: null,
        unit_per_oom: null,
        increment_qty: 1,
        weight: 0,
        price: 0,
        market_unit_price: 0,

        image: {},
        specs: null,
        b2c: 0,
        b2c_oom_id: null,
        b2c_uom_id: null,
        b2c_unit_per_oom: null,
        b2c_increment_qty: 1,
        b2c_weight: 0,
        b2c_unit_price: 0,
        b2c_market_unit_price: 0,
        b2c_pooling_qty: 0,
        b2c_packaging: null,
        b2c_oom_id: null,
        is_b2c_pooling: 0,
        is_slack_notifiable: 0
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
        if (!this.item.qrcode) {
          return `${this.formData.id};${this.formData.name}`;
        }
        return this.item.qrcode;
      }
      return null;
    },
    currentForm() {
      switch (this.step) {
        case 1:
          return 'stepOneForm';
        case 2:
          return 'stepTwoForm';
        case 3:
          return 'stepThreeForm';
      }
    },
    weightPerOom() {
      return this.formData.weight;
    },
    totalPrice() {
      return parseFloat(this.formData.price) * parseFloat(this.formData.unit_per_oom);
    },
    totalMarketUnitPrice() {
      return parseFloat(this.formData.market_unit_price) * parseFloat(this.formData.unit_per_oom);
    },
    discount() {
      if (this.totalMarketUnitPrice <= this.totalPrice) {
        return 0;
      }
      return -1 * (100 - (this.totalPrice / this.totalMarketUnitPrice) * 100);
    },
    b2cTotalPrice() {
      return parseFloat(this.formData.b2c_unit_price) * parseFloat(this.formData.b2c_unit_per_oom);
    },
    b2cTotalMarketUnitPrice() {
      return parseFloat(this.formData.b2c_market_unit_price) * parseFloat(this.formData.b2c_unit_per_oom);
    },
    b2cDiscount() {
      if (this.b2cTotalMarketUnitPrice <= this.b2cTotalPrice) {
        return 0;
      }
      return -1 * (100 - (this.b2cTotalPrice / this.b2cTotalMarketUnitPrice) * 100);
    },
    previewImg() {
      if (typeof this.skuImage === 'string') {
        return this.skuImage;
      }

      if (typeof this.skuImage === 'object' && this.skuImage !== null) {
        return this.skuImage.large;
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
    },
    selectedB2COom(v) {
      this.formData.b2c_oom_id = v.id;
    },
    selectedB2CUom(v) {
      this.formData.b2c_uom_id = v.id;
    }
  },

  mounted() {
    this.getData().then(() => {
      if (this.item) {
        this.formData = {
          id: this.item.id,
          name: this.item.product_name,
          is_sample: this.item.is_sample,
          alias: this.item.product_alias,
          halal: this.item.halal,
          perishable: this.item.perishable,
          oom_id: this.item.oom_id,
          uom_id: this.item.uom_id,
          unit_per_oom: this.item.unit_per_oom,
          increment_qty: this.item.increment_qty,
          weight: this.item.weight,
          price: this.item.price,
          market_unit_price: this.item.market_unit_price,
          total_price: null,
          total_market_price: null,
          specs: this.item.specs,
          b2c: this.item.b2c,
          b2c_oom_id: this.item.b2c_oom_id,
          b2c_uom_id: this.item.b2c_uom_id,
          b2c_unit_per_oom: this.item.b2c_unit_per_oom,
          b2c_increment_qty: this.item.b2c_increment_qty,
          b2c_weight: this.item.b2c_weight,
          b2c_unit_price: this.item.b2c_unit_price,
          b2c_market_unit_price: this.item.b2c_market_unit_price,
          b2c_pooling_qty: this.item.b2c_pooling_qty,
          b2c_packaging: this.item.b2c_packaging,
          description: this.item.description,
          is_b2c_pooling: this.item.is_b2c_pooling,
          is_slack_notifiable: this.item.is_slack_notifiable,
          country_of_origin: this.item.country_of_origin,
          currency_symbol: this.item.currency_symbol
        };
        this.selectedOom = this.uom.find((v) => v.id === this.item.oom_id);
        this.selectedB2COom = this.uom.find((v) => v.id === this.item.b2c_oom_id);
        this.selectedUom = this.uom.find((v) => v.id === this.item.uom_id);
        this.selectedB2CUom = this.uom.find((v) => v.id === this.item.b2c_uom_id);
        this.skuImage = this.item.image ? this.item.image.medium : null;
        this.previousTotalPrice = this.item.total_price;
      }
    });
  },

  methods: {
    showConfirmDialog(title, messaage, callback) {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: title,
          message: messaage
        })
        .onOk(() => {
          if (callback) callback();
        });
    },
    async getData() {
      const res = await Api.get('uom', 'active=1');
      this.uom = res.data;
    },
    onContinueClick() {
      if (this.step < 3) {
        return this.$refs.stepper.next();
      }
      return this.onSubmit();
    },
    onSubmit() {
      const { id, ...payload } = this.formData;

      /** Check if this.skuImage contains value like { small: ..., medium: ..., large: ... } */
      if (typeof this.skuImage === 'object' && this.skuImage !== null) {
        payload.image = this.skuImage;
      }

      payload.total_price = this.totalPrice;
      payload.total_market_price = this.totalMarketUnitPrice;

      /** Set market unit price & is_b2c_pooling to 0 if sku = sample */
      if (payload.is_sample) {
        payload.market_unit_price = 0;
        payload.is_b2c_pooling = 0;
        payload.b2c_pooling_qty = 0;
      }

      /**
       * Handle b2c related value if b2c flag is False
       */
      if (payload.b2c === 0) {
        payload.b2c_unit_per_oom = 0;
        payload.b2c_unit_price = 0;
        payload.b2c_market_unit_price = 0;
        payload.b2c_weight = 0;
        payload.is_b2c_pooling = 0;
        payload.b2c_pooling_qty = 0;
        payload.b2c_increment_qty = 0;
        payload.b2c_packaging = null;
      } else {
        if (payload.is_b2c_pooling === 0) {
          payload.b2c_pooling_qty = 0;
        }
      }

      if (payload.currency_symbol) {
        delete payload.currency_symbol;
      }

      if (this.totalPrice !== parseFloat(this.previousTotalPrice)) {
        this.showConfirmDialog(
          'Warning',
          'Updating unit price will update all of the current quoted price below the new total price. Continue ?',
          () => {
            this.$emit('edit-complete', payload, id, true);
          }
        );
      } else {
        this.$emit('edit-complete', payload, id, false);
      }
    },
    onClickNameField() {
      this.showSpecForm = true;
    },
    onEditSpec(v) {
      const editedData = v[0];
      this.formData.name = editedData.name;
      this.formData.specs = JSON.stringify(editedData.specs);
      this.item.specs = JSON.stringify(editedData.specs);
      this.showSpecForm = false;
    }
  }
};
</script>
<style scoped>
.td-step-header {
  padding: 0 !important;
}
.box-val {
  background: #f5f5f5;
  border-color: 1px solid #e3e3e3;
  border-radius: 0.25rem;
  padding: 0.35rem 0.125px;
  text-align: center;
}
.box-val .label {
  font-weight: 500;
  font-size: 13px;
  color: #000000;
  margin-bottom: 0.125rem;
}
.prev-title {
  display: block;
  width: 100%;
  color: #000000;
  font-weight: 500;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 1rem;
}
.line {
  display: block;
  border-bottom: 1px solid #dedede;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 1px;
}
.prev-qr canvas {
  border: 1px solid #dedede;
}
</style>
