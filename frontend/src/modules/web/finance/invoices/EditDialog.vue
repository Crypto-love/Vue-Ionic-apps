<template>
  <form-dialog title="Payment Records" class="modal-lg">
    <div class="q-mt-sm">
      <payment-table :invoice="invoice" @update="$emit('update')" />
    </div>
    <template v-slot:actions>
      <q-btn flat label="Close" color="red" v-close-popup />
    </template>
  </form-dialog>
</template>

<script>
import { Api, Notice } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import PaymentTable from './PaymentTable.vue';
export default {
  components: {
    FormDialog,
    PaymentTable
  },
  props: {
    invoice: {
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {},
  watch: {},
  async mounted() {},
  methods: {}
};
</script>
