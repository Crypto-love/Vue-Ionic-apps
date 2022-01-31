<template>
  <div class="modal show">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-primary">
          <div class="modal-title">{{ title }}</div>
        </div>
        <div class="modal-body">
          <slot></slot>
          <!--
            <q-scroll-area :style="{ height: `100%` }" class="q-pr-sm" :thumb-style="thumbStyle">
              <slot></slot>
            </q-scroll-area>
            -->
        </div>
        <div class="modal-footer">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Form'
    }
  },
  computed: {
    thumbStyle() {
      return {
        right: '2px',
        borderRadius: '15px',
        backgroundColor: 'grey',
        width: '5px',
        opacity: 0.75
      };
    }
  }
};
</script>

<style scoped>
/* Inject quasar class */
.q-body--prevent-scroll .modal.show {
  overflow-x: hidden !important;
  overflow-y: auto !important;
}
.q-dialog__inner--minimized > div {
  max-height: unset !important;
}
.q-body--force-scrollbar {
  overflow-y: hidden;
}
@media (min-width: 600px) {
  .q-dialog__inner--minimized > div {
    max-width: unset !important;
  }
  .q-dialog__inner > div {
    box-shadow: none !important;
  }
}
</style>
