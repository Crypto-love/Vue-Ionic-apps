<template>
  <horizontal-scroll title="Popular Product This Month">
    <div class="col-xs-12 col-sm-6 col-md-4 q-mr-lg" v-for="i in 9" :key="i">
      <round-picture-card
        :bg-color="i % 2 === 0 ? 'white' : 'info'"
        avatar
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/fresh-mixed-fruits-and-vegtables-500x500.jpg"
      >
        <div class="text-bold text-center">Fresh Vegetables</div>
        <div class="row justify-between q-mt-sm q-col-gutter-sm">
          <div class="col text-caption text-primary">Orders</div>
          <div class="col text-caption text-primary text-right">980 Kg</div>
        </div>
      </round-picture-card>
    </div>
  </horizontal-scroll>
</template>

<script>
export default {
  components: {
    RoundPictureCard: () => import('../partial/RoundPictureCard.vue'),
    HorizontalScroll: () => import('../partial/HorizontalScroll.vue')
  }
};
</script>
