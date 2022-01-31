<template>
  <q-page class="q-pa-xl">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-body1 text-weight-medium">1) Tenant Info</div>
          <div class="row justify-between q-col-gutter-md">
            <div class="col-12">
              <q-input
                outlined
                v-model="formData.name"
                label="Company Name *"
                lazy-rules
                :rules="whiteSpaceRules"
                dense
                autogrow
              />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                lazy-rules
                autogrow
                v-model="formData.registration_number"
                label="Registration Number *"
                :rules="whiteSpaceRules"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                maxlength="7"
                v-model="formData.alias_name"
                label="Unique ID *"
                lazy-rules
                dense
                :rules="[
                  (val) => !!val || 'Please type something',
                  (val) => val.length == 7 || 'Unique ID must be 7 alphanumeric',
                  (val) => !existingUniqueId.includes(val) || 'Cannot use this ID'
                ]"
              />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                lazy-rules
                autogrow
                v-model="formData.first_name"
                label="First Name *"
                :rules="whiteSpaceRules"
              />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                lazy-rules
                autogrow
                v-model="formData.last_name"
                label="Last Name"
                :rules="lastNameRules"
              />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                lazy-rules
                autogrow
                v-model="formData.email"
                label="Email *"
                :rules="emailRules"
              />
            </div>
            <div class="col-12">
              <q-input dense outlined lazy-rules v-model="formData.tax_rate" label="Tax Rate" />
            </div>
            <div class="col-12">
              <q-input
                dense
                outlined
                lazy-rules
                label="Default Credit Card Term"
                v-model.number="formData.default_credit_card_term"
                type="number"
                suffix="Day(s)"
                :min="0"
              />
            </div>
            <div class="col-12">
              <q-toggle
                v-model="formData.email_notification"
                :true-value="1"
                :false-value="0"
                label="Email Notification"
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
              <q-input
                outlined
                v-model="formData.delivery_instruction"
                label="Delivery Instruction"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
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
                :min="0"
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
              />
              <q-select
                v-model="formData.profile"
                label="Profile"
                ref="profile"
                outlined
                dense
                lazy-rules
                :options="customerProfiles"
                :rules="[(v) => !!v || 'Profile cannot be empty']"
              />
              <q-toggle
                v-model="formData.halal_products"
                :label="formData.halal_products ? 'Halal (Yes)' : 'Halal (No)'"
                :true-value="true"
                :false-value="false"
              />
              <q-toggle
                v-model="formData.active"
                :label="formData.active ? 'Active (Yes)' : 'Active (No)'"
                :true-value="true"
                :false-value="false"
              />
              <div class="q-mt-lg">
                <image-table
                  :cust-id="formData.id"
                  :disabled="!isEditMode"
                  :cust-name="custName"
                  :logo-address="formData.logo"
                  @add-file="addFile"
                />
              </div>
            </div>
            <div class="col-6">
              <q-select
                v-model="creditPayment"
                label="Credit Term"
                ref="profile"
                outlined
                dense
                :options="creditPayments"
                lazy-rules
                :rules="[
                  (v) => !!v || 'Credit payment cannot be empty',
                  (v) => v.value > -1 || 'please select payment type'
                ]"
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
                v-model="paymentType"
                label="Payment Type"
                ref="profile"
                outlined
                dense
                :options="paymentTypes"
                lazy-rules
                :rules="[
                  (v) => !!v || 'Payment Type cannot be empty',
                  (v) => v.value > -1 || 'please select payment type'
                ]"
                class="form-group mb-2"
                @input="setPaymentType()"
              />
              <q-select
                v-model="formData.tenant_level"
                label="Tenant Level"
                ref="tenant_level"
                outlined
                dense
                map-options
                emit-value
                option-label="name"
                option-value="id"
                :options="tenantLevels"
                :rules="[(v) => !!v || 'tenant_level cannot be empty']"
                class="form-group mb-2"
              />
              <q-input
                class="form-group mb-2"
                dense
                outlined
                lazy-rules
                label="Lead Days"
                v-model.number="formData.lead_days"
                type="number"
                suffix="Day(s)"
                :min="0"
                :rules="[(v) => !!v || 'lead_days must bigger than 0']"
              />
              <q-input
                outlined
                v-model="formData.commission_rate"
                label="Commission Rate"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                type="number"
                suffix="%"
                :min="0"
                :rules="[(v) => !!v || 'commission_rate must bigger than 0']"
              />
              <q-toggle
                v-model="formData.cod"
                :label="formData.cod ? 'No Cash No Delivery (Yes)' : 'No Cash No Delivery (No)'"
                :true-value="true"
                :false-value="false"
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
            Save Tenant Info
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
            <delivery-day-table :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
          <div class="q-mt-lg">
            <person-table :cust-id="formData.id" :disabled="!isEditMode" />
          </div>
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { env } from 'src/config';
import { Api, Notice, isEmailValid, isNumeric, isValidName, isValidCountry, isWhiteSpace } from 'services';
import { Voucher } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import AddressTable from './AddressTable.vue';
import HourTable from './HourTable.vue';
import PersonTable from './PersonTable.vue';
import DeliveryDayTable from './DeliveryDayTable.vue';
import ImageTable from './ImageTable.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import { getAllSupplierDashboardAdmin, updateNewSupplierDashboardAdmin } from 'treeGQL';

export default {
  components: {
    FormDialog,
    AddressTable,
    HourTable,
    DeliveryDayTable,
    PersonTable,
    ImageTable,
    ImageChooser
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
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
        registration_number: null,
        tax_registration_number: null,
        alias_name: null,
        group_id: null,
        customer_type_id: 3, // Tenant
        collection_type_id: null,
        delivery_instruction: null,
        delivery_charge: 0,
        delivery_day: null,
        minimum_order: 0,
        profile: null,
        halal_products: false,
        cod: false,
        credit_term: 0,
        tax_rate: 0,
        default_credit_card_term: 0,
        payment_type: null,
        xero_id: null,
        voucherify_id: null,
        active: true,
        email: null,
        email_notification: 0,
        tenant_level: null,
        logo: null,
        lead_days: 0,
        commission_rate: 0
      },
      nameRules: [(v) => !!v || 'Please type something', (v) => isValidName(v) || 'Invalid characters'],
      lastNameRules: [(v) => v?.length === 0 || isValidName(v) || (v && 'Invalid characters')],
      countryRules: [
        (v) => !!v || 'Please select country',
        (v) => isValidCountry(v) || 'Currently we only support Singapore & Malaysia'
      ],
      emailRules: [
        (v) => (v && v.length > 0) || 'Please type something',
        (v) => isEmailValid(v) || 'Please use valid email'
      ],
      NumberRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character'
      ],
      whiteSpaceRules: [(v) => !!v || 'Please type something', (v) => isWhiteSpace(v) || 'Invalid type'],
      dueDateRules: [
        (v) => !!v || 'Please type something',
        (v) => isNumeric(v) || 'Please use numeric character',
        (v) => Number(v) > 0 || 'Should be more than 0',
        (v) => Number(v) != 30 || 'use " 30 Days option"',
        (v) => Number(v) <= 60 || 'Should be less than 60'
      ],
      minimumOrderRules: [
        (v) => isNumeric(v) || 'Please use numeric character',
        (v) => Number(v) > 0 || 'Should be more than 0',
        (v) => Number(v) <= 90000 || 'Should be less than 90.000'
      ],
      groups: [],
      customerTypes: [],
      collectionTypes: [],
      existingUniqueId: [],
      customerProfiles: this.$helper.getCustomerProfiles(),
      tenantLevels: this.$helper.getTenantLevels(),
      creditPayments: this.$helper.getCreditPayments(),
      paymentTypes: this.$helper.getPaymentTypes(),
      days: [
        {
          value: 'Monday',
          label: 'Monday'
        },
        {
          value: 'Tuesday',
          label: 'Tuesday'
        },
        {
          value: 'Wednesday',
          label: 'Wednesday'
        },
        {
          value: 'Thursday',
          label: 'Thursday'
        },
        {
          value: 'Friday',
          label: 'Friday'
        },
        {
          value: 'Saturday',
          label: 'Saturday'
        },
        {
          value: 'Sunday',
          label: 'Sunday'
        }
      ]
    };
  },
  computed: {
    isEditMode() {
      return this.formData.id !== null;
    },
    isASupplier() {
      return false;
    },
    custName() {
      return this.formData.name;
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
    this.getTenantDetail();
    this.getGroup();
    this.getCustomerType();
    this.getCollectionType();
  },
  methods: {
    async getTenantDetail() {
      try {
        const res = await Api.get('v_tenant_details', `id = ${this.credentials.tenant_customer_id}`);
        if (!res.status) {
          throw res.message;
        }

        let dataTenant = [];
        const allData = await this.getAllSuppliers(this.credentials.tenant_customer_id);
        for (const supplier of allData.data.getAllSupplierDashboardAdmin) {
          dataTenant.push({
            id: supplier.id,
            name: supplier.name,
            account_number: supplier.account_number,
            alias_name: supplier.alias_name,
            customer_type_id: supplier.customer_type_id,
            tenant_id: supplier.tenant_id,
            class_id: supplier.tenant.class_id,
            class_name: supplier.tenant.tenant_class.name,
            tenant_level: supplier.tenant.class_id,
            delivery_charge: supplier.delivery_charge,
            delivery_instruction: supplier.delivery_instruction,
            minimum_order: supplier.minimum_order,
            profile: supplier.profile,
            registration_number: supplier.tenant.registration_number,
            tax_rate: supplier.tenant.tax_rate,
            building_name: supplier.tenant.building_name,
            street_name: supplier.tenant.street_name,
            unit_number: supplier.tenant.unit_number,
            first_name: supplier.tenant.first_name,
            last_name: supplier.tenant.last_name,
            email_notification: supplier.tenant.email_notification,
            email: supplier.tenant.email,
            default_credit_card_term: supplier.tenant.default_credit_card_term,
            logo: supplier.tenant.logo,
            lead_days: supplier.tenant.lead_days,
            commission_rate: supplier.tenant.commission_rate,
            credit_term: supplier.credit_term,
            payment_type: supplier.payment_type,
            active: supplier.active,
            halal_products: supplier.halal_products,
            cod: supplier.cod,
            mobile: supplier.tenant.key_person ? supplier.tenant.key_person.phone : '',
            country: supplier.address.length > 0 ? supplier.address[0].country.description : '',
            country_code: supplier.address.length > 0 ? supplier.address[0].country.name : '',
            country_id: supplier.address.length > 0 ? supplier.address[0].country.id : '',
            currency_code: supplier.address.length > 0 ? supplier.address[0].currency_code : '',
            currency_symbol: supplier.address.length > 0 ? supplier.address[0].currency_symbol : ''
          });
        }
        dataTenant = dataTenant ? dataTenant[0] : {};

        this.getExistingTenantUniqueId();

        /**
         * We separate keys that is not needed by the formdata
         * If we don't there will be error when updating data
         */
        const { groups, customer_type, addresses, persons, branches } =
          res.data.length > 0 ? res.data[0] : [];

        this.formData = { ...dataTenant };
        //parse int to boolean
        this.formData.hub = Boolean(this.formData.hub);
        this.formData.halal_products = Boolean(this.formData.halal_products);
        this.formData.cod = Boolean(this.formData.cod);
        this.formData.active = Boolean(this.formData.active);
        //remove unused properties
        delete this.formData.hub_can_delivery;
        delete this.formData.hub_delivery_fee;
        delete this.formData.class_id;
        delete this.formData.class_name;
        delete this.formData.mobile;
        delete this.formData.country;
        delete this.formData.country_id;
        delete this.formData.country_code;
        delete this.formData.currency_code;
        delete this.formData.currency_symbol;
        delete this.formData.street_name;

        /** We use comparison to prevent null error on AddressTable, PersonTable, and Branch Error */
        this.addresses = addresses || [];
        this.persons = persons || [];
        this.branches = branches || [];

        this.previousNCND = this.formData.cod;

        this.getDueDate(this.formData.credit_term);
        this.getPaymentType(this.formData.payment_type);
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getExistingTenantUniqueId() {
      const { status, message, data } = await this.$api.get(
        'customers',
        `customer_type_id = 3 AND active = 1 AND alias_name IS NOT NULL AND id != ${this.credentials.tenant_customer_id}`,
        'alias_name'
      );

      if (!status) return Notice.fail(message);

      this.existingUniqueId = [];
      data.forEach((tenant) => this.existingUniqueId.push(tenant.alias_name));
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
      await this.edit();

      this.submitLoading = false;
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

      /** update customers */
      const payload = { ...this.formData };
      if (!payload.minimum_order) payload.minimum_order = 0;
      if (!payload.delivery_charge) payload.delivery_charge = 0;

      for (const i in payload) {
        if (payload[i] === null) {
          delete payload[i];
        }
      }

      const res = await this.updateNewSupplier(payload);
      if (res.data.updateSupplierDashboardAdmin) {
        Notice.ok('Tenant data updated');
      } else {
        Notice.fail(res.error[0].message);
      }

      // const res = await Api.update("customers", payload, payload.id);
      return res;
    },
    addFile(logoData) {
      this.formData.logo = logoData.logo;
      this.formData.base64 = logoData.base64;
      this.formData.imageType = logoData.imageType;
      this.onSubmit();
      location.reload();
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
    },
    async getAllSuppliers(supplierId = 0) {
      try {
        return await this.$apollo
          .query({
            query: getAllSupplierDashboardAdmin,
            variables: {
              supplierId: supplierId
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async updateNewSupplier(data) {
      try {
        return await this.$apollo
          .mutate({
            mutation: updateNewSupplierDashboardAdmin,
            variables: {
              data: data
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
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
