<template>
  <q-card style="width: 800px; max-width: 80vw; border-radius: 16px">
    <q-card-section>
      <div class="row items-center q-gutter-x-md">
        <q-img
          src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/treedots.png"
          style="max-width: 72px"
        />
        <div class="text-black text-h4 q-ml-md">TAX INVOICE</div>
        <q-spinner color="primary" size="3em" v-if="isLoading" />
        <div v-else>
          <q-btn size="sm" color="primary" icon="eva-download-outline" no-caps @click="downloadInvoice">
            <q-tooltip>Download Invoice</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="row justify-between q-pt-md text-caption">
      <div class="row">
        <div class="column q-mr-md" style="max-width: 220px">
          <div class="text-weight-bold">BILL TO :</div>
          <div>{{ data.buyer_name || '-' }}</div>
          <div>Attention: {{ data.attention || '-' }}</div>
          <div>{{ data.billing_address || '-' }}</div>
          <br />
          <div class="text-weight-bold">DELIVER TO :</div>
          <div>{{ data.buyer_name || '-' }}</div>
          <div>Attention: {{ data.attention || '-' }}</div>
          <div>{{ data.delivery_address || '-' }}</div>
          <br />
          <div class="text-weight-bold">Delivery Instruction :</div>
          <div>{{ data.delivery_instruction || '-' }}</div>
        </div>

        <div class="column q-ml-md wordbreak" style="max-width: 220px">
          <div class="text-weight-bold">Invoice Date</div>
          <div>{{ data.invoice_date || '-' }}</div>

          <div class="text-weight-bold">Delivery Time</div>
          <div>{{ data.delivery_time || '-' }}</div>

          <div class="text-weight-bold">Account Number</div>
          <div>{{ data.account_number || '-' }}</div>

          <div class="text-weight-bold">Order Number</div>
          <div>{{ data.order_number || '-' }}</div>

          <div class="text-weight-bold">Invoice Number</div>
          <div>{{ data.invoice_number || '-' }}</div>

          <div class="text-weight-bold">PO Number</div>
          <div>{{ data.po_number || '-' }}</div>

          <div class="text-weight-bold">{{ data.tenant_tax_rate }}% GST</div>
          <div>{{ data.tenant_tax_registration_number }}</div>
        </div>
      </div>
      <div class="column" style="max-width: 220px">
        <div class="text-weight-bold">
          {{ data.tenant_name || '-' }}
        </div>
        <div>Attention: {{ data.tenant_attention || '-' }}</div>
        <div>{{ data.tenant_address || '-' }}</div>
      </div>
    </q-card-section>

    <q-card-section>
      <q-table flat :data="data.order_items" :columns="columns" row-key="description">
        <template v-slot:header-cell-amount="props">
          <th class="text-center">Amount {{ data.currency_code }}</th>
        </template>
        <!-- Display Catch Weight -->
        <template v-slot:body-cell-sku="props">
          <q-td :props="props">
            <div class="q-py-xs text-black">
              {{ props.row.sku }}
            </div>
            <div v-if="props.row.catch_weight" class="text-red-8" style="font-size: 12px">
              {{ 'Weights :' + props.row.catch_weight }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>

    <q-card-section class="row justify-end">
      <div class="column q-mr-xl">
        <div class="text-subtitle2 text-weight-bold">Total {{ data.currency_code }}</div>
        <div class="text-subtitle2 text-weight-bold">Due Date</div>
      </div>
      <div class="column">
        <div class="text-subtitle2 text-weight-regular">
          {{ data.grand_total }}
        </div>
        <div class="text-subtitle2 text-weight-regular">
          {{ data.due_date }}
        </div>
        <div class="text-subtitle2 text-weight-regular">
          {{ data.cod === 1 ? 'CASH ON DELIVERY' : '' }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Close" color="red" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script>
import saveAS from 'file-saver';
import { Api, generateInvoice, Notice } from 'services';

export default {
  props: {
    id: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      isLoading: false,
      data: {},
      columns: [
        {
          name: 'sku_code',
          required: true,
          label: 'SKU',
          align: 'left',
          field: 'sku_code'
        },
        {
          name: 'sku',
          required: true,
          label: 'Description',
          align: 'left',
          field: 'sku'
        },
        {
          name: 'weight',
          align: 'center',
          label: 'Weight',
          field: (row) => `${row.weight} KG`
        },
        { name: 'qty', align: 'center', label: 'Qty', field: 'qty' },
        {
          name: 'unit_price',
          align: 'center',
          label: 'Unit Price',
          field: (row) => `${row.unit_price.toFixed(2)} / ${row.uom}`
        },
        {
          name: 'total_price',
          align: 'center',
          label: 'Price',
          field: (row) => row.total_price.toFixed(2)
        },
        { name: 'tax', align: 'center', label: 'Tax', field: 'tax' },
        {
          name: 'amount',
          align: 'center',
          label: `Amount`,
          field: (row) => row.amount_sgd.toFixed(2)
        }
      ]
    };
  },
  computed: {
    grandTotal() {
      if (!this.data.order_items) {
        return 0;
      }
      return this.data.order_items
        .map((v) => v.total_price + v.tax)
        .reduce((total, v) => total + v, 0)
        .toFixed(2);
    },
    driverName() {
      if (this.data.driver_name) {
        return this.data.driver_name.replace(/ /g, '_').toUpperCase();
      }
      return '';
    },
    invoiceFileName() {
      if (!this.data.delivery_date) {
        return this.data.invoice_number;
      }
      return `INV_${this.data.delivery_date.replace(/-/g, '')}_G${this.data.group_id}_${
        this.data.invoice_number
      }_${this.driverName}`;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;

        this.data = await this.getInvoiceById(this.id);

        /**
         * We transform po_number data to remove duplicate in string
         * Let's say the raw data is "PO123,PO456,PO123,PO999"
         * We want this data to be like "PO123,PO456,PO999"
         */
        this.data.order_number = [...new Set(this.data.order_number.split(','))].join(', ');
        this.data.po_number = [...new Set(this.data.po_number.split(','))].join(', ');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async getInvoiceById(id) {
      const res = await Api.exec('p_get_invoice_by_id_dashboard', [id], 'read');
      if (!res.status) throw new Error(res.message);
      return res.data[0];
    },
    async downloadInvoice() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const payload = {
          ...this.data,
          is_treedots: this.data.tenant_id === 1,
          order_items: this.data.order_items.map((v) => ({
            ...v,
            unit_price: v.unit_price.toFixed(2),
            total_price: v.total_price.toFixed(2),
            tax: v.tax.toFixed(2),
            amount_sgd: v.amount_sgd.toFixed(2)
          })),
          term: this.data.cod === 1 ? 'CASH ON DELIVERY' : ''
        };
        const res = await Api.add('pdf_invoice', {
          payload,
          output: 'buffer',
          options: {
            margin: {
              top: '20px',
              right: '20px',
              bottom: '20px',
              left: '20px'
            }
          }
        });
        if (!res.status) {
          throw new Error(res.message);
          return;
        }

        const uint = new Uint8Array(res.data[0].data);
        const blob = new Blob([uint], {
          type: 'application/octet-stream'
        });
        saveAs(blob, this.invoiceFileName + '.pdf');
      } catch (error) {
      } finally {
        this.$q.loading.hide();
      }
    },
    getCurrencyName() {
      return this.data.currency_code;
    }
  }
};
</script>

<style scoped>
.wordbreak {
  -ms-word-break: break-all;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
