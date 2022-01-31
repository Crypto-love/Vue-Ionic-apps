<template>
  <q-page padding>
    <div class="d_header q-mb-md">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-title text-h6">Stock Locations</div>
        </div>
        <div class="col-xs-12 col-md-8">
          <table-top-right
            v-model="filter"
            @add-click="
              selectedItem = null;
              showForm = true;
            "
          >
            <template #additional-btn>
              <q-btn class="btn-add" no-caps color="primary" label="Import" @click="inception = true">
              </q-btn>
            </template>
          </table-top-right>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'eva-close-outline' : 'eva-eye-outline'"
            />
            <q-tooltip>Branch Company</q-tooltip>
          </q-td>
          <q-td
            v-for="col in props.cols.slice(0, userType === 1 || userType === 2 ? -2 : -1)"
            :key="col.name"
            :props="props"
            >{{ col.value }}</q-td
          >
          <q-td :props="props" key="actions">
            <q-icon
              name="eva-edit-outline"
              size="sm"
              class="cursor-pointer"
              @click="
                selectedItem = props.row.id;
                showForm = true;
              "
            >
              <q-tooltip>Edit data, address, pic, and branches (if any)</q-tooltip>
            </q-icon>
            <q-icon
              name="eva-person-add-outline"
              size="sm"
              class="cursor-pointer"
              @click="onShowTagSalesForm(props.row.id)"
              v-if="customerType === 2"
            >
              <q-tooltip>Tag sales person to this customer</q-tooltip>
            </q-icon>
            <q-icon
              name="eva-attach-outline"
              size="sm"
              class="cursor-pointer"
              @click="sendStatementConfirm(props.row)"
              v-if="customerType === 2 && [2].includes(userType) && props.row.xero_id"
            >
              <q-tooltip>Send Statement</q-tooltip>
            </q-icon>
          </q-td>
          <q-td :props="props" key="active" v-if="userType === 1 || userType === 2">
            <q-toggle
              :value="props.row.active"
              :true-value="1"
              :false-value="0"
              @input="toggleActive(props.row)"
            />
          </q-td>
        </q-tr>
        <!-- Show Branches -->
        <template v-if="props.expand">
          <template v-if="props.row.branches">
            <q-tr :props="props" v-for="branch in props.row.branches" :key="branch.name">
              <q-td auto-width></q-td>
              <q-td class="text-center">{{ branch.account_number }}</q-td>
              <q-td class="text-center">{{ branch.name }}</q-td>
              <q-td class="text-center" v-if="!isSupplierMode">{{ branch.sales_name || '-' }}</q-td>
              <q-td :props="props" key="actions">
                <q-icon
                  name="eva-edit-outline"
                  size="sm"
                  class="cursor-pointer"
                  @click="
                    selectedItem = branch.id;
                    showForm = true;
                  "
                >
                  <q-tooltip>Edit data, address, pic, and branches (if any)</q-tooltip>
                </q-icon>
                <q-icon
                  name="eva-person-add-outline"
                  size="sm"
                  class="cursor-pointer"
                  @click="onShowTagSalesForm(branch.id, props.row.id)"
                  v-if="customerType === 2"
                >
                  <q-tooltip>Tag sales person to this branch</q-tooltip>
                </q-icon>
              </q-td>
              <q-td :props="props" key="active" v-if="userType === 1 || userType === 2">
                <q-toggle
                  :value="branch.active"
                  :true-value="1"
                  :false-value="0"
                  @input="toggleActive({ active: branch.active, id: branch.id })"
                />
              </q-td>
            </q-tr>
          </template>
          <q-tr v-else>
            <q-td colspan="100%">This company have no branches</q-td>
          </q-tr>
        </template>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <my-form :id="selectedItem" :customer-type="customerType" :customers="data" @close="onFormClosed" />
    </q-dialog>
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
import { Api, Notice, ImportXlxs, dataToCSV, createStatement } from 'services';
import PersonCard from 'web/share/partial/PersonCard.vue';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import MyForm from './legacyStockLocation/Form.vue';

export default {
  components: {
    MyForm,
    PersonCard,
    TableTopRight
  },
  data() {
    return {
      credentials: this.$store.state,
      showForm: false,
      inception: false,
      File: null,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      customerType: 1,
      pagination: {
        rowsPerPage: 10
      },
      data: []
    };
  },

  computed: {
    userType() {
      return this.$store.state.user_type_id;
    },
    columns() {
      const res = [
        {
          name: 'account_number',
          align: 'center',
          label: 'Account Number',
          field: 'account_number',
          format: (val) => val || '-',
          sortable: true
        },
        {
          name: 'name',
          align: 'center',
          label: 'Company Name',
          field: 'name',
          sortable: true
        },
        {
          name: 'phone',
          align: 'left',
          label: 'PIC Contact',
          field: 'phone',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ];

      if (this.userType === 1 || this.userType === 2) {
        res.push({
          name: 'active',
          align: 'center',
          label: 'Active',
          field: 'active',
          sortable: false
        });
      }

      return res;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async doImport() {
      await ImportXlxs(
        this.credentials,
        dataToCSV,
        this.File,
        'p_import_suppliers',
        'stock',
        'IMPORT_SUPPLIER_RESULT',
        'TENANT,SUPPLIER,GROUP_ID,REMARK',
        ['tenant', 'supplier', 'group_id', 'remark']
      );
    },
    sendStatementConfirm(data) {
      this.showPrompt('Confirmation', 'You will send statement to this customer', () =>
        this.sendStatement(data)
      );
    },
    async sendStatement(data) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        let sender = this.$store.state.first_name;
        await createStatement(data, sender);
      } catch (error) {
      } finally {
        this.$q.loading.hide();
      }
    },
    showPrompt(title, message, okCallBack, noCallback = null) {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: title,
          message: message
        })
        .onOk(() => {
          if (okCallBack) okCallBack();
        })
        .onCancel(() => {
          if (noCallback) noCallback();
        });
    },
    async getData() {
      this.isLoading = true;
      const res = await Api.get(
        'v_customer_page_dashboard',
        `customer_type_id = 1 AND tenant_id = ${this.$store.state.tenant_id}`,
        null,
        'id DESC'
      );
      this.data = res.data.map((v) => ({
        ...v,
        branches: v.branches && JSON.parse(v.branches)
      }));
      this.isLoading = false;
    },
    async getDataById(id) {
      const { data } = await Api.get(
        'v_customer_page_dashboard',
        `id = ${id} AND tenant_id = ${this.$store.state.tenant_id}`
      );
      const d = {
        ...data[0],
        branches: data[0].branches && JSON.parse(data[0].branches)
      };
      const idx = this.data.findIndex((v) => v.id === id);
      if (idx === -1) {
        this.data.unshift(d);
        return;
      }
      this.$set(this.data, idx, d);
    },
    onFormClosed() {
      this.getData();
      this.showForm = false;
      this.selectedItem = null;
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('customers', { active: newVal }, row.id);
        this.getData();
      } catch (error) {
        Notice.fail(error.message);
      }
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
