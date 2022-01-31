<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Purchase Order</div>
        </div>
      </div>
      <div class="header-right">
        <table-top-right v-model="filter" hide-add-btn />
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="invoice_number"
      :filter="filter"
      :pagination.sync="pagination"
      class="tdots-table"
    >
      <template v-slot:body-cell-pdf="props">
        <q-td :props="props">
          <q-btn
            round
            color="primary"
            icon="eva-download-outline"
            size="sm"
            @click="download(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
export default {
  components: {
    TableTopRight
  },
  data() {
    return {
      filter: null,
      tenant_id: this.$store.state.tenant_id,
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'invoice_number',
          required: true,
          label: 'Invoice Number',
          align: 'left',
          field: 'invoice_number',
          sortable: true
        },
        {
          name: 'sender',
          required: true,
          label: 'Sender',
          align: 'left',
          field: (row) => row.sender,
          sortable: true
        },
        {
          name: 'date',
          required: true,
          label: 'date',
          align: 'left',
          field: (row) => row.issue_date,
          sortable: true
        },
        {
          name: 'pdf',
          label: 'pdf',
          align: 'left'
        }
      ],
      data: []
    };
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        const res = await this.$api.get('v_peppol_invoices');
        if (!res.status) throw new Error(res.message);
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async download(id) {
      try {
        this.$q.loading.show({ message: 'Please wait...' });
        const pdf = await this.getPDF(id);
        let pdfWindow = window.open('');
        pdfWindow.document.title = 'PDF';
        pdfWindow.document.write(
          "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
            encodeURI(pdf) +
            "'></iframe>"
        );
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async getPDF(id) {
      const res = await this.$api.get('peppol_invoices', `id = ${id}`);
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) throw new Error('Invoice not found');
      return res.data[0].data.document;
    }
  }
};
</script>
