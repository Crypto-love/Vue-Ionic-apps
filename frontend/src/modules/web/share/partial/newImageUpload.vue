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
        <q-btn
          v-if="scope.canAddFiles && scope.files.length < 1"
          class="q-uploader__spinner"
          type="a"
          icon="add_box"
          round
          dense
          flat
        >
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
import { fileToBase64 } from 'services';

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
    async onFileAdded(files) {
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
        const base64Encoded = await fileToBase64(this.files[0]);
        this.files[0].base64Encoded = base64Encoded;
        this.$emit('on-add', this.files[0]);
        this.$q.loading.hide();
      } catch (error) {
        this.$q.loading.hide();
      }
    }
  }
};
</script>
