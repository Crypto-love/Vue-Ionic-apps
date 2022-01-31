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
      <br />
      <div v-if="note" class="text-caption">{{ note }}</div>

      <q-form id="cancelItemForm" class="q-my-md" @submit.prevent="onOKClick">
        <q-input
          v-model="reason"
          label="Reason"
          lazy-rules
          :rules="[(v) => !!v || 'Please specify reason']"
        />
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
export default {
  props: {
    title: {
      type: String,
      default: 'Cancel Item'
    },
    description: {
      type: String,
      default: 'You will mark this item as cancelled. Please Specify the reason'
    },
    note: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      reason: null
    };
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
      this.$emit('ok', this.reason);
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    }
  }
};
</script>
