<template>
  <q-card class="my-form">
    <q-card-section class="card-header bg-primary text-white">
      <div class="text-h6 text-center">{{ title }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="card-body q-px-md">
      <q-scroll-area :style="{ height: `100%` }" class="q-pr-sm" :thumb-style="thumbStyle">
        <slot></slot>
      </q-scroll-area>
    </q-card-section>
    <q-card-actions class="absolute-bottom card-footer" align="right">
      <slot name="actions"></slot>
    </q-card-actions>
  </q-card>
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
        borderRadius: '5px',
        backgroundColor: 'grey',
        width: '5px',
        opacity: 0.75
      };
    }
  }
};
</script>

<style scoped>
.card-header .text-h6 {
  margin-bottom: 0;
  line-height: 1.25rem;
}
.card-body {
  height: calc(100% - 90px);
}
.card-footer {
  border-top: 1px solid #fefefe;
  background: #ffffff;
  padding: 0 1rem 0.8rem 1rem;
}
.my-form {
  border-radius: 15px;
  min-width: 60vw;
}
</style>
