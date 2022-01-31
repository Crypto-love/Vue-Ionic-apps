<template>
  <q-uploader
    :style="`min-width: ${width}px`"
    multiple
    :accept="allowedFileTypes"
    :max-file-size="maxFileSize"
    :max-total-size="maxTotalSize"
    :filter="checkFileSize"
    @added="onFileAdded"
    @removed="onFileRemoved"
  >
    <template v-slot:header="scope">
      <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
        <q-btn
          v-if="scope.queuedFiles.length > 0"
          icon="clear_all"
          @click="onAllFileRemoved(scope)"
          round
          dense
          flat
        >
          <q-tooltip>Clear All</q-tooltip>
        </q-btn>

        <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
        <div class="col">
          <div class="q-uploader__title">{{ title }}</div>
          <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }}</div>
        </div>
        <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" round dense flat>
          <q-uploader-add-trigger />
          <q-tooltip>Pick Files</q-tooltip>
        </q-btn>
        <q-btn v-if="scope.canUpload" icon="eva-checkmark-circle-outline" @click="onSubmit" round dense flat>
          <q-tooltip>Confirm Selection</q-tooltip>
        </q-btn>
      </div>
    </template>
  </q-uploader>
</template>

<script>
import ConfirmMessage from './ConfirmMessage.vue';
import { resizeImg, scaleImg, fileToBase64 } from 'services';

export default {
  props: {
    width: {
      type: Number,
      default: 300
    },
    title: {
      type: String,
      default: 'Multiple File Upload'
    },
    allowedFileTypes: {
      type: String,
      default: undefined
    },
    maxFileSize: {
      type: Number,
      default: undefined
    },
    maxTotalSize: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      submitLoading: false,
      files: []
    };
  },
  methods: {
    /** Filter file size if maxFileSize is specified */
    checkFileSize(files) {
      if (this.maxFileSize) {
        return files.filter((file) => file.size < this.maxFileSize);
      }
      return files;
    },
    onFileAdded(files) {
      this.files = [...this.files, ...files];
    },
    onFileRemoved(files) {
      const removedFile = files[0];
      const idx = this.files.findIndex((v) => v === removedFile);
      this.files.splice(idx, 1);
    },
    onAllFileRemoved(scope) {
      scope.removeQueuedFiles();
      this.files = [];
    },
    showConfirmDialog(title, message, onOk, onCancel) {
      this.$q
        .dialog({
          title: title,
          message: message,
          component: ConfirmMessage
        })
        .onOk(onOk ? onOk : () => {})
        .onCancel(onCancel ? onCancel : () => {});
    },
    onSubmit() {
      this.showConfirmDialog('Upload Confirmation', 'Are you sure ?', this.onOk);
    },
    async onOk() {
      this.$q.loading.show({
        message: 'Processing data'
      });
      try {
        const res = await this.generateReturnPayload();
        this.$q.loading.hide();
        this.$emit('on-add', res);
      } catch (error) {
        this.$q.loading.hide();
      }
    },
    /**
     * This function convert File[] into Object[] that will be looked like this:
     * {
     *    large: base64,
     *    medium: base64,
     *    small: base64
     * }
     */
    async generateReturnPayload() {
      const res = [];
      for (let v of this.files) {
        const scaled256 = scaleImg(v.__img.width, v.__img.height, 256);
        const scaled128 = scaleImg(v.__img.width, v.__img.height, 128);
        const scaled64 = scaleImg(v.__img.width, v.__img.height, 64);

        const [result1, result2, result3] = await Promise.all([
          resizeImg(v.__img.src, scaled256.width, scaled256.height),
          resizeImg(v.__img.src, scaled128.width, scaled128.height),
          resizeImg(v.__img.src, scaled64.width, scaled64.height)
        ]);

        res.push({
          large: result1,
          medium: result2,
          small: result3
        });
      }
      return res;
    }
  }
};
</script>
