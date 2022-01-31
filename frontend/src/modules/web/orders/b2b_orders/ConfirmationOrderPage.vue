<template>
  <q-layout view="hHh Lpr fFf" class="bg-smoke">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <div class="container bordered q-pa-md">
          <div class="order_header">
            <div class="logo q-mb-sm">
              <q-img
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/main-logo.png"
                style="height: 32px; width: 172px"
              />
            </div>
            <h4 class="notif-header">Notification Order</h4>
            <div class="row">
              <div class="col-8">
                <div class="row">
                  <div class="col-md-3 col-sm-4 col-xs-12">
                    <span class="label">Order Number</span>
                  </div>
                  <div class="col-md-9 col-sm-8 col-xs-12">
                    <span class="q-mr-xs gt-xs">:</span>
                    <span class="label-value">{{ id_order }}</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-3 col-sm-4 col-xs-12">
                    <span class="label">Customer Name</span>
                  </div>
                  <div class="col-md-9 col-sm-8 col-xs-12">
                    <span class="q-mr-xs gt-xs">:</span>
                    <span class="label-value">{{ row.customer }}</span>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="row">
                  <div class="col-md-4 col-sm-4 col-xs-12">
                    <span class="label">Delivery Date</span>
                  </div>
                  <div class="col-md-8 col-sm-8 col-xs-12">
                    <span class="q-mr-xs gt-xs">:</span>
                    <span class="label-value">{{ delivery_date }}</span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 col-sm-4 col-xs-12">
                    <span class="label">PO Number</span>
                  </div>
                  <div class="col-md-8 col-sm-8 col-xs-12">
                    <span class="q-mr-xs gt-xs">:</span>
                    <span class="label-value">{{ po_number }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h4 class="sub-title">Address Information</h4>
          <div class="q-mb-md">
            <q-table
              :data="data_address"
              :columns="columns_address"
              separator="vertical"
              :rows-per-page-options="[0]"
              :pagination.sync="initialPagination"
              hide-bottom
              class="confirm-table"
            />
          </div>
          <h4 class="sub-title">Products</h4>
          <div class="q-mb-md">
            <q-table
              :data="data_products"
              :columns="columns_products"
              separator="vertical"
              :rows-per-page-options="[0]"
              :pagination.sync="initialPagination"
              hide-bottom
              class="confirm-table"
            />
          </div>
          <div class="row">
            <div class="col-12">
              <!-- SUMMARY -->
              <ul class="leaders">
                <li>
                  <span>Subtotal</span>
                  <span>{{ $helper.displayPrice(subTotal) }}</span>
                </li>

                <li>
                  <span>Delivery Fee</span>
                  <span>{{ $helper.displayPrice(deliveryFee) }}</span>
                </li>

                <li>
                  <span>Tax Amount</span>
                  <span>{{ $helper.displayPrice(tax) }}</span>
                </li>

                <li>
                  <span class="gtotal" color="black">Grand Total</span>
                  <span class="gtotal" color="black">{{ $helper.displayPrice(grandTotal) }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="row">
            <div class="col-12 text-right">
              <q-btn
                color="primary"
                text-color="white"
                glossy
                unelevated
                icon="eva-checkmark-circle-outline"
                label="Confirm"
                class="btn-confirm"
                @click="confirmOrder()"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-dialog v-model="alert_message">
      <q-card class="q-pb-lg" style="width: 330px; border-radius: 15px">
        <q-card-section>
          <div class="text-center">
            <div class="alert-icon">
              <q-icon name="eva-checkmark-circle-outline" color="#71BE34"></q-icon>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="alert-body-title text-center">
            <span>Information</span>
          </div>
          <div class="alert-body-message">Order has been confirmed</div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            unelevated
            label="Close"
            v-close-popup
            style="width: 150px; border-radius: 8px; background: #71be34; color: #ffffff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { Api, Notice } from 'services';

export default {
  data() {
    return {
      row: [],
      delivery_date: null,
      po_number: null,
      id_order: null,
      status_order: null,
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 0 // all data
      },
      columns_address: [
        {
          name: 'address',
          required: true,
          label: 'Address',
          align: 'left',
          field: 'address',
          sortable: true
        },

        {
          name: 'billing_address',
          align: 'center',
          label: 'Address Type',
          field: 'billing_address',
          sortable: true
        }
      ],
      data_address: [
        {
          address: '-',
          billing_address: '-'
        }
      ],
      columns_products: [
        {
          name: 'sku',
          required: true,
          label: 'Product Name',
          align: 'left',
          field: 'sku',
          sortable: true
        },
        {
          name: 'sale_unit_price',
          align: 'center',
          label: 'Price /item',
          field: 'sale_unit_price',
          sortable: true,
          format: (val) => `$ ${val}`
        },
        {
          name: 'total_qty',
          align: 'center',
          label: 'QTY',
          field: 'total_qty',
          sortable: true
        },
        {
          name: 'total_price',
          align: 'center',
          label: 'Price Total',
          field: 'total_price',
          sortable: true,
          format: (val) => `$ ${val}`
        }
      ],
      data_products: [],
      alert_message: false
    };
  },
  computed: {
    subTotal() {
      return Number(this.data_products.map((v) => Number(v.total_price)).reduce((total, v) => total + v, 0));
    },
    deliveryFee() {
      return 0;
    },
    tax() {
      return Number(this.data_products.map((v) => Number(v.tax)).reduce((total, v) => total + v, 0));
    },
    grandTotal() {
      return Number(this.subTotal) + Number(this.deliveryFee) + Number(this.tax);
    }
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      const token = this.$route.query.token;
      const payloadToken = {
        name: 'orders',
        where: `token = "${token}"`
      };

      const ordersGetToken = await Api.add(`ord_`, payloadToken);

      let idOrder = ordersGetToken.data[0].id;
      this.id_order = ordersGetToken.data[0].id;
      this.delivery_date = ordersGetToken.data[0].delivery_date;
      this.po_number = ordersGetToken.data[0].po_number;
      this.status_order = ordersGetToken.data[0].order_status_id;

      const payloadOrders = {
        name: 'v_order_items',
        where: `order_id = ${idOrder}`
      };

      const orders = await Api.add(`ord_`, payloadOrders);
      const result = orders.data;
      const tenant_id = orders.data[0].tenant_id;

      this.row = orders.data[0];
      this.data_products = orders.data;

      let customer_buyer_id = orders.data[0].customer_buyer_id;

      const payloadAddress = {
        name: 'v_customers',
        where: `id = ${customer_buyer_id} and customer_tenant_id = ${tenant_id}`
      };

      const ordersAddress = await Api.add(`ord_`, payloadAddress);
      const resOrdersAddress = ordersAddress.data;

      if (resOrdersAddress.length <= 0) {
        this.data_address.address = '-';
        this.data_address.billing_address = '-';
      } else {
        this.data_address = resOrdersAddress;
      }
    },
    async confirmOrder() {
      try {
        if (this.status_order > 1) {
          this.alert_message = true;
        } else {
          const res = await Api.update(`ord_`, `${this.$route.query.token}`);
          if (!res.status) {
            throw new Error(res.message);
          }

          this.status_order = 100000; // to disable the button
          Notice.ok('Confirmation order success');
        }
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
<style scoped>
.notif-header {
  font-size: 1rem;
  font-weight: 500;
  color: #131313;
  padding: 0;
  margin: 0.5rem 0 0.5rem 0;
  text-transform: uppercase;
}
.bg-smoke {
  background: #f9f9f9cc;
}
.bordered {
  border: 1px dashed #cecece;
  border-radius: 0.25rem;
}
.container {
  margin-top: 3rem;
  margin-bottom: 2rem;
  background: #ffffff;
  box-shadow: 0 0 10px 3px #f0f0f0;
  position: relative;
}
.sub-title {
  padding: 0;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
}
.confirm-table {
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.confirm-table .q-table tbody tr td {
  padding: 0 !important;
  height: auto !important;
}
.confirm-table .q-table tbody td {
  height: auto !important;
}
.confirm-table thead tr th {
  background: #f9f9f9 !important;
}
.q-table th {
  padding: 7px 16px !important;
  background-color: #000000 !important;
}
span.label {
  color: #555555;
}
span.label-value {
  font-weight: 500;
  color: #444444;
}
@media (max-width: 667px) {
  .container {
    margin-top: 0;
    border: none;
  }
  span.label {
    font-size: 12px;
    color: #888888;
  }
  span.label-value {
    font-size: 13px;
    font-weight: 500;
    color: #131313;
  }
  .confirm-table {
    padding-bottom: 0 !important;
  }
}
@media (max-width: 375px) {
  .btn-confirm {
    display: block;
    width: 100%;
  }
}
.alert-icon {
  color: #4fac03;
  font-size: 3.5rem;
}
.alert-body-title {
  margin-bottom: 1rem;
}
.alert-body-title span {
  font-size: 1.25rem;
  font-weight: 500;
  color: #528a27;
  padding: 0 0 0.135rem 0;
  position: relative;
}
.alert-body-title::before {
  position: absolute;
  background: #ddd;
  content: '';
  display: inline;
  width: 50px;
  height: 2px;
  top: 38%;
  left: calc(50% - (50px / 2));
  z-index: 0;
}
.alert-body-message {
  text-align: center;
  font-size: 1rem;
  color: #949494;
}
</style>
