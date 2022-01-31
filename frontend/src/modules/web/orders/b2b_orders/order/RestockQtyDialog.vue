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
      <div class="col text-h6">Restock Qty</div>

      <div>Please specify how many items you want to return to inventory ?</div>
      <br />
      <div class="text-caption">Current qty: {{ currentQty }}</div>

      <q-form id="cancelItemForm" class="q-my-md" @submit.prevent="onOKClick">
        <q-input v-model="restockQty" label="Restock Qty" lazy-rules :rules="getRestockQtyRules()" />
      </q-form>

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
          label="No"
        />

        <div class="col-1" />

        <q-btn
          no-caps
          dense
          outline
          rounded
          class="col-5"
          size="14px"
          color="primary"
          label="Yes"
          type="submit"
          form="cancelItemForm"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { isNumeric } from 'services';
export default {
  props: {
    currentQty: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      restockQty: null
    };
  },

  mounted() {
    this.restockQty = this.currentQty;
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
      this.$emit('ok', this.restockQty);
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    getRestockQtyRules() {
      return [
        (v) => !!v || 'Required',
        (v) => isNumeric(v) || 'Must be numeric',
        (v) => v >= 0 || 'Cannot be negative',
        (v) => v <= this.currentQty || 'Cannot be more than current qty'
      ];
    }
  }
};
</script>
