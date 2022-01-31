<template>
  <q-page padding>
    <div class="row q-mb-sm">
      <div class="col-sm-2">
        <div class="text-h4 items-end q-pt-xs page-title">Hub Spree</div>
      </div>
      <div class="col-sm-10 q-gutter-xs">
        <div class="top-search">
          <q-input
            rounded
            v-model="date"
            mask="date"
            :rules="['date']"
            label="Search by Date"
            class="input-search"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date mask="YYYY-MM-DD" v-model="date" @input="filterByDate" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <search-input v-model="filter" label="Search" class="input-search q-ma-sm" />
        </div>
      </div>
    </div>
    <template>
      <div class="q-pt-lg">
        <q-table
          :data="data"
          :columns="columns"
          row-key="id"
          :filter="filter"
          selection="multiple"
          :selected.sync="selected"
          :loading="isLoading"
          :pagination.sync="pagination"
          :rows-per-page-options="[100, 200, 300, 0]"
          no-data-label="No detail available"
          class="tdots-table"
        >
          <template v-slot:top-left>
            <div class="row justify-between items-end">
              <div class="row justify-between items-end">
                <div>
                  <q-btn outline color="primary" no-caps rounded flat @click="getData()">All</q-btn>
                  <q-btn outline color="primary" no-caps rounded flat @click="filterData(0)">Open</q-btn>
                  <q-btn outline color="primary" no-caps rounded flat @click="filterData(1)">Close</q-btn>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:top-right>
            <div class="row justify-between items-end">
              <div>
                <q-btn
                  flat
                  no-caps
                  @click="inception = true"
                  class="btn-add q-mr-sm"
                  style="border-radius: 24px"
                  label="Import"
                />
                <q-btn
                  flat
                  no-caps
                  @click="
                    selectedItem = null;
                    showForm = true;
                  "
                  class="btn-add q-mr-sm"
                  style="border-radius: 24px"
                  label="Create New Spree"
                />
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="primary_text">
                <q-checkbox size="lg" dense v-model="props.selected" class="checkbox" />
              </q-td>

              <q-td class="primary_text" key="id">#{{ props.row.id }}</q-td>

              <q-td class="primary_text" key="hub_name" :props="props">{{ props.row.hub_name }}</q-td>

              <q-td class="primary_text" key="Tenant_name" :props="props">{{ props.row.Tenant_name }}</q-td>

              <q-td class="primary_text" key="Advocate_name" :props="props">{{
                props.row.Advocate_name
              }}</q-td>

              <q-td class="primary_text" :props="props">${{ props.row.prices }}</q-td>

              <q-td key="end_date" :props="props">{{
                $dayjs(props.row.end_date).format('D MMMM YYYY')
              }}</q-td>

              <q-td key="delivery_date" :props="props">{{
                $dayjs(props.row.delivery_date).format('D MMMM YYYY')
              }}</q-td>

              <q-td key="status" :props="props">
                <q-btn-dropdown
                  split
                  rounded
                  unelevated
                  no-caps
                  size="md"
                  align="center"
                  id="odrStatus"
                  :color="getStatusColor(props.row.status)"
                  :label="getStatusLabel(props.row.status)"
                  text-color="white"
                >
                  <div v-if="isAdvocate">
                    <q-list dense v-for="item in listSpreeStatus.name" :key="item">
                      <q-item
                        :active="(props.row.status == 1 ? 'Close' : 'Open') !== item"
                        :clickable="(props.row.status == 1 ? 'Close' : 'Open') !== item"
                        v-close-popup
                      >
                        <q-item-section avatar>
                          <q-avatar class="ellips_processing" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label @click="onChangeSpreeStatus(props.row, item)">{{
                            item
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </q-btn-dropdown>
              </q-td>

              <q-td key="action" :props="props" style="width: 32px">
                <div class="column">
                  <q-btn
                    flat
                    round
                    color="primary"
                    @click="
                      selectedItem = props.row;
                      showForm = true;
                    "
                    icon="eva-edit-outline"
                  >
                    <q-tooltip>Detail or Edit</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="primary"
                    @click="onDeleteSpree(props.row)"
                    icon="eva-trash-2-outline"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
    <q-dialog v-model="showForm" persistent full-height full-width>
      <create-hub-spree-form :item="selectedItem" @Create-HubSpree="OnCreateHubSpree" />
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
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import CreateHubSpreeForm from './createHubSpreeForm.vue';
import { Notice, ImportXlxs, dataToCSV, Api } from 'services';
import { slacknotif } from 'services';
import { updateSpreeData } from 'treeGQL';

export default {
  components: {
    SearchInput,
    CreateHubSpreeForm
  },

  data() {
    return {
      date: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      dateProcess: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      oldStatus: null,
      newStatus: null,
      filter: null,
      inception: false,
      File: null,
      inceptionprocess: false,
      order_inception: false,
      summaryDate: null,
      selectedItem: null,
      selectedcustomer: null,
      selectedreason: null,
      selected: [],
      showForm: false,
      credentials: this.$store.state,
      is_processorder: false,
      customers: [],
      filterCustomers: [],
      reasonlists: [],
      showTransfer: false,
      ExportInprogress: false,
      ExportData: [],
      isLoading: false,
      // listSpreeStatus: {name:["Open", "Close", "Cancel"]},
      listSpreeStatus: { name: ['Open', 'Close'] },
      pagination: {
        rowsPerPage: 100
      },

      columns: [
        {
          name: 'id',
          label: 'Spree Id',
          align: 'left',
          field: 'id',
          sortable: true
        },
        {
          name: 'hub_name',
          align: 'left',
          label: 'Hub Name',
          field: 'hub_name',
          sortable: true
        },
        {
          name: 'Tenant_name',
          align: 'left',
          label: 'Tenant Name',
          field: 'Tenant_name',
          sortable: true
        },
        {
          name: 'Advocate_name',
          align: 'left',
          label: 'Advovate Name',
          field: 'Advocate_name',
          sortable: true
        },
        {
          name: 'end_date',
          align: 'left',
          label: 'End Date',
          field: 'end_date',
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'center',
          label: 'Delivery Date',
          field: 'delivery_date',
          sortable: true
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true
        },
        {
          name: 'action',
          align: 'left',
          label: 'Action',
          field: 'action',
          sortable: true
        }
      ],
      data: []
    };
  },
  computed: {
    isTenant() {
      return (
        this.$store.state.user_type_id == 1 ||
        this.$store.state.user_type_id == 2 ||
        this.$store.state.user_type_id == 4
      );
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    }
  },
  created() {
    this.getData();
  },
  destroyed() {
    this.$s.removeEvents('pre_orders');
  },
  methods: {
    showConfirmDialog(title, message, onOk = null, onCancel = null) {
      this.$q
        .dialog({
          title: title,
          message: message,
          component: ConfirmMessage
        })
        .onOk(onOk ? onOk : () => {})
        .onCancel(onCancel ? onCancel : () => {});
    },

    showAlertDialog(title, message, callback) {
      this.$q
        .dialog({
          title: title,
          message: message,
          component: AlertMessage
        })
        .onDismiss(callback ? callback : () => {});
    },
    async doImport() {
      await ImportXlxs(
        this.credentials,
        dataToCSV,
        this.File,
        'p_import_sprees',
        'spree',
        'IMPORT_SPREE_RESULT',
        'TENANT,HUB,SPREE_ID,REMARK',
        ['tenant', 'hub', 'spree_id', 'remark']
      );
    },
    async getData() {
      if (this.is_processorder) return;
      this.isLoading = true;
      try {
        let hubList = this.credentials.customers.filter(function (str) {
          return str.customer_type.name == 'buyer';
        });
        let tenantIdList = hubList.map((y) => y.tenant_id);
        let where = this.isAdvocate
          ? `tenant_id in (${tenantIdList.join()})`
          : this.isTenant
          ? `tenant_id = '${this.credentials.tenant_id}'`
          : null;
        const res = await this.$api.get('v_hub_spree', where, null, 'delivery_date desc');
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
      this.isLoading = false;
    },
    async filterByDate() {
      this.isLoading = true;
      try {
        const res = await this.$api.get('v_hub_spree', `delivery_date = '${this.date}'`);
        this.data = res.data;
      } catch (error) {}
      this.isLoading = false;
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    customSort(rows, sortBy, descending) {
      const data = [...rows];

      if (sortBy) {
        data.sort((a, b) => {
          const x = descending ? b : a;
          const y = descending ? a : b;

          if (sortBy === 'name') {
            // string sort
            return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0;
          } else {
            // numeric sort
            return parseFloat(x[sortBy]) - parseFloat(y[sortBy]);
          }
        });
      }
      return data;
    },
    getDistinct(arrObj, lookup = []) {
      var result = [];
      for (var idx of arrObj) {
        var obj = {};
        for (var id in idx) {
          if (lookup.includes(id)) {
            obj[id] = idx[id];
          }
        }
        let canAdd = true;
        for (var i of result) {
          let results = [];
          let index = 0;
          for (var l of lookup) {
            results[index] = obj[l] === i[l];
            index++;
          }
          if (!results.includes(false)) canAdd = false;
        }
        if (canAdd) result.push(obj);
      }
      return result;
    },
    async sendNotification(order_id, notification_type) {
      const res = await this.$api.add('app_notification', {
        table_id: order_id,
        user_id: this.$store.state.id,
        app_mode: this.$firebase.appMode(),
        notification_type: notification_type
      });
      return res.status;
    },
    sendslackNotif(name, hubname, item, status_id) {
      slacknotif(name, hubname, item, status_id);
    },

    async OnCreateHubSpree(payload) {
      const update = await this.updateSpree(payload);
      if (update) {
        Notice.ok('Tenant Hub Spree Created');
      }
      this.showForm = false;
      this.getData();
    },

    async filterData(status) {
      this.isLoading = true;
      let tes = [];
      let tenant_name = this.credentials.customers.map(
        (x) => (tes = { customer_type: x.customer_type, name: x.name, tenant_id: x.tenant_id })
      );
      var tenant = tenant_name.filter(function (str) {
        return str.customer_type == 'buyer';
      });
      let custome = tenant.map((y) => y.tenant_id);
      let where = this.isAdvocate
        ? `status = ${status} and tenant_id in (${custome})`
        : this.isTenant
        ? `status = ${status} and tenant_id = '${this.credentials.tenant_id}'`
        : null;
      try {
        const res = await this.$api.get('v_hub_spree', where, null, 'id DESC');
        this.data = res.data;
      } catch (error) {}
      this.isLoading = false;
    },
    getStatusColor(status) {
      switch (status) {
        case 0:
          return 'amber-8';
        case 1:
          return 'red-7';
        default:
          return 'grey';
      }
    },
    getStatusLabel(status) {
      switch (status) {
        case 0:
          return 'Open';
        case 1:
          return 'Close';
        default:
          return '-';
      }
    },
    onChangeSpreeStatus(row, newStatus, index) {
      if (newStatus == 'Open' || row.status == 1) {
        return;
      } else {
        this.$q
          .dialog({
            title: 'Alert',
            message: `Once spree is closed, this action is irreversible. Do you wish to proceed?`,
            component: ConfirmMessage
          })
          .onOk(async () => {
            // const res = await this.$api.exec("p_spree_status_update",[row.id, newStatus == 'Open' ? 0 : newStatus == 'Cancel' ? -1 : 1]);
            const res = await this.$api.exec('p_spree_status_update', [row.id, newStatus == 'Open' ? 0 : 1]);
            this.getData();
          });
      }
    },
    async onDeleteSpree(val) {
      this.$q
        .dialog({
          title: 'Alert',
          message: `Once spree is deleted, this action is irreversible. Do you wish to proceed?`,
          component: ConfirmMessage
        })
        .onOk(async () => {
          const res = await this.$api.update('hub_spree_data', { active: false }, val.id);
          this.getData();
        });
    },
    async updateSpree(payload) {
      try {
        return await this.$apollo
          .mutate({
            mutation: updateSpreeData,
            variables: {
              data: payload
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>
<style scoped>
/* ----------- */
.page-title {
  font-weight: 600;
  font-size: 22px;
}
.top-search {
  text-align: right;
}
.top-search .input-search {
  width: 220px;
  display: inline-block;
}
.mid-top-right {
  text-align: right;
}
.mid-top-right .btn-add {
  width: 170px;
  text-align: center;
}
.o-action {
  border: 1px solid transparent;
  width: auto;
}
.o-action .q-btn__wrapper {
  padding: 0 !important;
  min-height: 1rem;
}
.o-action:hover,
.o-action:active {
  background: transparent;
}
/* ----------- */
.ordered {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.customer_company {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.price_item {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.primary_text {
  font-size: 14px;
  font-weight: bold;
  white-space: normal;
  color: #000000;
}

.ellips_processing {
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background-color: #ffd600;
}

.ellips_processed {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: #57d3e2;
}

.ellips_cancelled {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: red;
}

/* Media Screen */
@media (min-width: 600px) and (max-width: 1013px) {
}

@media (max-width: 599px) {
}
</style>
