<template>
  <div>
    <div class="text-center">
      <q-img
        src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/man.png"
        spinner-color="white"
        style="width: 120px"
        v-if="preview === null"
      />
      <q-img :src="preview" spinner-color="white" style="width: 120px" v-else />
    </div>
    <div class="text-center q-mt-md">
      <q-btn text-color="black" no-caps outline color="grey" @click="$refs.photoInput.$el.click()"
        >Choose Image</q-btn
      >
      <q-input
        ref="photoInput"
        @input="onFileSelected"
        type="file"
        v-if="uploadReady"
        style="display: none"
      />
    </div>
    <q-dialog v-model="showCropBox" persistent full-height>
      <crop-box :src="src" v-if="showCropBox" @submit="onCrop" />
    </q-dialog>
  </div>
</template>

<script>
import { fileToBase64 } from 'services';
import CropBox from './CropBox';
export default {
  components: {
    CropBox
  },
  props: {
    value: {
      type: Object | String,
      default: null
    }
  },
  data() {
    return {
      src: null,
      preview: null,
      showCropBox: false,
      uploadReady: true
    };
  },
  computed: {
    results: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    isEditMode() {
      return this.value !== null;
    }
  },
  mounted() {
    this.$nextTick(function () {
      if (this.isEditMode) {
        if (typeof this.results === 'string') {
          this.preview = this.results;
        } else if (typeof this.results === 'object') {
          this.preview = this.results.large;
        } else {
          this.preview = null;
        }
      }
    });
  },
  methods: {
    async onFileSelected(v) {
      if (v.length === 0) {
        this.preview = null;
        return;
      }
      const encoded = await fileToBase64(v[0]);
      this.src = encoded;
      this.showCropBox = true;
    },
    onCrop(results) {
      this.results = results;
      this.src = null;
      this.resetFile();
      this.showCropBox = false;
      this.preview = results.large;
    },
    /**
     * Why we want this function ?
     * Because, default behavior of input type "file" is...
     * when we first select a file on "choose file" popup, we can't select it again
     *
     * Imagine,
     * When someone first choose a file, and then crop it.
     * Then they realize that it's not the right crop, so they want to adjust it again
     * They have to select the same pic in the "choose file" popup right ?
     * Because of this limitation, we have to "reset" the file field first, so they can select the pic again
     */
    resetFile() {
      this.uploadReady = false;
      this.$nextTick(() => {
        this.uploadReady = true;
      });
    }
  }
};
</script>
