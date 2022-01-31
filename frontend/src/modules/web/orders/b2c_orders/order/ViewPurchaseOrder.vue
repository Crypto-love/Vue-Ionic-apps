<template>
  <q-card style="width: 800px; max-width: 80vw; border-radius: 16px">
    <q-card-section>
      <div class="row items-center q-gutter-x-md">
        <q-img
          src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/treedots.png"
          style="max-width: 72px"
        />
        <div class="text-black text-h4 q-ml-md">Purchase Order</div>
        <q-btn
          size="sm"
          color="primary"
          icon="eva-download-outline"
          no-caps
          @click="downloadFile"
          :disable="isLoading"
        >
          <q-tooltip>Download purchase order</q-tooltip>
        </q-btn>
        <q-btn
          size="sm"
          style="background-color: #25d366; color: white"
          icon="eva-message-circle-outline"
          no-caps
          @click="onSendNotification"
          :disable="isLoading"
        >
          <q-tooltip>Send Po Notification</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <q-card-section v-if="isLoading" class="text-center">
      <q-circular-progress indeterminate size="50px" color="primary" class="q-ma-md" />
    </q-card-section>

    <div v-else>
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
          </div>

          <div class="column q-ml-md" style="max-width: 220px">
            <div class="text-weight-bold">Order Date</div>
            <div>{{ data.po_date || '-' }}</div>

            <div class="text-weight-bold">Account Number</div>
            <div>{{ data.account_number || '-' }}</div>

            <div class="text-weight-bold">Order Number</div>
            <div>{{ data.order_number || '-' }}</div>

            <div class="text-weight-bold">PO Number</div>
            <div>{{ data.po_number || '-' }}</div>

            <div class="text-weight-bold">7% GST</div>
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
        <q-table flat :data="data.order_items" :columns="columns" row-key="description"></q-table>
      </q-card-section>

      <q-card-section class="row justify-end">
        <div class="column q-mr-xl">
          <div class="text-subtitle2 text-weight-bold">Total SGD</div>
          <div class="text-subtitle2 text-weight-bold">Due Date</div>
        </div>
        <div class="column">
          <div class="text-subtitle2 text-weight-regular">{{ grandTotal }}</div>
          <div class="text-subtitle2 text-weight-regular">{{ data.due_date }}</div>
          <div class="text-subtitle2 text-weight-regular">{{ data.cod === 1 ? 'CASH ON DELIVERY' : '' }}</div>
        </div>
      </q-card-section>
    </div>

    <q-card-actions v-if="!isLoading" align="right">
      <q-btn flat label="Close" color="red" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script>
import { Api, Notice, generatePurchaseOrder } from 'services';
import { poNotification } from 'services';

export default {
  props: {
    orderId: {
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
          name: 'description',
          required: true,
          label: 'Description',
          align: 'left',
          field: 'description'
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
          label: 'Amount SGD',
          field: (row) => (row.total_price + row.tax).toFixed(2)
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
    fileName() {
      return this.data.order_number;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        const res = await Api.get('v_order_download_po', `id = ${this.orderId}`);
        if (!res.status) throw new Error(res.message);

        this.data = res.data[0];
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async downloadFile() {
      await generatePurchaseOrder(this.data, this.fileName);
    },
    onSendNotification() {
      this.$q
        .dialog({
          title: 'Confirmation',
          message: "You will send Purchase order to this customer's PIC. Continue ?",
          ok: 'Send',
          cancel: {
            flat: true,
            color: 'negative'
          }
        })
        .onOk(() => this.sendNotification())
        .onCancel(() => {});
    },
    async sendNotification() {
      this.$q.loading.show({ message: 'Please wait...' });
      const res = await poNotification(this.orderId);
      for (let r of res) {
        if (r.status === 'fulfilled') {
          Notice.ok(`Sent to ${r.value.attention}`);
        } else {
          Notice.fail(r.reason || 'Failed sending notification');
        }
      }
      this.$q.loading.hide();
    }
  }
};
</script>
