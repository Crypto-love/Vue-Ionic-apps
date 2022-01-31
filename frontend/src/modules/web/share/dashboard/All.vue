<template>
  <tab-scroll-area>
    <div class="q-mb-lg">
      <popular-products />
    </div>
  </tab-scroll-area>
</template>
<script>
import TabScrollArea from './TabScrollArea';
export default {
  components: {
    TabScrollArea,
    PopularProducts: () => import('./PopularProducts.vue')
  }
};
</script>
