<template>
  <form-card title="QR Code Generator" class="my-card">
    <q-form id="qrForm" @submit.prevent="onSubmit">
      <div class="row justify-between q-col-gutter-md">
        <q-input
          v-model="value"
          label="Value *"
          stack-label
          class="col-12"
          :rules="[(v) => !!v || 'Can\'t be empty']"
          hint="Pro tip: you can type here and then press enter"
        />
      </div>
      <div class="q-mt-lg">
        <div>Preview</div>
        <div class="text-center">
          <qrcode v-if="value" id="preview" :value="value" :options="{ width: 200 }"></qrcode>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Back" class="btn-cancel" v-close-popup />
      <q-btn flat label="Copy to Clipboard" type="submit" form="qrForm" class="btn-save" :disable="!value" />
    </template>
  </form-card>
</template>

<script>
import { Notice } from 'services';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import FormCard from './FormCard.vue';

export default {
  components: {
    FormCard,
    qrcode: VueQrcode
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isLoading: false,
      value: null
    };
  },
  mounted() {},
  methods: {
    canvasToBlob(canvas) {
      return new Promise((resolve) => {
        const b = canvas.toBlob((blob) => {
          return resolve(blob);
        });
      });
    },
    async onSubmit() {
      const c = document.querySelector('#preview');
      const b = await this.canvasToBlob(c);
      navigator.clipboard.write([
        new ClipboardItem({
          'image/png': b
        })
      ]);
      return Notice.ok('Copied to clipboard');
    }
  }
};
</script>

<style scoped>
.my-card {
  width: 440px !important;
  height: 440px !important;
  min-width: unset !important;
}
</style>
