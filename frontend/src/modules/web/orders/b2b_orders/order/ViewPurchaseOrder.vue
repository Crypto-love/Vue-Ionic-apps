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
          @click="
            onSendNotification(
              'You will send Purchase order to this customer\'s PIC. Continue ?',
              sendPoNotification
            )
          "
          :disable="isLoading"
        >
          <q-tooltip>Send Po Notification</q-tooltip>
        </q-btn>
        <q-btn
          size="sm"
          style="background-color: #25d366; color: white"
          icon="eva-paper-plane-outline"
          no-caps
          :disable="isLoading"
        >
          <q-tooltip>Send Tenant Notification</q-tooltip>

          <q-menu auto-close>
            <q-list>
              <q-item dense clickable @click="onSendEmailNotification">
                <q-item-section side>
                  <q-icon color="red" name="eva-email-outline" dense size="xs" />
                </q-item-section>

                <q-item-section>Email</q-item-section>
              </q-item>
              <q-item dense clickable @click="onSendWhatsappNotification">
                <q-item-section side>
                  <q-icon color="teal" name="eva-message-circle-outline" dense size="xs" />
                </q-item-section>
                <q-item-section>WhatsApp</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
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

            <div class="text-weight-bold">{{ data.tenant_tax_rate }}% GST</div>
            <div>{{ data.tenant_tax_registration_number }}</div>
          </div>
        </div>
        <div class="column" style="max-width: 220px">
          <div class="text-weight-bold">{{ data.tenant_name || '-' }}</div>
          <div>Attention: {{ data.tenant_attention || '-' }}</div>
          <div>{{ data.tenant_address || '-' }}</div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table flat :data="data.order_items" :columns="columns" row-key="description">
          <template>
            <th class="text-center">Amount {{ data.currency_code }}</th>
          </template>
          <template v-slot:body-cell-description="props">
            <q-td :props="props">
              <div class="q-py-xs text-black">
                {{ props.row.description }}
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
            {{ $helper.displayPrice(grandTotal) }}
          </div>
          <div class="text-subtitle2 text-weight-regular">
            {{ data.due_date }}
          </div>
          <div class="text-subtitle2 text-weight-regular">
            {{ data.cod === 1 ? 'CASH ON DELIVERY' : '' }}
          </div>
        </div>
      </q-card-section>
    </div>

    <q-card-actions v-if="!isLoading" align="right">
      <q-btn flat label="Close" color="red" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script>
import saveAS from 'file-saver';
import { Api, Notice, generatePurchaseOrder } from 'services';
import { poNotification, tenantNotification } from 'services';

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
          field: (row) => `${this.$helper.displayPrice(row.unit_price)} / ${row.uom}`
        },
        {
          name: 'total_price',
          align: 'center',
          label: 'Price',
          field: (row) => this.$helper.displayPrice(row.total_price)
        },
        {
          name: 'tax',
          align: 'center',
          label: 'Tax',
          field: 'tax',
          field: (row) => this.$helper.displayPrice(row.tax)
        },
        {
          name: 'amount',
          align: 'center',
          label: 'Amount',
          field: (row) => this.$helper.displayPrice(row.amount_sgd)
        }
      ]
    };
  },
  computed: {
    grandTotal() {
      if (!this.data.order_items) {
        return 0;
      }
      return this.data.order_items.map((v) => v.total_price + v.tax).reduce((total, v) => total + v, 0);
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
        const res = await Api.exec('p_order_download_po', [this.orderId], 'read');
        if (!res.status) throw new Error(res.message);

        this.data = res.data[0];
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async downloadFile() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });

        const payload = {
          ...this.data,
          grand_total: this.$helper.displayPrice(this.data.grand_total),
          term: this.data.cod === 1 ? 'CASH ON DELIVERY' : '',
          is_treedots: this.data.tenant_id === 1
        };

        payload.order_items.forEach((item) => {
          item.amount_sgd = this.$helper.displayPrice(item.amount_sgd);
          item.unit_price = `${this.$helper.displayPrice(item.unit_price)} / ${item.uom}`;
          item.tax = this.$helper.displayPrice(item.tax);
          item.total_price = this.$helper.displayPrice(item.total_price);
        });

        const res = await Api.add('pdf_purchase_order', {
          payload: payload,
          options: {
            margin: {
              top: '20px',
              bottom: '20px'
            }
          },
          output: 'buffer'
        });
        if (!res.status) {
          throw new Error(res.message);
          return;
        }
        const uint = new Uint8Array(res.data[0].data);
        const blob = new Blob([uint], {
          type: 'application/octet-stream'
        });
        saveAs(blob, this.fileName + '.pdf');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    onSendNotification(message, onOk = null) {
      this.$q
        .dialog({
          title: 'Confirmation',
          message: message,
          ok: 'Send',
          html: true,
          cancel: {
            flat: true,
            color: 'negative'
          }
        })
        .onOk(onOk)
        .onCancel(() => {});
    },

    async sendPoNotification() {
      try {
        this.$q.loading.show({ message: 'Please wait...' });

        const res = await poNotification(this.orderId);
        // for (let r of res) {
        //   if (r.status === "fulfilled") {
        //     Notice.ok(`Sent to ${r.value.attention}`);
        //   } else {
        //     Notice.fail(r.reason || "Failed sending notification");
        //   }
        // }
        if (res) Notice.ok('Message has been sent');
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    async onSendEmailNotification() {
      this.$q.loading.show({ message: 'Please wait...' });

      const { status, message, data } = await this.$api.get(
        'v_tenants',
        `tenant_id = ${this.data.tenant_id}`
      );

      this.$q.loading.hide();

      if (status && data && data.length > 0) {
        const email = data[0].email;
        if (email)
          this.onSendNotification(`Send confirmation order to <strong>${email}</strong> ?`, () =>
            this.sendEmailNotification(email)
          );
        else Notice.fail('Email cannot be empty');
      } else {
        Notice.fail(message);
      }
    },

    async onSendWhatsappNotification() {
      this.$q.loading.show({ message: 'Please wait...' });

      const { status, message, data } = await this.$api.get(
        'v_tenants',
        `tenant_id = ${this.data.tenant_id}`
      );

      this.$q.loading.hide();

      if (status && data && data.length > 0) {
        const mobile = data[0].mobile;
        if (mobile)
          this.onSendNotification(`Send confirmation order to <strong>${mobile}</strong> ?`, () =>
            this.sendWhatsappNotification(mobile)
          );
        else Notice.fail('Mobile phone cannot be empty');
      } else {
        Notice.fail(message);
      }
    },

    async sendEmailNotification(email) {
      const emailPayload = {
        email: email,
        orderNumber: this.orderId,
        customer: this.data.buyer_name,
        token: this.data.token
      };

      tenantNotification.sendEmailOrder(emailPayload);

      Notice.ok('Email has been sent');
    },

    async sendWhatsappNotification(mobile) {
      const messagePayload = {
        phone: mobile,
        orderNumber: this.orderId,
        customer: this.data.buyer_name,
        token: this.data.token
      };

      tenantNotification.sendWhatsAppOrder(messagePayload);
    }
  }
};
</script>
