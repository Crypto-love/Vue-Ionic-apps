<template>
  <q-page>
    <div class="row">
      <div class="col-xs-12 col-sm-7">
        <q-img :src="image" alt="404" v-if="$q.screen.gt.xs" class="window-height" />
        <q-img :src="image" alt="404" v-else />
      </div>
      <div class="col-xs-12 col-sm-5 q-pa-xs row justify-center items-center">
        <div>
          <h3 class="text-center text-bold text-primary">Coming Soon !</h3>
          <q-btn flat :to="{ path: `/`, exact: true }" color="primary" label="Go Back" class="full-width" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import image from 'assets/images/fruits-vegetables.png';

export default {
  name: 'Error404',
  data() {
    return {
      image: image
    };
  },
  created() {},
  methods: {}
};
</script>
