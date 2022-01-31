<template>
  <q-scroll-area style="height: 61vh" :thumb-style="thumbStyle">
    <slot></slot>
  </q-scroll-area>
</template>
<script>
export default {
  computed: {
    thumbStyle() {
      return {
        borderRadius: '5px',
        backgroundColor: '#8CD639',
        width: '5px',
        opacity: 0.75
      };
    }
  }
};
</script>
