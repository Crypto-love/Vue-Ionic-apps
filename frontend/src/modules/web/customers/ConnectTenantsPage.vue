<template>
  <q-page padding>
    <div class="d_header q-mb-md">
      <div class="row">
        <div class="col-xs-12 col-md-2">
          <div class="text-title text-h6">Connect Tenants</div>
        </div>
        <div class="col-xs-12 col-md-10">
          <table-top-right
            v-model="filter"
            @add-click="
              selectedItem = null;
              showForm = true;
            "
          >
            <template #additional-btn>
              <q-btn
                no-caps
                flat
                class="btn-add q-mr-sm"
                to="/main/supplier/connects/tagstenantcustomers"
                style="border-radius: 24px"
                >Tags Tenant Customers</q-btn
              >
              <q-btn
                no-caps
                flat
                class="btn-add"
                style="border-radius: 24px"
                @click="
                  showPrompt(
                    'Download Confirmation',
                    'You will download all customer data as CSV',
                    onDownloadCSV
                  )
                "
                >Download CSV</q-btn
              >
              <q-btn
                no-caps
                flat
                class="btn-add"
                style="border-radius: 24px"
                @click="
                  showPrompt(
                    'Confirmation',
                    'You will send statements to all customers (if any)',
                    onBulkSendStatement
                  )
                "
                >Bulk Send All Statement</q-btn
              >
            </template>
          </table-top-right>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="name"
      :filter-method="search"
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
            v-for="col in props.cols.slice(0, isAdminOrTenant ? -2 : -1)"
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
              @click="onShowTagSalesForm(props.row.id, null, props.row.tenant_id)"
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
          <q-td :props="props" key="active" v-if="isAdminOrTenant">
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
              <q-td class="text-center">{{ branch.sales_name || '-' }}</q-td>
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
                  @click="onShowTagSalesForm(branch.id, props.row.id, branch.tenant_id)"
                  v-if="customerType === 2"
                >
                  <q-tooltip>Tag sales person to this branch</q-tooltip>
                </q-icon>
              </q-td>
              <q-td :props="props" key="active" v-if="isAdminOrTenant">
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
      <my-form :id="selectedItem" :customer-type="customerType" @close="onFormClosed" />
    </q-dialog>
    <q-dialog v-model="showTagSalesForm" persistent>
      <tag-sales-person-form
        :item="selectedItem"
        @add-complete="addSalesPerson"
        @edit-complete="editSalesPerson"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import { createStatement } from 'services';
import PersonCard from 'web/share/partial/PersonCard.vue';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import MyForm from './connect_tenants/Form.vue';

export default {
  components: {
    MyForm,
    PersonCard,
    TableTopRight,
    TagSalesPersonForm: () => import('./connect_tenants/TagSalesPersonForm.vue')
  },
  data() {
    return {
      showForm: false,
      showTagSalesForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      customerType: 2, //Customers
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
    isAdminOrTenant() {
      return [1, 2].includes(this.userType);
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
      res.splice(2, 0, {
        name: 'sales_name',
        align: 'center',
        label: 'Sales Person',
        field: 'sales_name',
        format: (v) => v || '-',
        sortable: true
      });

      if (this.isAdminOrTenant) {
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
    sendStatementConfirm(data) {
      this.showPrompt('Confirmation', 'You will send statement to this customer', () =>
        this.sendStatement(data)
      );
    },
    async onBulkSendStatement() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const res = await Api.add('job_schedules', {
          name: 'sendBulkStatement',
          every: 'day',
          start_hour: 0,
          start_minute: 0,
          next_running_at: this.$dayjs().format('YYYY-MM-DD HH:mm:ss'),
          forever: 0
        });
        if (!res.status) throw new Error(res.message);
        Notice.ok('Done. Automation app will process this request');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async sendStatement(data) {
      let sender = this.$store.state.first_name;

      // Send asynchronously
      createStatement(data, sender)
        .then((res) => {
          Notice.ok(`Statement sent to ${data.name}`);
        })
        .catch((err) => {
          Notice.fail(err.message);
        });
      Notice.info(`Sending Statement to ${data.name}`);
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
        `customer_type_id = 2`,
        'DISTINCT(id), name, account_number, xero_id,active, customer_type_id, phone, sales_name, hub, branches, contacts'
      );

      this.data = res.data.map((v) => ({
        ...v,
        branches: v.branches && JSON.parse(v.branches)
      }));
      this.isLoading = false;
    },
    async getDataById(id) {
      const { data } = await Api.get('v_customer_page_dashboard', `id = ${id}`);
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
    },
    onShowTagSalesForm(id, parentId = null, tenantId = null) {
      this.selectedItem = {
        id,
        parentId,
        tenantId
      };
      this.showTagSalesForm = true;
    },
    async addSalesPerson({ parent_id, ...payload }) {
      const res = await Api.add('user_customers', payload);
      if (!res.status) {
        Notice.fail(res.message);
      } else {
        Notice.ok('Sales Person successfully tagged');
      }

      let id = parent_id || payload.customer_id;
      await this.getDataById(id);
      this.showTagSalesForm = false;
    },
    async editSalesPerson({ parent_id, customer_id, user_id, userCustomerId }) {
      const res = await Api.update('user_customers', { user_id }, userCustomerId);
      if (!res.status) {
        Notice.fail(res.message);
      } else {
        Notice.ok('Sales Person successfully tagged');
      }

      const id = parent_id || customer_id;
      await this.getDataById(id);
      this.showTagSalesForm = false;
    },
    async onDownloadCSV() {
      try {
        this.$q.loading.show({ message: 'Please wait...' });
        const res = await Api.get(
          'v_customer_buyer_csv',
          `tenant_id = ${this.$store.state.tenant_id}`,
          'customer_code, customer_name, billing_postal_code, delivery_postal_code, ncnd, payment_term, payment_type, sales_name, hierarchy, profile'
        );
        if (!res.status) throw res.message;

        const baseCSV =
          'data:text/csv;charset=utf-8,' +
          encodeURI(
            `\uFEFFCustomerCode,CustomerName,Profile,BillingPostalCode,DeliveryPostalCode,NCND,PaymentTerm,PaymentType,SalesName,ParentOrBranch\n`
          );

        const csvPart = res.data.reduce((res, v) => {
          let data = `${v.customer_code},${v.customer_name},${v.profile},${v.billing_postal_code},${v.delivery_postal_code},${v.ncnd},${v.payment_term},${v.payment_type},${v.sales_name},${v.hierarchy}\n`;
          return res + data;
        }, '');

        const finalCSV = baseCSV + encodeURIComponent(csvPart);

        const link = document.createElement('a');
        link.setAttribute('href', finalCSV);
        link.setAttribute('download', `${this.$dayjs().format('YYYYMMDD')}_All_Customers.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
      } finally {
        this.$q.loading.hide();
      }
    },
    search(rows, terms, cols) {
      return this.data.filter((x) => {
        return this.getValuesOfNestedObject(x)
          .filter((value) => value != 'NULL' && value)
          .join(' ')
          .toLowerCase()
          .includes(terms.toLowerCase());
      });
    },
    getValuesOfNestedObject(data) {
      return data && typeof data === 'object'
        ? Object.values(data).map(this.getValuesOfNestedObject).flat()
        : [data];
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
