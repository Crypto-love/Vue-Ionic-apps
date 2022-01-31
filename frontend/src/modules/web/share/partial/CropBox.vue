<template>
  <form-card title="Crop Image">
    <q-form @submit.prevent="onSubmit" id="cropForm">
      <div style="height: 380px">
        <vue-cropper
          ref="cropper"
          :img="src"
          :outputSize="1"
          outputType="jpg"
          :info="true"
          :full="true"
          :autoCrop="true"
          :centerBox="true"
          :fixedBox="true"
          :autoCropWidth="256"
          :autoCropHeight="256"
        />
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="isLoading">
        <q-circular-progress indeterminate size="md" color="lime" />
      </template>
      <template v-else>
        <q-btn-group class="q-ml-md">
          <q-btn icon="eva-maximize-outline" color="primary" @click="$refs.cropper.changeScale(4)" />
          <q-btn icon="eva-minimize-outline" color="primary" @click="$refs.cropper.changeScale(-2)" />
        </q-btn-group>
        <q-space />
        <q-btn flat label="Cancel" color="red" v-close-popup />
        <q-btn flat label="Save" color="primary" type="submit" form="cropForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from './FormCard';
import { resizeImg } from 'services';
export default {
  components: {
    FormCard
  },
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      img: null
    };
  },
  methods: {
    async onSubmit() {
      this.isLoading = true;
      const results = await this.crop();
      this.$emit('submit', results);
      this.isLoading = false;
    },
    crop() {
      return new Promise((resolve) => {
        this.$refs.cropper.getCropData(async (data) => {
          const result1 = await resizeImg(data, 256, 256);
          const result2 = await resizeImg(data, 128, 128);
          const result3 = await resizeImg(data, 64, 64);

          return resolve({
            large: result1,
            medium: result2,
            small: result3
          });
        });
      });
    }
  }
};
</script>
