<template>
  <div>
    <q-table
      class="no-shadow"
      :data="data"
      :columns="columns"
      :rows-per-page-options="[0]"
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-trash-2-outline"
            class="cursor-pointer"
            size="sm"
            color="negative"
            @click="promptDeletePayment(props.row)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-icon>
        </q-td>
      </template>

      <template v-slot:bottom>
        <div class="column q-mt-sm">
          <div class="text-black">Paid Amount:</div>
          <div class="text-weight-medium text-body1">
            ${{ paidAmount.toFixed(2) }} / ${{ invoice.amount }}
          </div>
        </div>
      </template>

      <template v-if="invoice.amount > paidAmount" v-slot:top-right>
        <div>
          <q-btn no-caps size="11px" color="primary" @click="showForm = true" :disable="disabled"
            >Add Payment</q-btn
          >
        </div>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <my-form
        :invoiceId="invoice.id"
        :amount="invoice.amount"
        :paidAmount="paidAmount"
        @saved="
          () => {
            $emit('update');
            getPayment();
          }
        "
      />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './PaymentForm';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';

export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    invoice: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showForm: false,
      paidAmount: 0,
      pagination: {
        page: 1,
        rowsPerPage: 0 // 0 means all rows
      },
      columns: [
        {
          name: 'invoice_number',
          align: 'left',
          label: 'Invoice Number',
          field: 'invoice_number',
          sortable: true
        },
        {
          name: 'amount',
          align: 'left',
          label: 'Amount',
          field: 'amount',
          sortable: true,
          format: (val) => `$ ${val}`
        },
        {
          name: 'account',
          align: 'left',
          label: 'Account',
          field: 'account',
          sortable: true
        },
        {
          name: 'created_at',
          align: 'left',
          label: 'Created At',
          field: 'created_at',
          format: (val) => this.$helper.formatDateTime(val),
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ],
      data: []
    };
  },
  computed: {},

  created() {
    this.getPayment();
  },

  methods: {
    async getPayment() {
      this.showForm = false;

      this.isLoading = true;

      const { status, message, data } = await this.$api.get(
        'v_invoice_payment',
        `invoice_id = ${this.invoice.id}`
      );

      if (status) {
        this.data = data;
        this.paidAmount = 0;

        data.forEach((val) => (this.paidAmount += Number(val.amount)));
      } else {
        this.$notice.fail('message');
      }

      this.isLoading = false;
    },

    promptDeletePayment(payment) {
      this.$q
        .dialog({
          component: ConfirmMessage,
          title: 'Delete Payment ?',
          message: 'This action cannot be undone!'
        })
        .onOk(() => this.deletePayment(payment));
    },

    async deletePayment(payment) {
      this.$q.loading.show({
        message: 'Please wait..'
      });

      try {
        const payload = {
          id: payment.id,
          user_id: this.$store.state.id,
          user_name: this.$store.state.username,
          log_description: `Payment of S$${payment.amount} made via ${payment.account} deleted. Deleted by ${this.$store.state.first_name} ${this.$store.state.last_name}`
        };

        const { status, message, data } = await this.$api.exec('p_delete_invoice_payment', [
          JSON.stringify(payload).replace(/'/g, '`')
        ]);

        if (!status) throw message;

        this.$notice.ok('Payment has been deleted!');

        this.$emit('update');
        this.getPayment();
      } catch (error) {
        this.$notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    }
  }
};
</script>
