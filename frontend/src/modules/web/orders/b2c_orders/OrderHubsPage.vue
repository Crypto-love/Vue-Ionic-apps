<template>
  <q-page padding>
    <div class="row q-mb-sm">
      <div class="col-sm-2">
        <div class="text-h4 items-end q-pt-xs page-title">Hub Orders</div>
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
          <q-input
            v-model="filter"
            label="Search"
            class="input-search q-ma-sm"
            @keydown.enter.prevent="filterById"
          >
            <template v-slot:append>
              <q-icon v-if="filter" name="close" @click="filterGetAll" class="cursor-pointer" />
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <template>
      <div class="q-pt-lg">
        <q-table
          :data="data"
          :columns="columnsParent"
          row-key="order_id"
          :loading="isLoading"
          class="tdots-table"
          :pagination.sync="pagination"
          :rows-per-page-options="[10, 25, 50]"
          @request="onRequest"
        >
          <template v-slot:top-left>
            <div class="row justify-between items-end">
              <div>
                <q-btn outline color="primary" no-caps rounded flat @click="filterGetAll">All</q-btn>
                <q-btn outline color="primary" no-caps rounded flat @click="filterData('Processing in Hub')"
                  >Processing in Hub</q-btn
                >
                <q-btn outline color="primary" no-caps rounded flat @click="filterData('Processed in Hub')"
                  >Processed in Hub</q-btn
                >
                <q-btn outline color="primary" no-caps rounded flat @click="filterData('B2C Processed')"
                  >B2C Processed</q-btn
                >
                <q-btn outline color="primary" no-caps rounded flat @click="filterData('B2C Cancelled')"
                  >B2C Cancelled</q-btn
                >
                <q-btn outline color="primary" no-caps rounded flat @click="filterData('Refunded')"
                  >Refunded</q-btn
                >
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
                  label="Export CSV"
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
                  label="Create New Order"
                />
                <q-btn
                  dense
                  flat
                  no-caps
                  @click="
                    selectedItem = null;
                    showSummary = true;
                  "
                  class="btn-add"
                  label="Summary Order"
                />
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-btn
                  size="sm"
                  color="accent"
                  round
                  dense
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'"
                />
              </q-td>
              <q-td class="primary_text" key="id"> # {{ props.row.order_id }} </q-td>
              <q-td class="primary_text" key="order_total">
                {{ props.row.child[0].paymentB2c ? `${props.row.child[0].paymentB2c.order_total}` : 0.0 }}
              </q-td>
              <q-td class="primary_text" key="refunded_total">
                {{ props.row.child[0].paymentB2c ? `${props.row.child[0].paymentB2c.refunded_amount}` : 0.0 }}
              </q-td>
              <q-td class="primary_text" key="discount_amount">
                {{ props.row.child[0].paymentB2c ? `${props.row.child[0].paymentB2c.discount_amount}` : 0.0 }}
              </q-td>
              <q-td class="primary_text" key="voucher_code">
                <q-btn text-color="primary" round flat icon="eva-info-outline">
                  <q-tooltip>
                    Voucher Code:
                    {{ props.row.child[0].paymentB2c ? `${props.row.child[0].paymentB2c.voucher_code}` : '' }}
                    <br />
                    Voucher Discount Type:
                    {{
                      props.row.child[0].paymentB2c
                        ? `${props.row.child[0].paymentB2c.voucher_discount_type}`
                        : ''
                    }}<br />
                    Voucher Discount:
                    {{
                      props.row.child[0].paymentB2c
                        ? `${props.row.child[0].paymentB2c.voucher_discount}`
                        : ''
                    }}<br />
                    Voucher Min Amount:
                    {{
                      props.row.child[0].paymentB2c
                        ? `${props.row.child[0].paymentB2c.voucher_minimum_amount}`
                        : ''
                    }}<br />
                  </q-tooltip>
                </q-btn>
              </q-td>
              <q-td class="primary_text" key="payment_transaction_id">
                {{ getPaymentTransactionId(props.row.child[0].paymentB2c) }}
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div class="text-left">
                  <order-list-table
                    :filter="filter"
                    :data="props.row.child"
                    :columns="columns"
                    :selectedTenant="selectedTenant"
                    :onDownloadPurchaseOrder="onDownloadPurchaseOrder"
                    :onChangeOrderStatus="onChangeOrderStatus"
                    :listStatusOrder="listStatusOrder"
                    :credentials="credentials"
                    @show-form="showOrderDetails"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom="props">
            <div class="row col-12 t-bottom">
              <div class="col-sm-4 justify-start items-center flex">
                Page per row:
                <q-select
                  class="q-ml-md t-select-row"
                  borderless
                  v-model="pagination.rowsPerPage"
                  :options="[10]"
                  :disable="true"
                />
              </div>
              <div class="col-11 justify-center text-center items-center flex">
                <q-btn
                  icon="chevron_left"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="props.isFirstPage"
                  @click="props.prevPage"
                />
                <span
                  >{{ props.pagination.page }} of
                  {{
                    Math.ceil(
                      (props.pagination.rowsNumber ? props.pagination.rowsNumber : 1) /
                        props.pagination.rowsPerPage
                    )
                  }}</span
                >
                <q-btn
                  icon="chevron_right"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="props.isLastPage"
                  @click="props.nextPage"
                />
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </template>
    <q-dialog v-model="showForm" persistent full-height full-width>
      <create-order-form
        :item="selectedItem"
        :isHub="true"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
        @cancel="getData"
      />
    </q-dialog>
    <q-dialog v-model="showTransfer" persistent>
      <transfer-hub />
    </q-dialog>

    <q-dialog v-model="inception">
      <q-card>
        <q-card-section>
          <div class="text-h6">Please select the delivery date of the orders you would like to export</div>
        </q-card-section>
        <q-card-section>
          <q-select
            filled
            v-model="selectedTenant"
            clearable
            use-input
            fill-input
            option-label="name"
            option-value="tenant_id"
            map-options
            label="Choose Tenant *"
            :options="listTenant"
            @input="LoadHubList(selectedTenant)"
            @filter="filterListTenant"
          />
        </q-card-section>
        <q-card-section>
          <q-input
            rounded
            v-model="dateProcess"
            mask="date"
            :rules="['date']"
            label="Search by Date"
            class="input-search"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date mask="YYYY-MM-DD" v-model="dateProcess" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="q-pt-none"></q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No" color="danger" v-close-popup />
          <q-btn flat label="Yes" color="primary" @click="ExportCSV(this)" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSummary" persistent>
      <summary-order />
    </q-dialog>
  </q-page>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import CreateOrderForm from './order/createOrderForm.vue';
import TransferHub from './order/TransferHub.vue';
import SyncOrder from './order/SyncOrder.vue';
import TierPricing from './order/TierPricing.vue';
import SummaryOrder from './order/SummaryOrder.vue';
import OrderListTable from './order/OrderListTable';
import { Notice, generatePurchaseOrder } from 'services';
import { slacknotif } from 'services';
import {
  updatePreOrderItemB2CDashboardMutation,
  cancelB2cOrder,
  b2cOrderList,
  groupBuyCheckout
} from 'treeGQL';

export default {
  components: {
    SearchInput,
    CreateOrderForm,
    TransferHub,
    SyncOrder,
    TierPricing,
    SummaryOrder,
    OrderListTable
  },

  data() {
    return {
      date: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      dateProcess: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      oldStatus: null,
      newStatus: null,
      filter: null,
      inception: false,
      inceptionprocess: false,
      inceptionSyncOrder: false,
      inceptionSyncPooling: false,
      inceptionTierPricing: false,
      showSyncOrder: false,
      showTierPricing: false,
      showSummary: false,
      syncOrderItem: null,
      tierPricingData: null,
      // order_inception: false,
      summaryDate: null,
      selectedItem: null,
      selectedTenant: null,
      listTenant: [],
      selectedHub: null,
      listHub: [],
      // selectedreason: null,
      selected: [],
      showForm: false,
      credentials: this.$store.state,
      is_processorder: false,
      customers: [],
      filterCustomers: [],
      tenantidlist: null,
      reasonlists: [],
      showTransfer: false,
      ExportInprogress: false,
      ExportData: [],
      isLoading: false,
      listStatusOrder: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10
      },
      columns: [
        {
          name: 'id',
          label: 'Package No',
          align: 'left',
          field: 'id',
          sortable: false
        },
        {
          name: 'customer_name',
          align: 'left',
          label: 'Hub',
          field: 'customer',
          sortable: false
        },
        {
          name: 'stripe_transaction_id',
          align: 'left',
          label: 'Stripe',
          field: 'stripe_transaction_id',
          sortable: false
        },
        {
          name: 'customer_mobile',
          align: 'left',
          label: 'Mobile',
          field: 'mobile',
          sortable: false
        },
        {
          name: 'tenant_name',
          align: 'left',
          label: 'Tenant',
          field: 'tenant_name',
          sortable: false
        },
        {
          name: 'price',
          align: 'left',
          label: 'Purchase',
          field: 'prices',
          sortable: false
        },
        {
          name: 'info',
          align: 'left',
          label: 'Info',
          field: 'info',
          sortable: false
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: false
        },
        {
          name: 'action',
          align: 'left',
          label: 'Action',
          field: 'action',
          sortable: false
        }
      ],
      columnsParent: [
        {
          label: ' ',
          sortable: false
        },
        {
          name: 'order_id',
          label: 'Order Number⠀',
          align: 'left',
          field: 'order_id',
          sortable: false
        },
        {
          name: 'order_total',
          label: 'Order Total',
          align: 'left',
          field: (row) => row.child,
          sortable: false
        },
        {
          name: 'refunded_amount',
          label: 'Refunded Total',
          align: 'left',
          field: (row) => row.child[0].paymentB2c.refunded_amount,
          sortable: false
        },
        {
          name: 'discount_amount',
          label: 'Discount Amount',
          align: 'left',
          field: (row) => row.child[0].paymentB2c.discount_amount,
          sortable: false
        },
        {
          name: 'voucher_code',
          label: 'Voucher',
          align: 'left',
          field: (row) => row.child[0].paymentB2c.voucher_code,
          sortable: false
        },
        {
          name: 'payment_transaction_id',
          label: 'Payment Transaction Id',
          align: 'left',
          field: (row) => row.child[0].paymentB2c.stripe_transaction_id,
          sortable: false
        }
      ],
      data: []
    };
  },
  async created() {
    this.getData();
    this.getListStatus();
    this.listTenant = await this.LoadTenantList();
  },
  destroyed() {
    this.$s.removeEvents('pre_orders');
  },
  methods: {
    async ExportCSV() {
      this.ExportData = [];
      this.$q.loading.show({ message: 'Exporting...' });
      this.ExportInprogress = true;
      const res = await this.$api.get(
        `
        (
          select b.user_id, concat(g.first_name," ",g.last_name) as user_name, g.mobile, f.name as hub,
          e.tenant_id, a.delivery_date, a.order_status_id, f.road, b.order_id,  b.id as order_item_id,
          a.stripe_transaction_id, b.sku_id, c.name as item, b.total_qty, b.total_price, h.name as item_status_name,
          i.name as order_status_name, delivery_method, c.is_b2c_pooling, c.b2c_pooling_qty from pre_orders a
          inner join pre_order_items b on a.id = b.order_id and b.active = 1
          inner join skus c on b.sku_id = c.id
          inner join products d on c.product_id = d.id
          inner join (select * from customers where customer_type_id = 3 and active = 1 ) e on d.tenant_id = e.tenant_id
          inner join (select a.*, b.road from customers a inner join address b on a.id = b. customer_id where customer_type_id = 2 and a.active = 1 and b.address_type_id = 1 and b.active = 1 and hub = 1) f on f.id = b.customer_buyer_id
          inner join (
            select * from users where (user_type_id = 6 and buyer_type = 2 and active = 1) OR (user_type_id = 11 and active = 1)
          ) g on b.user_id = g.id
          inner join order_statuses h on b.order_item_status_id = h.id
          inner join order_item_statuses i on a.order_status_id = i.id
          left join b2c_delivery_method j on a.id = j.order_id
          where e.tenant_id = '${this.selectedTenant.tenant_id}' and a.delivery_date = '${this.dateProcess}' and b.order_item_status_id not in (12,13) and a.order_status_id not in (12,13) and total_qty is not null and order_status_id is not null
        ) a`,
        null,
        null,
        'hub, sku_id, order_id'
      );

      if (res.data.length > 0) {
        var csv =
          'name,mobile,tenant_name, hub,hub address,order number,stripe transaction id, order_item_id, sku_id, order status,item,item order status,quantity,price,pooling status,delivery method,delivery address\n';

        for (let i = 0; i < res.data.length; i++) {
          let name = res.data[i].user_name == null ? '' : res.data[i].user_name;
          let mobile = res.data[i].mobile == null ? '' : res.data[i].mobile;
          let hub = res.data[i].hub == null ? '' : res.data[i].hub;
          let hub_address = res.data[i].road == null ? '' : res.data[i].road;
          let order_number = `#${res.data[i].order_id}`;
          let stripe_transaction_id =
            res.data[i].stripe_transaction_id == null ? '' : res.data[i].stripe_transaction_id;
          let item = res.data[i].item == null ? '' : res.data[i].item;
          let order_status_id = res.data[i].order_status_name == null ? '' : res.data[i].order_status_name;
          let order_item_status_id = res.data[i].item_status_name == null ? '' : res.data[i].item_status_name;
          let qty = res.data[i].total_qty == null ? 0 : res.data[i].total_qty;
          let total_qty_peritem_perhub = res.data
            .filter((x) => x.hub == hub && x.item == item)
            .map((x) => x.total_qty)
            .reduce((a, b) => a + b);
          //set total qty is it reset to 0 or increment
          let total_qty_perhub =
            hub != lasthub_name || total_qty_perhub == null ? qty : total_qty_perhub + qty;
          //to get compare last hub name with current data hub
          let lasthub_name = res.data[i].hub;
          let price = res.data[i].total_price == null ? '$0.00' : `$${res.data[i].total_price}`;
          let pooling_status = 'unsuccessful';
          let delivery_method =
            res.data[i].delivery_method == undefined ? 'Self Collection' : res.data[i].delivery_method;
          let delivery_address =
            delivery_method == 'Self Collection' ? '-' : await this.getFormattedAddress(res.data[i].user_id);

          if (res.data[i].is_b2c_pooling == 0 && res.data[i].total_qty > 0) {
            pooling_status = 'successful';
          } else if (res.data[i].is_b2c_pooling == 1 && res.data[i].total_qty > 0) {
            if (total_qty_peritem_perhub % res.data[i].b2c_pooling_qty == 0) {
              pooling_status = 'successful';
            } else if (
              total_qty_peritem_perhub % res.data[i].b2c_pooling_qty > 0 &&
              res.data[i + 1] == undefined
            ) {
              if (res.data[i].total_qty < total_qty_peritem_perhub % res.data[i].b2c_pooling_qty) {
                pooling_status = pooling_status.concat(' ', res.data[i].total_qty, ' order will cancel');
                let total_unsuccessful =
                  (total_qty_peritem_perhub % res.data[i].b2c_pooling_qty) - res.data[i].total_qty;
                let curindex = i - 1;
                let a = this.ExportData;
                while (total_unsuccessful > 0 && curindex > 0) {
                  this.ExportData[curindex].I_pooling_status = `unsuccessful ${
                    total_unsuccessful > this.ExportData[curindex].I_qty
                      ? this.ExportData[curindex].I_qty - total_unsuccessful
                      : total_unsuccessful
                  } order will cancel`.replace('-', '');
                  total_unsuccessful -= this.ExportData[curindex].I_qty;
                  curindex--;
                  a = this.ExportData;
                }
              } else {
                pooling_status = pooling_status.concat(
                  ' ',
                  total_qty_peritem_perhub % res.data[i].b2c_pooling_qty,
                  ' order will cancel'
                );
              }
            } else if (
              total_qty_peritem_perhub % res.data[i].b2c_pooling_qty > 0 &&
              res.data[i + 1] != undefined &&
              item != res.data[i + 1].sku
            ) {
              if (res.data[i].total_qty < total_qty_peritem_perhub % res.data[i].b2c_pooling_qty) {
                pooling_status = pooling_status.concat(' ', res.data[i].total_qty, ' order will cancel');
                let total_unsuccessful =
                  (total_qty_peritem_perhub % res.data[i].b2c_pooling_qty) - res.data[i].total_qty;
                let curindex = i - 1;
                let a = this.ExportData;
                while (total_unsuccessful > 0 && curindex > 0) {
                  this.ExportData[curindex].I_pooling_status = `unsuccessful ${
                    total_unsuccessful > this.ExportData[curindex].I_qty
                      ? this.ExportData[curindex].I_qty - total_unsuccessful
                      : total_unsuccessful
                  } order will cancel`.replace('-', '');
                  total_unsuccessful -= this.ExportData[curindex].I_qty;
                  curindex--;
                  a = this.ExportData;
                }
              } else {
                pooling_status = pooling_status.concat(
                  ' ',
                  total_qty_peritem_perhub % res.data[i].b2c_pooling_qty,
                  ' order will cancel'
                );
              }
            } else if (
              total_qty_peritem_perhub % res.data[i].b2c_pooling_qty > 0 &&
              res.data[i + 1] != undefined
            ) {
              pooling_status = 'successful';
            } else {
              pooling_status = 'unsuccesful';
            }
          }
          this.ExportData.push({
            I_name: name,
            I_mobile: mobile,
            I_tenant_name: this.selectedTenant.name,
            I_hub: hub,
            I_hub_address: hub_address,
            I_order_number: order_number,
            I_stripe_transaction_id: stripe_transaction_id,
            I_order_item_id: res.data[i].order_item_id,
            I_sku_id: res.data[i].sku_id,
            I_item: item,
            I_item_order_status: order_item_status_id,
            I_order_status: order_status_id,
            I_qty: qty,
            I_price: price,
            I_pooling_status: pooling_status,
            I_delivery_method: delivery_method,
            I_delivery_address: delivery_address
          });
          let abc = this.ExportData;
        }
        this.ExportData.forEach((data) => {
          csv += `${data.I_name},${data.I_mobile},${data.I_tenant_name},${data.I_hub},${data.I_hub_address},${data.I_order_number},${data.I_stripe_transaction_id},${data.I_order_item_id},${data.I_sku_id},${data.I_order_status},${data.I_item},${data.I_item_order_status},${data.I_qty},${data.I_price},${data.I_pooling_status},${data.I_delivery_method},${data.I_delivery_address}\n`;
        });
        var universalBOM = '\uFEFF';
        var encodedUri = encodeURIComponent(universalBOM + csv);
        var link = document.createElement('a');
        link.setAttribute('href', 'data:text/csv; charset=utf-8,' + encodedUri);
        link.setAttribute('download', `ALL_HUB_ORDER_DATA.csv`);
        document.body.appendChild(link);
        link.click();
      } else {
        this.showAlertDialog('export csv', 'No Data To Export', this);
      }
      this.ExportInprogress = false;
      this.$q.loading.hide();
    },
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
    async getListStatus() {
      try {
        const res = await this.$api.get('v_b2c_order_statuses', 'id not in (12,16)');
        this.listStatusOrder = res.data;
      } catch (error) {}
    },
    async getData(page = undefined, perPage = undefined, filter = this.filter) {
      if (this.is_processorder) return;
      this.isLoading = true;
      try {
        this.tenantidlist = [this.credentials.tenant_id];

        //set parameter
        let obj = {
          tenantIdList: this.tenantidlist,
          page: page,
          perPage: perPage
        };
        //get b2c order using new V3 BE
        // this.$q.loading.show({ message: 'Please wait...' });
        const res = await this.getB2cOrder(obj);
        this.isLoading = false;
        // this.$q.loading.hide();
        this.data = res.data?.getB2COrderList?.b2c_order_list;
        this.pagination.rowsNumber = res.data?.getB2COrderList?.total_rows;
        this.getcustomer();
        this.getreasonlists();
      } catch (error) {
        Notice.fail(error.message);
      }
      this.isLoading = false;
    },
    getcustomer() {
      this.customers = this.data;
      this.filterCustomers = this.customers.map((x) => x.customer);
      this.filterCustomers = this.filterCustomers
        .filter((v, i) => {
          return this.filterCustomers.indexOf(v) == i;
        })
        .sort();
    },
    async onAddComplete(newData) {
      try {
        this.$q.loading.show({ message: 'Sending the order...' });
        const response = await this.$apollo
          .mutate({
            mutation: groupBuyCheckout,
            variables: newData
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        const orders = response?.data?.groupBuyCheckout;
        if (orders) {
          this.getData();
          this.showForm = false;
          this.$notice.ok('Order is placed');
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (error) {
        this.$notice.fail(error.message || error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onChangeOrderStatus(row, newStatus, index) {
      if (newStatus == 13 && row.status_id != 13) {
        this.isLoading = true;
        // this.order_inception = true; disable no need to select reason request by JC
        //do cancel and refund with V3 BE
        const cancelOrder = await this.cancelPreOrderB2cDashboard(row.order_id);
        newStatus = cancelOrder.data.cancelB2cOrder?.id || undefined === row.order_id ? '12' : '13'; // check if refund is successfully
        cancelOrder.data.cancelB2cOrder?.id || undefined === row.order_id
          ? this.showAlertDialog('Cancel Order', 'Order cancel has successfully, and has been refunded', null)
          : this.showAlertDialog(
              'Cancel Order',
              'Order cancel has successfully, but not yet refund please try refund from stripe',
              null
            ); // check if refund is successfully
        this.getData();
        this.isLoading = false;
      }
    },
    async onEditComplete({ delivery_data: deliverydata, items: orderItems, ...orderData }) {
      const { status, data } = await this.$api.get(
        'pre_order_items',
        `order_id = ${orderData.id} and active = 1`
      );

      if (!status) {
        return;
      }

      const currentItemSkus = [];
      let customer_buyer_id = [];
      let customer_seller_id = [];
      let origin_unit_price = [];
      let amount_qty = [];
      let product_type_id = [];
      let last_user_id = [];
      let group_id = [];
      let invoice_id = [];

      data.forEach((item) => {
        currentItemSkus[item.sku_id] = item.id;
        customer_buyer_id = item.customer_buyer_id;
        customer_seller_id = item.customer_seller_id;
        origin_unit_price = item.origin_unit_price;
        amount_qty = item.amount_qty;
        product_type_id = item.product_type_id;
        group_id = item.group_id;
        invoice_id = item.invoice_id;
        last_user_id = orderData.last_user_id;
      });

      orderItems.forEach(async (v) => {
        if (!currentItemSkus.hasOwnProperty(v.sku_id)) {
          const payload = {
            order_id: orderData.id,
            sku_id: v.sku_id,
            user_id: orderData.last_user_id,
            amount_qty: amount_qty,
            total_qty: v.total_qty,
            origin_unit_price: origin_unit_price,
            sale_unit_price: v.sale_unit_price,
            original_sale_unit_price: v.sale_unit_price,
            customer_seller_id: customer_seller_id,
            customer_buyer_id: customer_buyer_id,
            total_price: v.total_price,
            original_total_price: v.total_price,
            tax: v.tax,
            original_tax: v.tax,
            group_id: group_id,
            invoice_id: invoice_id,
            last_user_id: last_user_id,
            product_type_id: product_type_id,
            order_item_status_id: v.order_item_status_id
          };

          await this.$api.add('pre_order_items', payload);
        } else {
          const oldQty = await this.$api.get('pre_order_items', `id = ${v.id}`, 'total_qty');
          if (v.total_qty < oldQty.data[0].total_qty) {
            await this.updatePreOrderItemB2CDashboard(v.id, v.total_qty);
          }
        }
      });

      if (!orderItems.map((v) => v.active).includes(1)) {
        orderData.active = false;
      }

      await this.$api.update('pre_orders', orderData, orderData.id);
      // disable V2 delivery method no using on V3
      // await this.$api.update('b2c_delivery_method', deliverydata, deliverydata.id);
      // disable V2 function to recalcula pooling Data already included on cancelB2cOrderItems or cancelB2cOrder
      // await this.recalculateAllPoolingDatabyHub(
      //   orderItems[0].tenant_id,
      //   orderItems[0].customer_buyer_id,
      //   orderItems[0].close_date
      // );
      this.getData();
      this.showForm = false;
    },
    async updatePreOrderItemB2CDashboard(preOrderItemId, newTotalQty) {
      try {
        this.isLoading = true;
        await this.$apollo
          .mutate({
            mutation: updatePreOrderItemB2CDashboardMutation,
            variables: {
              preOrderItemId: preOrderItemId,
              newTotalQty: newTotalQty
            }
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async cancelPreOrderB2cDashboard(preOrderId) {
      this.isLoading = true;
      try {
        return await this.$apollo
          .mutate({
            mutation: cancelB2cOrder,
            variables: {
              id: preOrderId,
              appMode: this.$firebase.appMode()
            }
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    changeStatus() {
      this.$q
        .dialog({
          title: 'Confirm',
          message: 'Would you change status ?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.updateStatus();
        })
        .onCancel(() => {});
    },
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'processing in hub':
          return 'amber-8';
        case 'processed in hub':
          return 'cyan';
        case 'b2c processed':
          return 'primary';
        case 'b2c cancelled':
          return 'red-7';
        case 'refunded':
          return 'red-7';
        default:
          return 'grey';
      }
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
    filterGetAll() {
      this.filter = undefined;
      this.getData();
    },
    async filterData(status) {
      this.isLoading = true;
      try {
        //set parameter
        let obj = {
          tenantIdList: this.tenantidlist,
          status: status,
          page: this.pagination.page,
          perPage: this.pagination.rowPerPage
        };
        //get b2c order using new V3 BE
        const res = await this.getB2cOrder(obj);
        this.data = res.data?.getB2COrderList?.b2c_order_list;
        this.pagination.rowsNumber = res.data?.getB2COrderList?.total_rows;
      } catch (error) {}
      this.isLoading = false;
    },
    async filterByDate() {
      this.isLoading = true;
      try {
        //set parameter
        let obj = {
          tenantIdList: this.tenantidlist,
          deliveryDate: new Date(this.date).toISOString(),
          page: this.pagination.page,
          perPage: this.pagination.rowPerPage
        };
        //get b2c order using new V3 BE
        const res = await this.getB2cOrder(obj);
        this.data = res.data?.getB2COrderList?.b2c_order_list;
        this.pagination.rowsNumber = res.data?.getB2COrderList?.total_rows;
      } catch (error) {}
      this.isLoading = false;
    },
    async filterById() {
      this.isLoading = true;
      try {
        //set parameter
        let obj = {
          tenantIdList: this.tenantidlist,
          page: this.pagination.page,
          perPage: this.pagination.rowPerPage,
          orderId: parseInt(this.filter)
        };
        //get b2c order using new V3 BE
        const res = await this.getB2cOrder(obj);
        this.data = res.data?.getB2COrderList?.b2c_order_list;
        this.pagination.rowsNumber = res.data?.getB2COrderList?.total_rows;
      } catch (error) {}
      this.isLoading = false;
    },
    async onDownloadPurchaseOrder(id) {
      try {
        this.$q.loading.show({ message: 'Downloading...' });
        const res = await this.$api.get('v_order_download_po_b2c', `id = ${id}`);
        if (!res.status) throw new Error(res.message);

        const data = res.data[0];

        await generatePurchaseOrder(data, data.order_number);
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async getFormattedAddress(userid) {
      const res = await this.$api.get('v_users', `id = '${userid}'`);

      let address = res.data[0].address[0];
      let result = address.road ? address.road : '';

      if (address.building) {
        result = result ? result + ' ' : '';
        result += address.building;
      }

      if (!address.floor_number && address.unit) {
        result = result ? result + ' ' : '';
        result += address.unit;
      } else if (address.floor_number && !address.unit) {
        result = result ? result + ' ' : '';
        result += 'Level ' + address.floor_number;
      } else if (address.floor_number && address.unit) {
        result = result ? result + ' ' : '';
        result += '#' + address.floor_number + '-' + address.unit;
      }

      if (address.stall) {
        result = result ? result + ' ' : '';
        result += address.stall;
      }
      if (address.city) {
        result = result ? result + ' ' : '';
        result += address.city;
      }
      if (address.state) {
        result = result ? result + ' ' : '';
        result += address.state;
      }
      if (address.postal_code) {
        result = result ? result + ' ' : '';
        result += address.postal_code;
      }

      return result;
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
    getreasonlists() {
      this.reasonlists = { reason: ['POOLING UNSUCCESSFULL', 'USER REQUEST', 'NOT MEET MOQ'] };
    },
    sendslackNotif(name, hubname, item, status_id) {
      slacknotif(name, hubname, item, status_id);
    },
    filterListTenant(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();

        this.listTenant = this.listTenant.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
    async LoadTenantList() {
      const res = await this.$api.get('v_tenants');
      return res.data;
    },
    async LoadHubList(selectedTenant) {
      const res = await this.$api.get('v_tenant_hubs', `id = ${selectedTenant.tenant_id}`);
      this.listHub = res.data;
    },
    async getB2cOrder(obj) {
      this.isLoading = true;
      try {
        return await this.$apollo
          .query({
            query: b2cOrderList,
            variables: {
              tenantIdList: obj.tenantIdList,
              deliveryDate: obj.deliveryDate ? obj.deliveryDate : undefined,
              status: obj.status ? obj.status : undefined,
              orderId: obj.orderId ? obj.orderId : undefined,
              page: obj.page,
              perPage: obj.perPage
            }
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.loading.hide();
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.loading.hide();
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    showOrderDetails(val) {
      this.selectedItem = val.data;
      this.showForm = val.showForm;
    },
    async onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      await this.getData(page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    getPaymentTransactionId(val) {
      if (val.payment_transaction_id) {
        return val.payment_transaction_id;
      } else if (val.stripe_transaction_id) {
        return val.stripe_transaction_id;
      } else return '-';
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
