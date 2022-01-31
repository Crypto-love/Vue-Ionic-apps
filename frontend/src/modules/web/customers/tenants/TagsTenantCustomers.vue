<template>
  <q-page padding>
    <div class="d_header q-mb-md">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-title text-h6">Tags Tenant Customers</div>
        </div>
        <div class="col-xs-12 col-md-8">
          <div style="float: right; display: flex">
            <q-btn
              rounded
              class="q-mr-sm"
              color="primary"
              style="text-transform: capitalize; padding-left: 1rem; padding-right: 1rem"
              label="Import"
              @click="inception = true"
            >
            </q-btn>
            <q-btn
              rounded
              class="q-mr-sm"
              color="primary"
              to="/main/customers"
              style="text-transform: capitalize; padding-left: 1rem; padding-right: 1rem"
              label="All Customers"
            />
            <q-btn
              v-if="credentials.user_type_id == 1 || credentials.id == 2"
              rounded
              color="primary"
              to="/main/supplier/all_supplier"
              style="text-transform: capitalize; padding-left: 1rem; padding-right: 1rem"
              label="All Tenants"
            />
            <search-top-right v-model="filter" class="d_search" label="Search" />
          </div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="company_name"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
      virtual-scroll
      no-data-label="No data available"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            round
            color="primary"
            size="sm"
            class="q-mr-sm"
            icon="eva-checkmark-outline"
            @click="promptApproveData(props.row)"
          >
            <q-tooltip>Approve</q-tooltip>
          </q-btn>
          <q-btn
            round
            color="red"
            size="sm"
            class="q-mr-sm"
            icon="eva-close-outline"
            @click="promptRejectData(props.row)"
          >
            <q-tooltip>Reject</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="inception">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Upload Template</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file color="purple-12" v-model="File" accept=".xls,.xlsx" label="Select File">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:after>
              <q-btn round dense flat class="btn-add q-mr-xs" @click="doImport()">Upload</q-btn>
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import SearchTopRight from 'web/share/partial/SearchTopRight.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage';
import { ImportXlxs, dataToCSV } from 'services';
export default {
  components: {
    TableTopRight,
    SearchTopRight
  },
  data() {
    return {
      credentials: this.$store.state,
      inception: false,
      File: null,
      selectedItem: null,
      selectedItemName: null,
      filter: null,
      search: null,
      selected: [],
      isLoading: false,
      pagination: {
        rowsPerPage: 10
      },
      data: []
    };
  },
  computed: {
    columns() {
      const res = [
        {
          name: 'company_name',
          align: 'left',
          label: 'Company Name',
          field: 'name'
        },
        {
          name: 'fist_name',
          align: 'left',
          label: 'First Name',
          field: 'first_name'
        },
        {
          name: 'last_name',
          align: 'left',
          label: 'Last Name',
          field: 'last_name'
        },
        {
          name: 'email',
          align: 'left',
          label: 'Email',
          field: 'email'
        },
        {
          name: 'phone_number',
          align: 'left',
          label: 'Phone Number',
          field: 'phone'
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    }
  },
  created() {
    this.getData();
  },
  mounted() {},
  methods: {
    async doImport() {
      await ImportXlxs(
        this.credentials,
        dataToCSV,
        this.File,
        'p_import_tagtenants',
        'supplier-customer',
        'IMPORT_TAG_TENANT_RESULT',
        'TENANT,BUYER,REMARK',
        ['tenant', 'buyer', 'remark']
      );
    },
    async getData() {
      this.isLoading = true;
      let tenant_id = this.credentials.tenant_id;
      const { status, message, data } = await this.$api.get(
        'v_customer_tenant_join_requests_table',
        `tenant_id = ${tenant_id} and approved = 0 and active = 1`,
        'id, customer_id, name, first_name, last_name, email, phone',
        'id asc'
      );

      if (status) this.data = data;
      else this.$notice.fail(message);
      this.isLoading = false;
    },
    promptRejectData(data) {
      this.$q
        .dialog({
          component: ConfirmMessage,
          title: `Are you sure you want to reject ${data.name} ?`,
          message: 'This action cannot be undone!'
        })
        .onOk(() => this.rejectData(data));
    },
    promptApproveData(data) {
      this.$q
        .dialog({
          component: ConfirmMessage,
          title: `Are you sure you want to approve ${data.name} ?`,
          message: 'This action cannot be undone!'
        })
        .onOk(() => this.approveData(data));
    },
    async approveData(data) {
      const dataToSend = data;
      this.$q.loading.show({
        message: 'Please wait..'
      });
      try {
        const payload = {
          id: dataToSend.id,
          customer_id: dataToSend.customer_id,
          updater_id: this.credentials.tenant_id
        };
        const { status, message, data } = await this.$api.exec('p_approve_customer_join_tenant_request', [
          JSON.stringify(payload).replace(/'/g, '`')
        ]);
        if (!status) throw message;
        this.$notice.ok('Request has been approved!');
        await this.getData();
      } catch (error) {
        this.$notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async rejectData(data) {
      const dataToSend = data;
      this.$q.loading.show({
        message: 'Please wait..'
      });
      try {
        const payload = {
          id: dataToSend.id,
          updater_id: this.credentials.tenant_id
        };
        const { status, message, data } = await this.$api.exec('p_reject_customer_join_tenant_request', [
          JSON.stringify(payload).replace(/'/g, '`')
        ]);
        if (!status) throw message;
        this.$notice.ok('Request has been rejected!');
        await this.getData();
      } catch (error) {
        this.$notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    }
  }
};
</script>
<style scoped>
.modal_loading {
  margin-top: 0;
}
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
