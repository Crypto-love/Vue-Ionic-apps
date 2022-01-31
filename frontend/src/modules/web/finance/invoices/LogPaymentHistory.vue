<template>
  <form-dialog title="Payment History" class="modal-lg">
    <div class="q-mt-sm">
      <q-timeline color="primary" layout="comfortable">
        <div v-if="checkSizeOfData(data) === 0" class="text-center">No logs recorded</div>
        <q-timeline-entry v-for="i in data" :key="i.id" icon="eva-credit-card-outline">
          <template v-slot:title>
            {{ i.email }}
          </template>
          <template v-slot:subtitle>
            {{ reformatDate(i.created_at) }}
          </template>
          <div>{{ i.description }}</div>
        </q-timeline-entry>
      </q-timeline>
    </div>
    <template v-slot:actions>
      <q-btn flat label="Close" color="red" v-close-popup />
    </template>
  </form-dialog>
</template>

<script>
import { Api, Notice } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';

const dayjs = require('dayjs');

export default {
  components: {
    FormDialog
  },
  props: {
    invoice_id: {
      required: true
    }
  },
  data() {
    return {
      data: null
    };
  },
  computed: {},
  created() {
    this.getData(this.invoice_id);
  },
  watch: {},
  async mounted() {},
  methods: {
    reformatDate(datetime) {
      return dayjs(datetime).format('DD MMMM YYYY, HH:mm:ss');
    },
    checkSizeOfData(data) {
      let size = 0,
        key;
      for (key in data) {
        if (data.hasOwnProperty(key)) size++;
      }
      return size;
    },
    async getData(invoice_id) {
      this.isLoading = true;
      const { status, message, data } = await this.$api.get(
        'v_payment_logs',
        'invoice_id = ' + invoice_id,
        'id,created_at,email,description',
        'id asc, created_at desc'
      );

      if (status) this.data = data;
      else this.$notice.fail(message);

      this.isLoading = false;
    }
  }
};
</script>
<style>
h6.q-timeline__title {
  font-size: 1rem !important;
}
</style>
