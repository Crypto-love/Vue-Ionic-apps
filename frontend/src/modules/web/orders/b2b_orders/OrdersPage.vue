<template>
  <q-page padding>
    <div class="o-header">
      <div class="row">
        <!-- row 1 -->
        <div class="col-xs-12 col-md-6 col-lg-8">
          <div class="text-h4 text-h6">Orders</div>
        </div>
        <div class="col-xs-12 col-md-6 col-lg-4">
          <div class="row o-search q-mb-sm">
            <q-input
              dense
              rounded
              v-model="date"
              mask="date"
              :rules="['date']"
              label="Search by Date"
              class="input-search"
              debounce="500"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date mask="YYYY-MM-DD" v-model="date" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <search-input v-model="filter" label="Search By Order ID or Customer Name" class="input-search" />
          </div>
        </div>
      </div>
      <div class="row">
        <!-- row 2 -->
        <div class="col-xs-12 col-sm-6 btn-group1">
          <q-btn
            dense
            :flat="selectedStatus != null"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = null"
            >All</q-btn
          >
          <q-btn
            dense
            :flat="selectedStatus != 'Processing'"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = 'Processing'"
            >Processing</q-btn
          >
          <q-btn
            dense
            :flat="selectedStatus != 'Processed'"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = 'Processed'"
            >Processed</q-btn
          >
          <q-btn
            dense
            :flat="selectedStatus != 'Completed'"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = 'Completed'"
            >Completed</q-btn
          >
          <q-btn
            dense
            :flat="selectedStatus != 'Delivered'"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = 'Delivered'"
            >Delivered</q-btn
          >
          <q-btn
            dense
            :flat="selectedStatus != 'Cancelled'"
            unelevated
            no-caps
            color="primary"
            class="adt-btn q-mr-sm"
            @click="selectedStatus = 'Cancelled'"
            >Cancelled</q-btn
          >
        </div>
        <div class="col-xs-12 col-sm-6 btn-group2">
          <div class="xs-6">
            <q-btn
              dense
              flat
              no-caps
              @click="
                selectedItem = null;
                showForm = true;
              "
              class="btn-add"
              label="Create New Order"
              data-cy="create-order-btn"
            />
          </div>
          <div class="xs-6">
            <q-btn dense flat no-caps @click="inception = true" class="btn-add" label="Process Order" />
          </div>
          <div class="xs-12">
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
      </div>
    </div>
    <template>
      <div class="q-pt-lg">
        <q-table
          :data="data"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="isLoading"
          :pagination.sync="pagination"
          :rows-per-page-options="[50, 100, 200, 300, 0]"
          @request="onRequest"
          class="tdots-table"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="primary_text" key="id">#{{ props.row.id }}</q-td>
              <q-td class="primary_text" key="customer_name" :props="props">
                {{ props.row.customer }}
                <div class="customer_company">{{ props.row.tenant_name }}</div>
              </q-td>
              <!-- Hide for a while
              <q-td class="primary_text">{{ props.row.payment_method }}</q-td> -->
              <q-td class="primary_text">
                <div v-if="props.row.stripe_transaction_id == null">
                  <q-icon size="sm" name="eva-close-outline" color="grey" />
                </div>
                <div v-else>
                  <q-icon size="sm" name="eva-checkmark-outline" color="primary" />
                </div>
              </q-td>
              <q-td class="primary_text">{{ props.row.po_number }}</q-td>

              <q-td class="primary_text" :props="props"
                >{{ credentials.currency_symbol }}{{ props.row.prices }}</q-td
              >

              <q-td class="primary_text" key="price" :props="props"
                >{{ credentials.currency_symbol
                }}{{ $helper.displayPrice(Number(props.row.prices) + Number(props.row.taxes)) }}</q-td
              >

              <q-td key="delivery_date" :props="props">{{
                $dayjs(props.row.delivery_date).format('D MMMM YYYY')
              }}</q-td>
              <q-td key="info" :props="props">
                <q-icon name="eva-info-outline" size="sm" />
                <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">{{
                  props.row.info
                }}</q-tooltip>
              </q-td>
              <q-td key="status" :props="props">
                <q-btn-dropdown
                  split
                  rounded
                  unelevated
                  no-caps
                  size="md"
                  :label="capitalize(props.row.status)"
                  align="center"
                  id="odrStatus"
                  :color="getStatusColor(props.row.status)"
                  text-color="white"
                >
                  <q-list dense v-for="(item, index) in listStatusOrder" :key="index">
                    <q-item
                      :active="item.id > props.row.status_id"
                      :clickable="item.id > props.row.status_id"
                      @click="onChangeOrderStatus(props.row, item.id)"
                      v-close-popup
                    >
                      <q-item-section avatar>
                        <q-avatar class="ellips_processing" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-td>
              <q-td key="action" :props="props" style="width: 32px">
                <div class="column items-center justify-around q-my-sm">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-car-outline"
                    :disable="![-1, -2, 10].includes(props.row.status_id) && props.row.id === null"
                    @click="
                      selectedItem = props.row.id;
                      showRelatedDODialog = true;
                    "
                  >
                    <q-tooltip>Download Delivery Order</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-cloud-download-outline"
                    :disable="![-1, -2, 10].includes(props.row.status_id) && props.row.id === null"
                    @click="
                      selectedItem = props.row.id;
                      showRelatedInvoiceDialog = true;
                    "
                  >
                    <q-tooltip>Download Invoice</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="eva-clipboard-outline"
                    @click="onDownloadPurchaseOrder(props.row.id)"
                  >
                    <q-tooltip>Download Purchase Order</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="primary"
                    @click="
                      selectedItem = props.row;
                      showForm = true;
                    "
                    icon="eva-file-text-outline"
                  >
                    <q-tooltip>Detail or Edit</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="red"
                    icon="eva-slash-outline"
                    :disable="props.row.status_id === 10"
                    @click="onCancelOrder(props.row)"
                  >
                    <q-tooltip>Cancel this order</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>
    <q-dialog v-model="showForm" persistent full-height full-width>
      <create-order-form :item="selectedItem" @add-complete="onAddComplete" @edit-complete="onEditComplete" />
    </q-dialog>

    <q-dialog v-model="showSummary" persistent>
      <summary-order />
    </q-dialog>

    <q-dialog v-model="showRelatedInvoiceDialog" full-height>
      <preview-invoice v-if="showRelatedInvoiceDialog" :id="selectedItem" />
    </q-dialog>

    <q-dialog v-model="showRelatedDODialog" full-height>
      <preview-delivery-order v-if="showRelatedDODialog" :id="selectedItem" />
    </q-dialog>

    <q-dialog v-model="showDownloadPODialog" full-height>
      <view-purchase-order
        v-if="showDownloadPODialog"
        :order-id="selectedItem.id || null"
        :id="selectedItem"
      />
    </q-dialog>

    <q-dialog v-model="inception">
      <q-card>
        <q-card-section>
          <div class="text-h6">Process Order</div>
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
                  <q-date mask="YYYY-MM-DD" v-model="dateProcess" @input="() => $refs.qDateProxy.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="q-pt-none"></q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No" color="danger" v-close-popup />
          <q-btn flat label="Yes" color="primary" @click="processOrder" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import CreateOrderForm from './order/createOrderForm.vue';
import SummaryOrder from './order/SummaryOrder.vue';
import PreviewInvoice from './order/PreviewInvoice.vue';
import PreviewDeliveryOrder from './order/PreviewDeliveryOrder.vue';
import ViewPurchaseOrder from './order/ViewPurchaseOrder.vue';
import AddInventoryQuantity from './order/AddInventoryQuantity.vue';
import { date } from 'quasar';
import { Api, Notice, generatePurchaseOrder } from 'services';
import { poNotification, slackOrderNotification } from 'services';
import { stripe } from 'services';
import { production, twilio_dev_number } from 'src/config';

export default {
  components: {
    SearchInput,
    CreateOrderForm,
    SummaryOrder,
    PreviewInvoice,
    PreviewDeliveryOrder,
    ViewPurchaseOrder,
    AddInventoryQuantity
  },

  data() {
    return {
      credentials: this.$store.state,
      inception: false,
      // date: this.$dayjs(new Date()).format("YYYY/MM/DD"),
      date: null,
      dateProcess: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      filter: null,
      summaryDate: null,
      selectedItem: null,
      showForm: false,
      showSummary: false,
      showRelatedInvoiceDialog: false,
      showRelatedDODialog: false,
      showDownloadPODialog: false,
      isLoading: false,
      selectedStatus: null,
      listStatusOrder: [],
      pagination: {
        rowsPerPage: 50,
        page: 1,
        rowsNumber: 0
      },
      columns: [
        {
          name: 'id',
          label: 'Order Number',
          align: 'left',
          field: 'id',
          sortable: true
        },
        {
          name: 'customer_name',
          align: 'left',
          label: 'Customers',
          field: 'customer',
          sortable: true
        },
        /* Hide for a while
        {
          name: "payment_method",
          align: "center",
          label: "Payment Method",
          field: "payment_method",
          sortable: true,
        },*/
        {
          name: 'stripe_transaction_id',
          align: 'left',
          label: 'Stripe',
          field: 'stripe_transaction_id'
        },
        {
          name: 'po_number',
          align: 'center',
          label: 'PO Number',
          field: 'po_number',
          sortable: true
        },
        {
          name: 'price',
          align: 'left',
          label: 'Price',
          field: 'prices',
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'left',
          label: 'Delivery Date',
          field: 'delivery_date',
          sortable: true
        },
        {
          name: 'info',
          align: 'left',
          label: 'Info',
          field: 'info',
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

  watch: {
    selectedStatus(v) {
      this.onRequest({
        pagination: {
          ...this.pagination,
          page: 1
        },
        filter: this.filter
      });
    },
    date(v) {
      this.onRequest({
        pagination: {
          ...this.pagination,
          page: 1
        },
        filter: this.filter
      });
    }
  },

  created() {
    this.onRequest({
      pagination: this.pagination,
      filter: undefined
    });
    this.getListStatus();
    this.$s.setEvents('orders', this.getOrderById);
  },
  destroyed() {
    this.$s.removeEvents('orders');
  },
  methods: {
    async getTotalData(filter = null, status = null, date = null) {
      let where = `tenant_id=${this.credentials.tenant_id}`;
      if (status) {
        where += ` AND status = '${status}'`;
      }

      if (date) {
        where += ` AND delivery_date = '${date}'`;
      }

      if (filter) {
        const lcFilter = filter.toLowerCase();
        where += ` AND (LOWER(id) LIKE '%${lcFilter}%' OR LOWER(customer) LIKE '%${lcFilter}%')`;
      }

      const res = await Api.get('v_order_summary_b2b', where, 'COUNT(0) AS count', 'id desc');
      if (!res.status) throw new Error(res.message);
      if (res.data.length === 0) throw new Error('getTotalData: error when retrieving count of all data');
      return res.data[0].count;
    },

    async getOrders(limit, offset, filter = null, status = null, date = null) {
      let where = `tenant_id=${this.credentials.tenant_id}`;
      if (status) {
        where += ` AND status = '${status}'`;
      }

      if (date) {
        where += ` AND delivery_date = '${date}'`;
      }

      if (filter) {
        const lcFilter = filter.toLowerCase();
        where += ` AND (LOWER(id) LIKE '%${lcFilter}%' OR LOWER(customer) LIKE '%${lcFilter}%')`;
      }

      const res = await Api.get('v_order_summary_b2b', where, null, 'id desc', limit, offset);
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
        this.pagination.rowsNumber = await this.getTotalData(filter, this.selectedStatus, this.date);

        const limit = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;
        const offset = (page - 1) * rowsPerPage;

        const orders = await this.getOrders(limit, offset, filter, this.selectedStatus, this.date);
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
    async getOrderById(data) {
      const res = await Api.get(
        'v_order_summary',
        `status_id NOT IN (-2, -1, 11, 12, 13) and id=${data[0].order_id} and tenant_id=${this.credentials.tenant_id}`
      );
      if (res.status && res.data.length > 0) {
        let order = res.data[0];
        let index = this.data.findIndex((x) => x.id === order.id);
        if (index >= 0) {
          this.data[index] = order;
          this.data.sort((a, b) => {
            return b.id - a.id;
          });
        } else {
          this.data.unshift(order);
        }
      }
    },

    async getData() {
      this.isLoading = true;
      try {
        const res = await Api.get(
          'v_order_summary_b2b',
          `tenant_id=${this.credentials.tenant_id}`,
          null,
          'id desc'
        );
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
      this.isLoading = false;
    },

    async chargeStripe(orderItems, stripe_customer_id) {
      let total_price_with_tax =
        orderItems
          .map((x) => {
            const tax = this.$helper.displayPrice((Number(x.tax_rate) / 100) * x.total_price);
            if (x.total_price <= 0) return x.total_price; // If there's a discount item (the price has negative value), then don't calculate the tax
            return Number(x.total_price) + Number(tax);
          })
          .reduce((a, b) => a + b, 0) * 100;

      if (total_price_with_tax === 0) {
        throw new Error(
          "There's an error when calculating total price. Total price is 0, nothing to be charged"
        );
      }

      const charge = await stripe.addCharge(
        stripe_customer_id,
        this.$helper.displayPrice(total_price_with_tax),
        this.credentials.email
      );
      if (charge.data[0].error) {
        throw new Error(
          `Charge to card fail, because ${charge.data[0].error.message} (${charge.data[0].error.param})`
        );
      }
      if (!charge.status) {
        throw new Error('Charge to card fail!');
      }
      if (charge.data.length <= 0) {
        throw new Error('No Charge detail!');
      }

      let chargeId = charge.data[0].id;

      return chargeId || null;
    },

    /**
     * Confirm charge
     * If failed, then cancel the order & cancel the charge
     */
    async confirmCharge(orderId, chargeId, cardId) {
      try {
        // `cardId` is credit card selected by user on Payment Selection
        let stripe_card_id = cardId
          ? cardId
          : this.credentials.stripe_card_id
          ? this.credentials.stripe_card_id
          : this.selectedCompany.stripe_card_id;

        const confirm = await stripe.confirmCharge(chargeId, stripe_card_id);
        if (!confirm.status) {
          throw new Error('confirm payment fail!');
        }

        if (confirm.data.length <= 0) {
          throw new Error('No payment confirmation detail!');
        }

        if (confirm.data[0].error) {
          throw new Error(`Confirm Payment failed, because ${confirm.data[0].error.message}`);
        }

        let result = confirm.data[0].status;

        if (result !== 'succeeded') {
          throw new Error(`Payment status ${result}`);
        }

        await stripe.updateCharge(chargeId, `#${orderId} paid successfully`);

        return confirm.data[0];
      } catch (error) {
        /** Cancel the charge and then cancel the order */
        await this.cancelCharge(chargeId, 'abandoned');
        await stripe.updateCharge(chargeId, `#${orderId}: ${error.message}`);
        await this.cancelOrderById(orderId);

        throw error;
      }
    },

    async cancelCharge(chargeId, reason) {
      const result = await stripe.cancelHoldCharge(chargeId, reason);
      if (!result.status) throw new Error(`Cancel Charge failed: ${result.message}`);
      if (result.data[0].error) {
        throw new Error(`Cancel charge failed, because ${result.data[0].error.message}`);
      }
      if (result.data.length <= 0) {
        throw new Error('Cancel charge failed: No response received!');
      }

      return result.data[0];
    },

    async onAddComplete(newData) {
      try {
        /** Handle Stripe charge here */
        if (newData.payment_type === 2) {
          if (!newData.stripe_customer_id || !newData.stripe_card_id) {
            throw new Error('Payment type for this customer is credit card, but no card registered yet');
          }
          this.$q.loading.show({ message: 'Charging credit card...' });
          newData.stripe_transaction_id = await this.chargeStripe(newData.items, newData.stripe_customer_id);

          /**
           * if somehow this.chargeStripe() keep returning null, throw error. Just in case. Because there's a bug that need to be found
           * Just remember that, if you are charging via stripe, newData.stripe_transaction_id MUST have a value. This is important
           */
          if (newData.stripe_transaction_id === null) {
            throw new Error('Error when charging credit card: Invalid charge ID');
          }
        }

        this.$q.loading.show({ message: 'Placing order...' });
        if (!this.$store.state.currency_code || !this.$store.state.currency_symbol) {
          throw new Error("Can't detect your account currency. Please re-login.");
        }
        newData.currency_code = this.$store.state.currency_code;
        newData.currency_symbol = this.$store.state.currency_symbol;
        /** p_orders require 2 param, last one was status. default is 1 (processing) */
        const { data, status, message } = await this.$api.exec('p_orders', [
          JSON.stringify(newData).replace(/'/g, '`'),
          1,
          this.credentials.tenant_id
        ]);

        if (!status) {
          this.$q.loading.show({ message: 'Cancelling stripe charge...' });
          let errmessage = `Problem when saving order: ${message}.`;

          if (newData.stripe_transaction_id) {
            errmessage += ' Your credit card payment will be cancelled';

            await this.cancelCharge(newData.stripe_transaction_id, 'abandoned');
          }

          throw new Error(errmessage);
        }

        const newOrderId = data.length > 0 ? data[0].id : 0;

        /** Update & Confirm Charge */
        if (newData.stripe_transaction_id) {
          await this.confirmCharge(newOrderId, newData.stripe_transaction_id, newData.stripe_card_id);
        }

        /** Send PO Notif Asynchronously, no need to await */
        poNotification(newOrderId)
          .then(() => Notice.ok("Purchase Order sent to PIC's whatsapp"))
          .catch((err) => {
            Notice.fail(err.message);
          });
        slackOrderNotification({
          ...newData,
          delivery_date: newData.delivery_date.replaceAll('/', '-'),
          id: newOrderId,
          buyer_name: `${this.credentials.first_name} ${this.credentials.last_name || ''}`
        });

        this.onRequest({
          pagination: {
            ...this.pagination,
            page: 1
          },
          filter: this.filter
        });

        Notice.ok('Add Order');

        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onEditComplete(orderId, updateData, shouldCancelOrder = false) {
      try {
        this.$q.loading.show({ message: 'Updating order...' });

        /** if current status was not processing or processed, set to processed*/
        let newStatus = this.selectedItem.status_id > 2 ? 2 : this.selectedItem.status_id;

        /** p_orders require 2 param, last one was status. default is 1 (processing) */
        const { status, data, message } = await this.$api.exec('p_update_order_by_id', [
          orderId,
          JSON.stringify(updateData).replace(/'/g, '`'),
          newStatus,
          this.credentials.tenant_id
        ]);

        if (!status) throw new Error(message);
        if (data.length === 0) throw new Error('Something wrong');

        /** If all of the item is deleted or cancelled, then also mark the order as cancelled  */
        if (shouldCancelOrder) {
          const orderRes = await this.$api.update(
            'orders',
            {
              order_status_id: 10
            },
            orderId
          );

          if (!orderRes.status) throw new Error(orderRes.message);
        }

        let noCancelledItem = true;
        let persons; // List of pic

        for (const item of updateData.items) {
          if (
            item.order_item_status_id == 10 &&
            item.prev_order_item_status_id &&
            item.prev_order_item_status_id != 10
          ) {
            if (!persons) persons = await this.getCustomerPIC(updateData.customer_id);

            if (persons && persons.length > 0) {
              noCancelledItem = false;
              this.sendNotification({ ...this.selectedItem, sku: item.sku }, 'cancel_order_item');

              // WhatsApp notifiction is not applied yet,
              // because the template in Twilio is not ready yet.
              // this.sendWaNotification(persons[0].phone, ``)
            }
          }
        }

        // If notification for item cancellation has been sent,
        // no need to send update order notification
        if (noCancelledItem) this.sendNotification(this.selectedItem, 'update_order');

        await this.onRequest({
          pagination: {
            ...this.pagination,
            page: 1
          },
          filter: this.filter
        });

        Notice.ok('Edit Order');

        this.showForm = false;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'processing':
          return 'amber-8';
        case 'processed':
          return 'cyan';
        case 'cancelled':
          return 'red-7';
        case 'delivered':
          return 'primary';
        default:
          return 'grey';
      }
    },
    async onChangeOrderStatus(row, newStatus, index) {
      this.$q
        .dialog({
          title: 'Warning',
          message: `Do you want to change the status? This can't be undone`,
          component: ConfirmMessage
        })
        .onOk(async () => {
          this.changeOrderStatus(row, newStatus);
        });
    },
    async changeOrderStatus(order, newStatusId) {
      const res = await this.$api.exec('p_change_order_status', [order.id, newStatusId]);

      if (res.status && newStatusId == 2) this.sendNotification(order, 'process_order');
      else if (res.status && newStatusId == 10) this.sendNotification(order, 'cancel_order');

      this.onRequest({
        pagination: {
          ...this.pagination,
          page: 1
        },
        filter: this.filter
      });
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
    async getListStatus() {
      try {
        const res = await Api.get('order_statuses', 'id >= 1 AND id < 10');
        this.listStatusOrder = res.data;
      } catch (error) {}
    },

    async processOrder() {
      const date = this.$dayjs(this.dateProcess).format('YYYY-MM-DD');

      this.$q.loading.show({
        message: 'Please wait...'
      });

      try {
        const response = await this.$api.get(
          'v_order_summary',
          `delivery_date = '${date}' AND status_id = 1 and tenant_id = ${this.credentials.tenant_id}`,
          'id,customer_buyer_id'
        );

        if (!response.status) throw response.message;

        const { status, message, data } = await this.$api.exec('p_process_order', [
          date,
          this.credentials.tenant_id
        ]);

        this.showAlertDialog('Success', `${response.data.length} order set to processed`);

        if (!status) throw message;

        this.onRequest({
          pagination: {
            ...this.pagination,
            page: 1
          },
          filter: this.filter
        });

        response.data.forEach((value) => {
          this.sendNotification(value, 'process_order');
        });
      } catch (err) {
        this.showAlertDialog('Failed', err);
      } finally {
        this.$q.loading.hide();
      }
    },

    async onDownloadPurchaseOrder(id) {
      this.selectedItem = { id };
      this.showDownloadPODialog = true;
    },

    async sendNotification(order, type) {
      if (order && type)
        this.$api.add('app_notification', {
          target_only: true,
          notification_type: type,
          app_mode: this.$firebase.appMode(),
          user_id: this.credentials.id,
          customer_id: order.customer_buyer_id,
          order_id: order.id,
          sku: order.sku
        });
    },

    async getCustomerPIC(customerId) {
      const { status, data } = await this.$api.get(
        'persons',
        `customer_id = ${customerId} AND active = 1 AND position = 'Key Contact'`,
        'phone'
      );

      return data;
    },
    /**
     *  async sendWaNotification(destinationNumber, message) {
      let phone = production ? destinationNumber : twilio_dev_number;
      phone = getPhoneString(phone);

      this.$api.add("tw_Messages.json", {
        To: `whatsapp:${phone}`,
        Body: message,
      });
    }
     */

    onCancelOrder(order) {
      this.showConfirmDialog(
        'Confirmation',
        'Do you want to cancel this order ? this cannot be undone',
        () => {
          /**
           * If statusId = 1, use 'null' at the restock_payload
           * If statusId > 1, then use the restock_payload
           */
          if (order.status_id == 1) this.cancelOrder(order, undefined);
          else this.showAddInventoryQuantityDialog(order);
        }
      );
    },

    showAddInventoryQuantityDialog(order) {
      this.$q
        .dialog({
          cancel: true,
          persistent: true,
          orderId: order.id,
          component: AddInventoryQuantity
        })
        .onOk((itemPayload) => {
          this.cancelOrder(order, JSON.stringify(itemPayload));
        });
    },

    async cancelOrder(order, itemPayload) {
      try {
        this.$q.loading.show({ message: 'Cancelling order...' });

        const res = await Api.exec('p_cancel_order_by_id', [order.id, itemPayload]);
        if (!res.status) {
          throw new Error(res.message);
        }

        Notice.ok(`Order #${order.id} cancelled`);

        this.onRequest({
          pagination: {
            ...this.pagination,
            page: 1
          },
          filter: this.filter
        });

        this.sendNotification(order, 'cancel_order');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    async cancelOrderById(id) {
      const res = await Api.exec('p_cancel_order_by_id', [id, 'null']);
      if (!res.status) throw new Error(res.message);
      return true;
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

/*-------------------- */
.o-search .input-search {
  width: 50%;
}
.o-search .input-search:first-child {
  padding-right: 1rem;
}
.btn-add {
  margin-top: 0 !important;
}
.btn-group2 {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.btn-group2 .btn-add {
  margin-left: 0.25rem;
  margin-bottom: 0.25rem;
}

@media (max-width: 990px) {
  .btn-group1,
  .btn-group2 {
    margin-top: 0.5rem;
  }
  .btn-group1 {
    display: unset !important;
    flex-wrap: unset !important;
    justify-content: unset !important;
  }
  .btn-group1 .adt-btn {
    width: 30%;
    margin-bottom: 0.25rem;
  }
  .btn-group2 button,
  .btn-group1 button {
    font-size: 12px !important;
    margin-bottom: 0.25rem;
  }
}
@media (max-width: 600px) {
  .btn-group2 .xs-6 {
    width: 50%;
  }
  .btn-group2 .xs-12 {
    width: 100%;
  }
  .btn-group2 .btn-add {
    width: 100%;
    display: block;
  }
}
</style>
