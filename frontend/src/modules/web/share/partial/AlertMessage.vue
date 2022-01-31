<template>
  <q-dialog v-model="prompt" persistent ref="dialog" @hide="onDialogHide">
    <q-card
      :class="this.$isMobile ? 'q-dialog-plugin q-pa-md non-selectable' : 'q-dialog-plugin q-pa-md'"
      :style="this.$isMobile ? { width: '250px' } : { width: '500px', maxWidth: '40vw' }"
    >
      <q-card-section>
        <div class="text-h5 text-center">{{ title }}</div>
      </q-card-section>

      <q-card-section v-html="message" class="text-center text-grey-8" style="font-size: 16px" />

      <q-card-actions align="center">
        <q-btn v-close-popup outline class="full-width" color="primary" :label="buttonText" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      prompt: false
    };
  },
  props: {
    title: {
      type: String,
      default: 'Success'
    },
    message: String,
    buttonText: {
      type: String,
      default: 'CLOSE'
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
      this.$emit('ok');
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
