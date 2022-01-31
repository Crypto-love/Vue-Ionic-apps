<template>
  <q-page padding>
    <div class="d_header q-mb-md">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-title text-h6">Invoices</div>
        </div>
        <div class="col-xs-12 col-md-8">
          <table-top-right
            v-model="filter"
            @add-click="
              selectedItem = null;
              showForm = true;
            "
          >
          </table-top-right>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="invoice_number"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
      :rows-per-page-options="[100, 200, 300, 0]"
      @request="onRequest"
    >
      <template v-slot:body-cell-payment_type="props">
        <q-td :props="props">
          <div v-if="props.row.payment_type === 2">Credit Card</div>
          <div v-else-if="props.row.credit_term == 0">COD</div>
          <div v-else-if="props.row.credit_term != null">Credit Term ({{ props.row.credit_term }} Days)</div>
        </q-td>
      </template>
      <template v-slot:body-cell-resync_status="props">
        <q-td :props="props">
          <div class="row items-center justify-center" v-if="props.row.xero_invoice_id !== null">
            <q-icon
              name="eva-clock-outline"
              class="cursor-pointer q-mx-sm"
              size="sm"
              color="orange"
              v-if="props.row.resync_status === 1"
            >
              <q-tooltip>Queued to be synchronized</q-tooltip>
            </q-icon>
            <q-icon
              name="eva-checkmark-outline"
              class="cursor-pointer q-mx-sm"
              size="sm"
              color="green"
              v-else-if="props.row.resync_status === 0"
            >
              <q-tooltip>Synchronized successfully</q-tooltip>
            </q-icon>
            <q-icon
              name="eva-alert-triangle-outline"
              class="cursor-pointer q-mx-sm"
              size="sm"
              color="red"
              v-else
            >
              <q-tooltip>Synchronize Error: There are conflicting data</q-tooltip>
            </q-icon>
          </div>
          <div class="row items-center justify-center" v-else>
            <q-icon name="eva-close-outline" class="cursor-pointer q-mx-sm" size="sm">
              <q-tooltip>Invoice isn't uploaded to xero yet</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center justify-center">
            <q-icon
              name="eva-edit-2-outline"
              class="cursor-pointer q-mx-sm"
              size="sm"
              @click="
                selectedItem = props.row;
                showForm = true;
              "
            >
              <q-tooltip>Edit</q-tooltip>
            </q-icon>

            <q-icon
              name="eva-calendar-outline"
              class="cursor-pointer q-mx-sm"
              size="sm"
              @click="
                selectedItem = props.row.id;
                showLog = true;
              "
            >
              <q-tooltip>Payment History</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <edit-dialog :invoice="selectedItem" @update="getData" />
    </q-dialog>

    <q-dialog v-model="showLog">
      <log-history :invoice_id="selectedItem" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import EditDialog from './invoices/EditDialog';
import LogHistory from './invoices/LogPaymentHistory';

export default {
  components: {
    EditDialog,
    TableTopRight,
    LogHistory
  },
  data() {
    return {
      showForm: false,
      showLog: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      pagination: {
        rowsPerPage: 10,
        page: 1,
        rowsNumber: 0
      },
      columns: [
        {
          name: 'invoice_number',
          align: 'left',
          label: 'Invoice No',
          field: 'invoice_number',
          format: (val) => val || '-',
          sortable: true
        },
        {
          name: 'amount',
          align: 'left',
          label: 'Amount',
          field: 'amount',
          sortable: true,
          format: (val) => `$ ${val}`
        },
        {
          name: 'paid_amount',
          align: 'left',
          label: 'Paid Amount',
          field: 'paid_amount',
          sortable: true,
          format: (val) => `$ ${val}`
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true,
          format: (val) => (val ? val.toUpperCase() : '')
        },
        {
          name: 'customer_name',
          align: 'left',
          label: 'Customer',
          field: 'customer_name',
          sortable: true
        },
        {
          name: 'payment_type',
          align: 'left',
          label: 'Payment Mode',
          field: 'payment_type',
          sortable: true
        },
        {
          name: 'resync_status',
          align: 'center',
          label: 'Xero Sync Status',
          field: 'resync_status',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ],
      data: [],
      paymentTypes: []
    };
  },
  watch: {},
  computed: {},

  created() {
    this.onRequest({
      pagination: this.pagination,
      filter: undefined
    });
    // this.getData();
  },

  methods: {
    async getTotalData(filter = null, status = null) {
      const tenantID = this.$store.state.tenant_id;
      let where = `tenant_id=${tenantID}`;
      if (status) {
        where += ` AND status = '${status}'`;
      }

      if (filter) {
        const lcFilter = filter.toLowerCase();
        where += ` AND (LOWER(invoice_number) LIKE '%${lcFilter}%' OR LOWER(customer_name) LIKE '%${lcFilter}%')`;
      }

      const res = await Api.get('v_finance_invoice', where, 'COUNT(id) as total_data', 'id desc');
      if (!res.status) throw new Error(res.message);
      return res.data[0].total_data;
    },
    async getOrders(limit, offset, filter = null, status = null, date = null) {
      const tenantID = this.$store.state.tenant_id;
      let where = `tenant_id=${tenantID}`;
      if (status) {
        where += ` AND status = '${status}'`;
      }
      if (filter) {
        const lcFilter = filter.toLowerCase();
        where += ` AND (LOWER(invoice_number) LIKE '%${lcFilter}%' OR LOWER(customer_name) LIKE '%${lcFilter}%')`;
      }

      const res = await Api.get('v_finance_invoice', where, null, 'id desc', limit, offset);
      if (!res.status) throw new Error(res.message);
      return res.data;
    },
    async onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;

      this.isLoading = true;
      this.$q.loading.show({ message: 'Please wait...' });

      try {
        // Get Total Data
        this.pagination.rowsNumber = await this.getTotalData(filter, this.selectedStatus);

        const limit = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;
        const offset = (page - 1) * rowsPerPage;

        const orders = await this.getOrders(limit, offset, filter, this.selectedStatus);
        this.data = orders;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
        this.$q.loading.hide();
      }
    },
    async getData() {
      const tenantID = this.$store.state.tenant_id;
      this.isLoading = true;
      const { status, message, data } = await this.$api.get(
        'v_finance_invoice',
        'tenant_id = ' + tenantID,
        null,
        'id desc'
      );

      if (status) this.data = data;
      else this.$notice.fail(message);
      this.isLoading = false;
    }
  }
};
</script>
<style scoped>
@media (max-width: 990px) {
  .d_header .text-title {
    text-align: center;
  }
  .d_header .btn-add {
    flex: 10000 1 0%;
    width: auto;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
