<template>
  <form-dialog :title="isEditMode ? `Edit ${title}` : `Add New ${title}`" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-body1 text-weight-medium">1) {{ title }} Info</div>
          <div class="row justify-between q-col-gutter-md">
            <div class="col-12">
              <q-input
                outlined
                v-model="formData.name"
                label="Company Name *"
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
                dense
                autogrow
              />
            </div>
            <div class="col-12">
              <q-input
                v-show="!isASupplier"
                outlined
                v-model="formData.alias_name"
                label="Alias Name"
                lazy-rules
                dense
                autogrow
              />
              <q-toggle
                v-show="!isASupplier"
                v-model="isABranch"
                :label="isABranch ? 'Status (Branch)' : 'Status (Parent)'"
                @input="onBranchToggle()"
              />
            </div>
            <div class="col-6">
              <q-input
                outlined
                v-model="formData.account_number"
                label="Account Number"
                class="form-group mb-2"
                lazy-rules
                dense
                hint="Auto Generated"
                autogrow
                readonly
              />
              <q-select
                outlined
                v-model="formData.group_id"
                :options="groups"
                label="Group *"
                class="form-group mb-2"
                lazy-rules
                :rules="[(val) => (isASupplier && !val ? 'Please choose something' : true)]"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                dense
                v-if="isASupplier"
              />
              <q-select
                outlined
                v-model="formData.collection_type_id"
                :options="collectionTypes"
                label="Collection Type *"
                class="form-group mb-2"
                lazy-rules
                :rules="[(val) => (isASupplier && !val ? 'Please choose something' : true)]"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                dense
                v-if="isASupplier"
              />
              <q-input
                outlined
                v-model="formData.delivery_instruction"
                label="Delivery Instruction"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                v-if="!isASupplier"
              />
              <q-input
                outlined
                v-model="formData.delivery_charge"
                label="Delivery Charge"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                type="number"
                :rules="minimumOrderRules"
                v-if="!isASupplier"
              />
              <q-input
                outlined
                v-model="formData.minimum_order"
                label="Minimum Order"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                type="number"
                :rules="minimumOrderRules"
                v-if="!isASupplier"
              />
              <q-select
                v-model="formData.profile"
                label="Profile"
                ref="profile"
                outlined
                dense
                :options="customerProfiles"
                :rules="[(v) => !!v || 'Profile cannot be empty']"
              />
              <q-toggle
                v-show="!isASupplier"
                v-model="formData.hub"
                :label="formData.hub ? 'Hub (Yes)' : 'Hub (No)'"
                :true-value="1"
                :false-value="0"
              />
              <q-toggle
                v-model="formData.halal_products"
                :label="formData.halal_products ? 'Halal (Yes)' : 'Halal (No)'"
                :true-value="1"
                :false-value="0"
              />
              <q-toggle
                v-model="formData.active"
                :label="formData.active ? 'Active (Yes)' : 'Active (No)'"
                :true-value="1"
                :false-value="0"
              />
            </div>
            <div class="col-6">
              <q-select
                v-show="!isASupplier"
                v-model="creditPayment"
                label="Credit Term"
                ref="profile"
                outlined
                dense
                :options="creditPayments"
                :rules="[(v) => !!v || 'Credit payment cannot be empty']"
                class="form-group mb-2"
                @input="setDueDate()"
              />
              <q-input
                v-if="creditPayment.value === 4"
                outlined
                v-model="formData.credit_term"
                label="Days"
                hint="How many days for due date"
                class="form-group mb-2"
                lazy-rules
                dense
                :rules="dueDateRules"
              />
              <q-select
                v-show="!isASupplier"
                v-model="paymentType"
                label="Payment Type"
                ref="profile"
                outlined
                dense
                :options="paymentTypes"
                :rules="[(v) => !!v || 'Payment Type cannot be empty']"
                class="form-group mb-2"
                @input="setPaymentType()"
              />
              <q-toggle
                v-model="formData.cod"
                :label="formData.cod ? 'No Cash No Delivery (Yes)' : 'No Cash No Delivery (No)'"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </div>
          <q-btn
            class="full-width q-mt-md"
            color="primary"
            type="submit"
            form="myForm"
            :loading="submitLoading"
          >
            Save {{ title }} Info
            <template v-slot:loading> <q-spinner-hourglass class="on-left" />Loading... </template>
          </q-btn>
        </div>
        <div class="col-xs-12 col-md-8 q-pl-md-md q-mt-xs-lg q-mt-md-none">
          <div class="text-body1 text-weight-medium">2) Additional Info</div>
          <div class="text-caption">
            In this section, data will be saved automatically as you add / edit it
          </div>
          <div class="q-mt-lg">
            <address-table v-model="addresses" :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
          <div class="q-mt-lg">
            <hour-table :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
          <div class="q-mt-lg">
            <person-table :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
          <div class="q-mt-lg">
            <branch-table
              v-model="branches"
              :cust-id="formData.id"
              :disabled="!isEditMode || isABranch"
              :customer-type="customerType"
            />
          </div>
          <div class="q-mt-lg">
            <image-table :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Close" color="red" @click="$emit('close')" />
    </template>
  </form-dialog>
</template>

<script>
import { Api, Notice, isEmailValid, isNumeric } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AddressTable from './AddressTable.vue';
import HourTable from './HourTable.vue';
import BranchTable from './BranchTable.vue';
import PersonTable from './PersonTable.vue';
import ImageTable from './ImageTable.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';

export default {
  components: {
    FormDialog,
    AddressTable,
    HourTable,
    BranchTable,
    PersonTable,
    ImageTable,
    ImageChooser
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    customerType: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      creditPayment: { label: null, value: -1 },
      paymentType: { label: null, value: -1 },
      paymentMethod: false,
      submitLoading: false,
      addresses: [],
      branches: [],
      persons: [],
      selectedCustType: null,
      isABranch: false,
      previousNCND: false,
      formData: {
        id: null,
        account_number: null,
        name: null,
        alias_name: null,
        group_id: null,
        customer_type_id: null,
        collection_type_id: null,
        delivery_instruction: null,
        delivery_charge: 0,
        minimum_order: 0,
        hub: 0,
        profile: null,
        halal_products: 0,
        cod: 0,
        credit_term: null,
        payment_type: null,
        xero_id: null,
        active: 1
      },
      accountNumberRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ],
      dueDateRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character',
        (v) => Number(v) > 0 || 'Should be more than 0',
        (v) => Number(v) != 30 || 'use " 30 Days option"',
        (v) => Number(v) <= 60 || 'Should be less than 60'
      ],
      minimumOrderRules: [
        (v) => isNumeric(v) || 'Please use numeric character',
        (v) => Number(v) >= 0 || 'Should be more or equal to 0',
        (v) => Number(v) <= 90000 || 'Should be less than 90.000'
      ],
      groups: [],
      customerTypes: [],
      collectionTypes: [],
      customerProfiles: this.$helper.getCustomerProfiles(),
      creditPayments: this.$helper.getCreditPayments(),
      paymentTypes: this.$helper.getPaymentTypes()
    };
  },
  computed: {
    isEditMode() {
      return this.id !== null || this.formData.id !== null;
    },
    isASupplier() {
      return this.customerType === 1;
    },
    title() {
      switch (this.customerType) {
        case 1:
          return 'Supplier';
        case 2:
          return 'Customer';
        default:
          return 'Customer';
      }
    }
  },
  watch: {
    'formData.customer_type_id'(v) {
      if (v === 2) {
        this.formData.collection_type_id = 0;
      }
    },
    'formData.name': function (val) {
      this.formData.name = val ? val.removeSpecialCharacter() : '';
    },
    'formData.delivery_instruction': function (val) {
      this.formData.delivery_instruction = val ? val.removeSpecialCharacter() : '';
    }
  },
  async mounted() {
    this.formData.customer_type_id = this.customerType;
    if (this.isEditMode) {
      this.getCustomerDetail();
      this.isThisCustomerABranch();
    } else if (!this.isABranch) {
      /* generate new account number if new parent customer created */
      this.formData.account_number = await this.generateAccountNumber();
    }
    this.getGroup();
    this.getCustomerType();
    this.getCollectionType();
  },
  methods: {
    async isThisCustomerABranch() {
      try {
        const res = await Api.get('branches', `customer_branch_id = ${this.id}`);
        if (res.data.length > 0) {
          this.isABranch = true;
          const parent = await Api.get('customers', `id=${res.data[0].customer_id}`);
          if (parent.status && parent.data.length > 0) {
            this.formData.account_number = parent.data[0].account_number;
            this.formData.xero_id = parent.data[0].xero_id;
          }
        }
      } catch (error) {}
    },
    async getCustomerDetail() {
      try {
        const res = await Api.get('v_customer_branch_details', `id = ${this.id}`);
        if (!res.status) {
          throw res.message;
        }

        /**
         * We separate keys that is not needed by the formdata
         * If we don't there will be error when updating data
         */
        const { groups, customer_type, addresses, persons, branches, ...data } = res.data[0];

        this.formData = { ...data };

        /** We use comparison to prevent null error on AddressTable, PersonTable, and Branch Error */
        this.addresses = addresses || [];
        this.persons = persons || [];
        this.branches = branches || [];

        this.previousNCND = data.cod;

        this.getDueDate(this.formData.credit_term);
        this.getPaymentType(this.formData.payment_type);
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getGroup() {
      try {
        const { data } = await Api.get('groups');
        this.groups = [...data];
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getCustomerType() {
      try {
        const res = await Api.get('customer_types');
        this.customerTypes = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getCollectionType() {
      const { data } = await Api.get('collection_types');
      this.collectionTypes = [...data];
    },
    onAddCustType(id) {
      /** We set this state to ease us getting the selected customer type name */
      this.selectedCustType = this.customerTypes.find((v) => v.id === id);
    },
    showConfirmMessage(title, message) {
      return new Promise((resolve) => {
        this.$q
          .dialog({
            component: ConfirmMessage,
            title,
            message
          })
          .onOk(() => resolve(true))
          .onCancel(() => resolve(false));
      });
    },
    async onSubmit() {
      this.submitLoading = true;
      if (this.isEditMode) {
        await this.edit();
        this.$emit('edit-complete', this.formData.id);
      } else {
        const { data } = await this.add();
        const newData = data[0];
        this.formData.id = newData.id; // Set isEditMode flag to true

        this.$emit('add-complete', newData.id);
      }
      this.submitLoading = false;
    },
    async add() {
      const { id, ...payload } = this.formData;

      /** only parent will have new account_number on creating new customer*/
      if (!this.isABranch && !this.isASupplier) {
        /** only customer_type_id = 2 (buyer) need to save to xero */
        const xeroPayload = {
          AccountNumber: payload.account_number,
          ContactStatus: 'ACTIVE',
          Name: payload.name,
          IsCustomer: true,
          PaymentTerms: {
            Sales: {
              Day: payload.credit_term,
              Type: payload.credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
            }
          }
        };
        /** adding customer to xero as new contact */
        const xeroRes = await Api.add('x_contacts', xeroPayload);
        if (xeroRes.status) {
          let xeroContact = xeroRes.data[0];
          payload.xero_id = xeroContact.ContactID;
          Notice.ok('New Xero contact added');
        } else {
          Notice.fail(xeroRes.message);
        }
      }

      /* return if create xero contact fail  */
      if (!this.isABranch && !this.isASupplier && !payload.xero_id) {
        Notice.fail('Xero ID Required');
        return;
      }

      if (!payload.minimum_order) payload.minimum_order = 0;
      if (!payload.delivery_charge) payload.delivery_charge = 0;

      const res = await Api.add('customers', payload);
      if (res.status) {
        await Api.add('customer_tenants', {
          customer_id: res.data[0].id,
          tenant_id: this.$store.state.tenant_id
        });

        Notice.ok('New Customers added');
      } else {
        Notice.fail(res.message);
      }
      return res;
    },
    async edit() {
      /** Show prompt to update branch ncnd or not. */
      if (!this.isABranch && this.previousNCND !== this.formData.cod && this.branches.length > 0) {
        const isUpdateBranch = await this.showConfirmMessage(
          'Confirmation',
          "Do you want to update branch's NCND ?"
        );
        if (isUpdateBranch) {
          /** No need to await this function since we don't need any return value. */
          this.updateBranchNCND();
        }

        this.previousNCND = this.formData.cod;
      }

      /** only parent and have xero_id can update to xero*/
      if (!this.isABranch && this.formData.xero_id && !this.isASupplier) {
        const xeroPayload = {
          Name: this.formData.name,
          PaymentTerms: {
            Sales: {
              Day: this.formData.credit_term,
              Type: this.formData.credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
            }
          }
        };
        /** update customers to xero as existing contact */
        const xeroRes = await Api.update('x_contacts/', xeroPayload, this.formData.xero_id);
        if (xeroRes.status) {
          Notice.ok('Xero contact updated');
        } else {
          Notice.fail(xeroRes.message);
        }
      }

      /** update customers */
      const payload = { ...this.formData };
      if (!payload.minimum_order) payload.minimum_order = 0;
      if (!payload.delivery_charge) payload.delivery_charge = 0;

      const res = await Api.update('customers', payload, payload.id);
      return res;
    },
    /** Because we don't need any result from this function. So it's better not to await this. */
    updateBranchNCND() {
      const promiseArr = this.branches.map((v) => {
        return Api.update('customers', { cod: this.formData.cod }, v.customer_id);
      });

      return Promise.all(promiseArr).then((results) => {
        const err = results.findIndex((v) => !v.value.status);
        if (err > -1) {
          return Notice.fail("Error when updating branch's NCND");
        }
        return Notice.ok("Successfully updated branch's NCND");
      });
    },
    setPaymentType() {
      this.formData.payment_type = this.paymentType.value;
    },
    setDueDate() {
      switch (this.creditPayment.value) {
        case 0:
          this.formData.credit_term = 0;
          break;
        case 1:
          this.formData.credit_term = 7;
          break;
        case 2:
          this.formData.credit_term = 15;
          break;
        case 3:
          this.formData.credit_term = 30;
          break;
        default:
          this.formData.credit_term = 0;
          break;
      }
    },
    getDueDate(v) {
      /** get credit term value */

      switch (v) {
        case 0:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 0)[0];
          break;
        case 7:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 1)[0];
          break;
        case 15:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 2)[0];
          break;
        case 30:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 3)[0];
          break;
        default:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 4)[0];
          break;
      }
    },
    getPaymentType(v) {
      this.paymentType = this.paymentTypes.filter((item) => item.value === v)[0];
    },
    async onBranchToggle() {
      let old_account = this.formData.account_number;
      this.formData.account_number =
        !this.isEditMode && !this.isABranch
          ? await this.generateAccountNumber()
          : this.isEditMode
          ? old_account
          : undefined;
    },
    async generateAccountNumber() {
      if (!this.formData.customer_type_id) return undefined;
      const res = await Api.exec('p_account_number', [this.formData.customer_type_id], 'read');
      return res.status && res.data.length > 0 ? res.data[0].account_number : undefined;
    }
  }
};
</script>
<style scoped>
.form-group {
  margin-bottom: 0.5rem;
}
.mb-2 {
  margin-bottom: 1rem !important;
}
</style>
