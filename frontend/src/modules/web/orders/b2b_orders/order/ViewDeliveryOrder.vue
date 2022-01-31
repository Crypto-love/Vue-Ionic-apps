<template>
  <q-card style="width: 800px; max-width: 80vw; border-radius: 16px">
    <q-card-section>
      <div class="row items-center q-gutter-x-md">
        <q-img
          src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/treedots.png"
          style="max-width: 72px"
        />
        <div class="text-black text-h4 q-ml-md">DELIVERY ORDER</div>
        <q-spinner color="primary" size="3em" v-if="isLoading" />
        <q-btn size="sm" color="primary" icon="eva-download-outline" no-caps @click="downloadInvoice" v-else>
          <q-tooltip>Download Delivery Order</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-card-section class="row justify-between q-pt-md text-caption">
      <div class="row">
        <div class="column q-mr-md" style="max-width: 220px">
          <div class="text-weight-bold">DELIVER TO :</div>
          <div>{{ data.buyer_name || '-' }}</div>
          <div>Attention: {{ data.attention || '-' }}</div>
          <div>{{ data.delivery_address || '-' }}</div>
          <br />
          <div class="text-weight-bold">Delivery Instruction :</div>
          <div>{{ data.delivery_instruction || '-' }}</div>
          <div class="text-weight-bold">Delivery Date</div>
          <div>{{ data.invoice_date || '-' }}</div>

          <div class="text-weight-bold">Delivery Time</div>
          <div>{{ data.delivery_time || '-' }}</div>
        </div>

        <div class="column q-ml-md" style="max-width: 220px">
          <div class="text-weight-bold">Account Number</div>
          <div>{{ data.account_number || '-' }}</div>

          <div class="text-weight-bold">DO Number</div>
          <div>{{ data.invoice_number || '-' }}</div>

          <div class="text-weight-bold">PO Number</div>
          <div>{{ data.po_number || '-' }}</div>

          <div>201724120K</div>
        </div>
      </div>
      <div class="column" style="max-width: 220px">
        <div class="text-weight-bold">TreeDots Enterprise (Private Limited)</div>
        <div>Attention: Jia Cai Lau</div>
        <div>Bishan Street 12 Block 122, #09-47, 570122, Singapore</div>
      </div>
    </q-card-section>

    <q-card-section>
      <q-table flat :data="data.order_items" :columns="columns" row-key="description">
        <!-- Display Catch Weight -->
        <template v-slot:body-cell-sku="props">
          <q-td :props="props">
            <div class="q-py-xs text-black">
              {{ props.row.sku }}
            </div>
            <div v-if="props.row.catch_weight" class="text-grey text-italic" style="font-size: 12px">
              <span class="text-weight-bold">Weights:</span>
              {{ props.row.catch_weight }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>

    <q-card-section class="row justify-end">
      <div class="column"></div>
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
        { name: 'qty', align: 'center', label: 'Qty', field: 'qty' }
      ]
    };
  },
  computed: {
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
      return `DO_${this.data.delivery_date.replace(/-/g, '')}_G${this.data.group_id}_${
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
        const res = await Api.exec('p_get_invoice_by_id_dashboard', [this.id], 'read');
        if (!res.status) throw new Error(res.message);
        this.data = res.data[0];

        /**
         * We transform po_number data to remove duplicate in string
         * Let's say the raw data is "PO123,PO456,PO123,PO999"
         * We want this data to be like "PO123,PO456,PO999"
         */
        this.data.po_number = [...new Set(this.data.po_number.split(','))].join(', ');

        this.data.invoice_number = this.data.invoice_number.replace('INV', 'DO');

        this.data.order_items = this.data.order_items.filter((v) => v.total_price >= 0);
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async downloadInvoice() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const payload = {
          ...this.data,
          order_items: this.data.order_items.map((v) => ({
            ...v,
            unit_price: v.unit_price.toFixed(2),
            total_price: v.total_price.toFixed(2),
            tax: v.tax.toFixed(2),
            amount_sgd: v.amount_sgd.toFixed(2)
          })),
          term: this.data.cod === 1 ? 'CASH ON DELIVERY' : ''
        };
        const res = await Api.add('pdf_do', {
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
    }
  }
};
</script>
