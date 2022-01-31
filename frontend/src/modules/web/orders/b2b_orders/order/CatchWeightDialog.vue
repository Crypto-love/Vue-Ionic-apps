<template>
  <q-dialog persistent ref="dialog" @hide="onDialogHide">
    <div
      :class="
        this.$isMobile
          ? 'column q-pa-lg text-center bg-white non-selectable'
          : 'column q-pa-lg text-center bg-white'
      "
      :style="
        this.$isMobile ? { width: '250px', borderRadius: '12px' } : { width: '500px', maxWidth: '40vw' }
      "
      data-cy="confirm-dialog"
    >
      <div class="col text-h6">{{ title }}</div>

      <!-- <div v-html="message" class="col q-my-md" /> -->
      <div>{{ description }}</div>

      <q-form id="catchWeightForm" class="q-my-md" @submit.prevent="addWeight">
        <div class="column items-center justify-start">
          <q-input
            ref="weight"
            v-model="weight"
            label="Enter Weight "
            lazy-rules
            class="full-width"
            :rules="weightRules"
            :disable="weights.length >= qty"
          >
            <template v-slot:append>
              <div class="text-subtitle1">Kg</div>
            </template></q-input
          >
          <q-btn
            class="q-my-md"
            unelevated
            round
            color="primary"
            icon="eva-plus-outline"
            type="submit"
            form="catchWeightForm"
            :disable="weights.length >= qty"
          >
            <q-tooltip> Add Weight </q-tooltip>
          </q-btn>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Price</div>
            </div>
            <div class="col-6 text-right">
              <div>${{ $helper.display4DpPrice(price) }}</div>
            </div>
          </div>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Default weight</div>
            </div>
            <div class="col-6 text-right">
              <div>{{ defaultWeight }} Kg</div>
            </div>
          </div>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Catched Weight(s)</div>
            </div>
            <div class="col-6 text-right">
              <div v-if="weights.length === 0">-</div>
              <q-chip
                v-else
                removable
                size="sm"
                color="primary"
                text-color="white"
                v-for="(weight, index) in weights"
                :key="`weight-${index}`"
                @remove="removeWeight(index)"
              >
                {{ weight }} Kg
              </q-chip>
            </div>
          </div>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Total Weight</div>
            </div>
            <div class="col-6 text-right">
              <div>{{ totalWeight }} Kg</div>
            </div>
          </div>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Total Quantity</div>
            </div>
            <div class="col-6 text-right">
              <div>{{ qty }}</div>
            </div>
          </div>
          <div class="row justify-between full-width">
            <div class="col-6 text-left">
              <div>Total Price</div>
            </div>
            <div class="col-6 text-right">
              <div class="text-primary text-subtitle1 text-bold">
                $ {{ $helper.displayPrice(totalPrice) }}
              </div>
            </div>
          </div>
        </div>
      </q-form>

      <div row justify-between full-width class="text-left" v-if="weights.length < qty">
        *Need to insert {{ qty - weights.length }} more weight(s)
      </div>

      <div class="col row q-mt-sm justify-center">
        <q-btn
          no-caps
          dense
          outline
          rounded
          v-close-popup
          class="col-5"
          size="14px"
          color="grey"
          label="Cancel"
        />

        <div class="col-1" />

        <q-btn
          :disable="weights.length < qty && (!currentCatchWeight || weights.length !== 0)"
          no-caps
          dense
          outline
          rounded
          class="col-5"
          size="14px"
          color="primary"
          :label="currentCatchWeight && weights.length === 0 ? `Reset` : `Submit`"
          @click="onOKClick"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { isNumeric } from 'services';
export default {
  props: {
    title: {
      type: String,
      default: 'Catch Weight'
    },
    description: {
      type: String,
      default: 'Set product item weights'
    },
    currentCatchWeight: {
      type: String,
      default: null
    },
    currentQty: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    defaultWeight: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      reason: null,
      weight: null,
      weights: [],
      weightRules: [(v) => !!v || 'Please specify weight', (v) => isNumeric(v) || 'Must be numeric'],
      qty: 0
    };
  },

  computed: {
    catchWeights() {
      return this.weights.map((v) => v + ' Kg');
    },
    displayWeights() {
      if (this.weights.length === 0) {
        return null;
      }
      return this.catchWeights.join(', ');
    },
    totalWeight() {
      if (this.weights.length === 0) {
        return this.defaultWeight * this.currentQty;
      }
      return this.weights.reduce((total, v) => {
        return total + parseFloat(v);
      }, 0);
    },
    totalPrice() {
      return (this.price / this.defaultWeight) * this.totalWeight;
    }
  },

  mounted() {
    this.qty = this.currentQty;

    if (this.currentCatchWeight) {
      const regex = /[\sKg]/g;
      this.weights = this.currentCatchWeight.trim().replace(regex, '').split(',');
    }
  },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide');
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok', {
        catch_weight: this.displayWeights,
        new_qty: this.qty,
        new_total_weight: this.totalWeight,
        new_total_price: this.totalPrice
      });
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    addWeight() {
      this.weights.push(this.weight);
      this.weight = null;

      if (this.weights.length > this.qty) {
        this.qty = this.weights.length;
      }
      this.$refs.weight.focus();
      this.$refs.weight.resetValidation();
    },

    removeWeight(idx) {
      this.weights.splice(idx, 1);
      if (this.qty > this.currentQty) {
        this.qty--;
      }
    }
  }
};
</script>
