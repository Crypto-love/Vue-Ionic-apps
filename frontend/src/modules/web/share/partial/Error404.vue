<template>
  <div class="row">
    <div class="col-xs-12 col-sm-7">
      <q-img :src="image" sizes="280px" alt="404" v-if="$q.screen.gt.xs" class="window-height" />
      <q-img :src="image" sizes="280px" alt="404" v-else />
    </div>
    <div class="col-xs-12 col-sm-5 q-pa-xs row justify-center items-center">
      <div>
        <h3 class="text-center text-bold text-primary">SORRY !</h3>
        <p class="text-weight-medium">The Page You're Looking For Was Not Found</p>
        <q-btn flat :to="{ path: `/`, exact: true }" color="primary" label="Go Back" class="full-width" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Error404',
  data() {
    return {
      image: `https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/404a.gif`
    };
  }
};
</script>
