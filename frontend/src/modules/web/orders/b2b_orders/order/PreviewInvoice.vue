<template>
  <form-card title="Invoices Related to This Order">
    <q-table class="no-shadow" :loading="isLoading" :data="data" :columns="columns" row-key="invoice_number">
      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="q-gutter-x-xs">
          <q-btn
            color="primary"
            icon="eva-file-outline"
            label="View"
            no-caps
            @click="
              selectedInvoiceId = props.row.invoice_id;
              viewInvoice = true;
            "
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="viewInvoice">
      <view-invoice :id="selectedInvoiceId" v-if="viewInvoice" />
    </q-dialog>
    <template v-slot:actions>
      <q-btn flat no-caps label="Close" color="red" v-close-popup />
    </template>
  </form-card>
</template>

<script>
import { Api, Notice, generateInvoice } from 'services';
import ViewInvoice from './ViewInvoice.vue';
export default {
  components: {
    FormCard: () => import('web/share/partial/FormCard.vue'),
    ViewInvoice
  },
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      isLoading: false,
      viewInvoice: false,
      selectedInvoiceId: null,
      data: [],
      columns: [
        {
          name: 'invoice_number',
          label: 'Invoice Number',
          align: 'left',
          field: 'invoice_number',
          format: (val) => `${val}`,
          sortable: true
        },
        {
          name: 'action',
          label: 'Actions',
          align: 'left',
          field: 'action',
          sortable: true
        }
      ]
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        const { data, status, message } = await Api.get(
          'v_invoice_list',
          `order_id = ${this.id}`,
          null,
          'invoice_number ASC'
        );

        if (!status) throw message;

        this.data = [...data];
      } catch (error) {
        Notice.fail(error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
