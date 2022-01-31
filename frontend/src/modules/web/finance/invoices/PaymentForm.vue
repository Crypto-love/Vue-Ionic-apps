<template>
  <form-card
    title="Add Payment"
    class="invoice-form"
    style="height: 350px; width: 500px; min-width: unset; overflow: hidden"
  >
    <q-form ref="paymentForm">
      <div class="row justify-between q-col-gutter-md">
        <div class="col-12">
          <q-select
            v-model="selectedPaymentType"
            outlined
            dense
            label="Account Type"
            :options="filteredOptions"
            @filter="filterFn"
            map-options
            option-label="label"
            option-value="id"
            @input="onSelectPaymentType"
            :rules="[(val) => !!val || 'Please choose one']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 q-mt-md">
          <q-input
            outlined
            v-model.number="formData.amount"
            type="number"
            label="Amount *"
            inputmode="decimal"
            :rules="[
              (val) => !!val || 'Please type something',
              (val) => Number(val) <= Number(amountLeft) || 'Excess amount',
              (val) => Number(val) > 0 || 'Invalid amount'
            ]"
            dense
            :hint="`Amount left: $${amountLeft.toFixed(2)}`"
          />
        </div>

        <div class="col-12 q-mt-md">
          <q-input
            outlined
            v-model="formData.reference_number"
            label="Reference Number"
            :disable="!selectedPaymentType || selectedPaymentType == 1"
            :rules="
              !selectedPaymentType || selectedPaymentType == 1
                ? []
                : [(val) => !!val || 'Please type something']
            "
            dense
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template>
        <q-btn ref="btnCancel" flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn :disable="options.length == 0" flat label="Save" class="btn-save" @click="onSubmit" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';

export default {
  components: {
    FormCard
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      credential: this.$store.state,
      pagination: {
        rowsPerPage: 10
      },
      formData: {
        invoice_id: null,
        amount: null,
        xero_account_id: null,
        xero_account_name: null,
        reference_number: null,
        user_id: this.$store.state.id,
        user_name: this.$store.state.username,
        log_description: null
      },
      selectedPaymentType: null,
      options: this.$helper.getInvoicePaymentTypes(), // We need to set this dynamically in the future. Because different tenants would have different account settings
      filteredOptions: []
    };
  },

  props: {
    invoiceId: {
      required: true
    },
    amount: {
      required: true
    },
    paidAmount: {
      required: true
    }
  },

  computed: {
    amountLeft: function () {
      return Number(this.amount) > Number(this.paidAmount)
        ? Number(this.amount) - Number(this.paidAmount)
        : 0;
    }
  },

  created() {
    this.formData.invoice_id = this.invoiceId;

    this.filteredOptions = this.options;
  },

  methods: {
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.filteredOptions = this.options.filter((v) => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },

    onSelectPaymentType(value) {
      this.selectedPaymentType = value.id;

      this.formData.xero_account_id = value.xero_account_id;
      this.formData.xero_account_name = value.label;
      this.formData.reference_number = null;

      this.$refs.paymentForm.resetValidation();
    },

    onSubmit() {
      this.$refs.paymentForm.validate().then((success) => {
        if (success) this.savePayment();
      });
    },

    setLogDescription() {
      const amount = Number(this.formData.amount).toFixed(2);
      const accountName = this.formData.xero_account_name;
      const referenceNumber = this.formData.reference_number;
      const fullName = `${this.credential.first_name} ${this.credential.last_name}`;

      if (this.selectedPaymentType == 1)
        this.formData.log_description = `S$${amount} is paid via ${accountName}. Recorded by ${fullName}`;
      else if (this.selectedPaymentType == 2)
        this.formData.log_description = `S$${amount} is paid via ${accountName} with Reference number ${referenceNumber}. Recorded by ${fullName}`;
      else if (this.selectedPaymentType == 3)
        this.formData.log_description = `S$${amount} is paid via ${accountName} with Cheque number ${referenceNumber}. Recorded by ${fullName}`;
      else this.formData.log_description = null;
    },

    async savePayment() {
      this.$q.loading.show({
        message: 'Please wait..'
      });

      try {
        this.setLogDescription();

        const payload = { ...this.formData };
        if (!payload.log_description) delete payload.log_description;
        if (!payload.reference_number) delete payload.reference_number;

        // Add Payment
        const payment = await this.$api.exec('p_add_invoice_payment', [
          JSON.stringify(payload).replace(/'/g, '`')
        ]);

        if (!payment.status) throw payment.message;

        this.$notice.ok('Payment has been added!');

        this.$emit('saved');
      } catch (error) {
        this.$notice.fail(error);
      } finally {
        this.$q.loading.hide();
      }
    }
  }
};
</script>
