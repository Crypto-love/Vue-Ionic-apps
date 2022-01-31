<template>
  <form-dialog :title="isEditMode ? `Edit ${title}` : `Add New ${title}`" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-body1 text-weight-medium">
            1) {{ this.customerType == 1 ? 'Location name' : title + ' Info' }}
          </div>
          <div class="row justify-between q-col-gutter-md">
            <div class="col-12">
              <q-input
                outlined
                v-model="formData.name"
                :label="this.customerType == 1 ? 'Warehouse / Supplier Name *' : title"
                lazy-rules
                :rules="[
                  (val) => !!val || 'Please type something',
                  (val) => !existingCustomerName.includes(val.toLowerCase()) || 'Name already exist'
                ]"
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
              <div v-if="this.customerType != 1">
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
              </div>
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
                v-if="this.customerType != 1"
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
                v-if="this.customerType != 1"
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
                v-if="!isASupplier"
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
                v-if="!isASupplier"
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
                v-if="this.customerType != 1"
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
            {{ this.customerType == 1 ? 'Save Info' : 'Save ' + title + ' Info' }}
            <template v-slot:loading> <q-spinner-hourglass class="on-left" />Loading... </template>
          </q-btn>
        </div>
        <div class="col-xs-12 col-md-8 q-pl-md-md q-mt-xs-lg q-mt-md-none">
          <div class="text-body1 text-weight-medium">2) Additional Info</div>
          <div class="text-caption">
            In this section, data will be saved automatically as you add / edit it
          </div>
          <div class="q-mt-lg">
            <address-table :cust-id="formData.id" :disabled="!isEditMode" />
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
          <div class="q-mt-lg">
            <tenants-table :v-model="tenants" :cust-id="formData.id" :disabled="!isEditMode" />
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
import { env } from 'src/config';
import { Api, Notice, isEmailValid, isNumeric, Voucher } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AddressTable from './AddressTable.vue';
import HourTable from './HourTable.vue';
import BranchTable from './BranchTable.vue';
import PersonTable from './PersonTable.vue';
import TenantsTable from './TenantsTable';
import ImageTable from './ImageTable.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import { xeroHelper } from 'services';

export default {
  components: {
    FormDialog,
    AddressTable,
    HourTable,
    BranchTable,
    PersonTable,
    ImageTable,
    ImageChooser,
    TenantsTable
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    customerType: {
      type: Number,
      required: true
    },
    customers: {
      type: Array,
      default: () => []
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
      tenants: [],
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
        voucherify_id: null,
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
      paymentTypes: this.$helper.getPaymentTypes(),
      xeroTenantId: this.$store.state.xero_tenant_id,
      existingCustomerName: []
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
          return 'Stock Location';
        case 2:
          return 'Customer';
        default:
          return 'Customer';
      }
    },
    isThirdPartyAllowed() {
      return ['production', 'staging', 'testing'].includes(env);
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
      // this.formData.account_number = await this.generateAccountNumber();
    }
    this.getGroup();
    this.getCustomerType();
    this.getCollectionType();

    this.customers.forEach((v) => {
      if (this.isEditMode && v.id != this.id && v.name != null)
        this.existingCustomerName.push(v.name.toLowerCase());
      else if (!this.isEditMode && v.name != null) this.existingCustomerName.push(v.name.toLowerCase());
    });
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
        const res = await Api.get(
          'v_customer_branch_details',
          `id = ${this.id} AND tenant_id = ${this.$store.state.tenant_id}`
        );
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
        this.addresses = addresses.length > 0 ? addresses.filter((x) => x.address_type_id != 3) : [];
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
      try {
        this.$q.loading.show({ message: 'Please wait...' });
        this.submitLoading = true;

        if (this.isEditMode) {
          await this.edit();
          this.$emit('edit-complete', this.formData.id);
          Notice.ok('Customer updated successfully');
        } else {
          const { data } = await this.add();
          if (data && data.length > 0) {
            const newData = data[0];
            this.formData.id = newData.id; // Set isEditMode flag to true

            this.$emit('add-complete', newData.id);
            Notice.ok('Customer created successfully');
          }
        }
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.submitLoading = false;
        this.$q.loading.hide();
      }
    },

    async createXeroContact() {
      /** Check if account_number already exists on xero */
      const isExist = await xeroHelper.checkIfAccNoAlreadyExistOnXero(this.formData.account_number);

      /** Replace current generated account_number with the latest one from xero */
      if (isExist) {
        const latestAccNo = await xeroHelper.getLatestAccountNumberOnXero();
        this.formData.account_number = 'B' + (latestAccNo + 1);
      }

      /** only customer_type_id = 2 (buyer) need to save to xero */
      const xeroPayload = {
        contacts: [
          {
            accountNumber: this.formData.account_number,
            contactStatus: 'ACTIVE',
            name: this.formData.name,
            isCustomer: true,
            paymentTerms: {
              sales: {
                day: this.formData.credit_term,
                type: this.formData.credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
              }
            }
          }
        ]
      };

      this.$q.loading.show({ message: 'Uploading xero contact...' });
      const xeroRes = await Api.xero('createContacts', [xeroPayload]);
      if (!xeroRes.status) {
        // If xero upload is failing, then throw error, killing the current process.
        throw new Error(xeroRes.message);
      }

      let xeroContact = xeroRes.data[0].contacts[0];
      return xeroContact.contactID;
    },

    async updateXeroContact() {
      /** If current tenant already connected to xero, then upload this customer data to xero */
      this.$q.loading.show({ message: 'Updating xero contact...' });

      const xeroPayload = {
        contacts: [
          {
            contactID: this.formData.xero_id,
            name: this.formData.name,
            paymentTerms: {
              sales: {
                day: this.formData.credit_term,
                type: this.formData.credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
              }
            }
          }
        ]
      };
      /** update customers to xero as existing contact */
      const xeroRes = await Api.xero('updateContact', [this.formData.xero_id, xeroPayload]);

      if (!xeroRes.status) {
        throw new Error(xeroRes.message);
      }

      return true;
    },

    async uploadVoucherifyContact() {
      /** Voucherify Payload */
      const voucherifyPayload = {
        name: this.formData.name,
        metadata: {
          last_name: this.formData.alias_name,
          company_name: this.formData.name,
          company_code: this.formData.account_number,
          credit_card: 'FALSE',
          buyer_type: 'B2B'
        }
      };

      /** adding customer to voucherify */
      this.$q.loading.show({ message: 'Uploading voucherify customer...' });
      const voucherifyRes = await Voucher.addCustomer(voucherifyPayload);
      if (!voucherifyRes.status) {
        /** We're not throwing any error for now */
        // throw new Error(voucherifyRes.message);

        return null;
        Notice.fail(voucherifyRes.message);
      }

      let voucherifyData = voucherifyRes.data[0];
      return voucherifyData.id;
    },

    async add() {
      /** only parent will have new account_number on creating new customer*/
      this.formData.account_number = !this.isABranch ? await this.generateAccountNumber() : undefined;

      /** If current tenant already connected to xero, then upload this customer data to xero */
      if (this.isThirdPartyAllowed && !this.isABranch && !this.isASupplier) {
        /** If this tenant already connected to xero, then upload the contact */
        if (this.xeroTenantId) {
          this.formData.xero_id = await this.createXeroContact();
          Notice.ok('Xero contact created');
        }

        this.formData.voucherify_id = await this.uploadVoucherifyContact();
      }

      const customerPayload = {
        name: this.formData.name,
        customer_type_id: this.formData.customer_type_id,
        account_number: this.formData.account_number,
        profile: this.formData.profile,
        hub: this.formData.hub,
        halal_products: this.formData.halal_products,
        active: this.formData.active,
        group_id: this.formData.group_id
      };

      this.$q.loading.show({ message: 'Saving Data...' });

      const res = await Api.add('customers', customerPayload);
      if (!res.status) throw new Error(res.message);

      const formDataToSend = {
        customer_id: res.data[0].id,
        tenant_id: this.$store.state.tenant_id,
        alias_name: this.formData.alias_name,
        cod: this.formData.cod,
        credit_term: this.formData.credit_term,
        payment_type: this.formData.payment_type,
        delivery_instruction: this.formData.delivery_instruction,
        delivery_charge: this.formData.delivery_charge || 0,
        minimum_order: this.formData.minimum_order || 0,
        xero_customer_id: this.formData.xero_id
      };
      const ctRes = await Api.add('customer_tenants', formDataToSend);

      if (!ctRes.status) throw new Error(ctRes.message);

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

      /** If current tenant already connected to xero, then upload this customer data to xero */
      if (this.isThirdPartyAllowed && !this.isABranch && !this.isASupplier && this.xeroTenantId) {
        if (this.formData.xero_id) {
          await this.updateXeroContact();
          Notice.ok('Xero contact updated');
        } else {
          this.formData.xero_id = await this.createXeroContact();
          Notice.ok('Xero contact created');
        }
      }

      this.$q.loading.show({ message: 'Updating data...' });

      /** update customers */
      const customerPayload = {
        id: this.formData.id,
        name: this.formData.name,
        customer_type_id: this.formData.customer_type_id,
        account_number: this.formData.account_number,
        profile: this.formData.profile,
        hub: this.formData.hub,
        halal_products: this.formData.halal_products,
        active: this.formData.active,
        group_id: this.formData.group_id
      };

      const res = await Api.update('customers', customerPayload, customerPayload.id);
      if (!res.status) throw new Error(res.message);

      const customerIdInCustomerTenants = await Api.get(
        'customer_tenants',
        `customer_id = ${customerPayload.id} and tenant_id = ${this.$store.state.tenant_id}`,
        'id'
      );

      const formDataToSend = {
        customer_id: res.data[0].id,
        xero_customer_id: this.formData.xero_id,
        tenant_id: this.$store.state.tenant_id,
        alias_name: this.formData.alias_name,
        cod: this.formData.cod,
        credit_term: this.formData.credit_term,
        payment_type: this.formData.payment_type,
        delivery_instruction: this.formData.delivery_instruction,
        delivery_charge: this.formData.delivery_charge || 0,
        minimum_order: this.formData.minimum_order || 0
      };
      const ctRes = await Api.update(
        'customer_tenants',
        formDataToSend,
        customerIdInCustomerTenants.data[0].id
      );

      // update branches
      const branches = await Api.get('branches', `customer_id = ${customerPayload.id}`);
      const resBranches = branches.data;

      if (branches.data.length > 0) {
        const restUpdateBranches = await Api.exec('p_update_customer_tenants', [
          customerPayload.id,
          this.formData.credit_term,
          this.formData.payment_type
        ]);
      }

      if (!ctRes.status) throw new Error(ctRes.message);

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
        case 4:
          this.formData.credit_term = 60;
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
        case 60:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 4)[0];
          break;
        default:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 5)[0];
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
