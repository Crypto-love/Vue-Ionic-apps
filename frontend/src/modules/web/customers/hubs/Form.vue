<template>
  <form-dialog :title="isEditMode ? `Edit Hub` : `Add New Hub`" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-body1 text-weight-medium">1) Hub Info</div>
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
              <q-input outlined v-model="formData.alias_name" label="Alias Name" lazy-rules dense autogrow />
            </div>
            <div class="col-6">
              <q-input
                v-if="isEditMode"
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
                :rules="minimumOrderRules"
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
                :options="customerProfiles"
                :rules="[(v) => !!v || 'Profile cannot be empty']"
              />
              <q-toggle
                v-model="formData.halal_products"
                :label="formData.halal_products ? 'Halal (Yes)' : 'Halal (No)'"
              />
              <q-toggle
                v-model="formData.beef_products"
                :label="formData.beef_products ? 'No Beef (Yes)' : 'No Beef (No)'"
              />
              <q-toggle v-model="formData.active" :label="formData.active ? 'Active (Yes)' : 'Active (No)'" />
            </div>
            <div class="col-6">
              <q-select
                v-model="creditPayment"
                label="Credit Term"
                ref="profile"
                outlined
                dense
                :options="creditPayments"
                :rules="[
                  (v) => !!v || 'Credit payment cannot be empty',
                  (v) => v.value > -1 || 'please select Credit payment'
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
                :rules="[
                  (v) => !!v || 'Payment Type cannot be empty',
                  (v) => v.value > -1 || 'please select payment type'
                ]"
                class="form-group mb-2"
                @input="setPaymentType()"
              />
              <q-select
                outlined
                v-model="formData.direction"
                label="Direction"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                :options="directionlist"
              />
              <q-input
                outlined
                v-model="formData.hub_delivery_fee"
                label="Hub Delivery Fee"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                type="number"
                :rules="minimumOrderRules"
                v-if="formData.hub_can_delivery == 1"
              />
              <q-input
                outlined
                v-model="formData.whatsapp_link"
                label="Whatsapp Link"
                class="form-group mb-2"
                lazy-rules
                dense
                autogrow
                :rules="[(val) => !!val || 'Please type something']"
              />
              <q-toggle
                v-model="formData.cod"
                :label="formData.cod ? 'No Cash No Delivery (Yes)' : 'No Cash No Delivery (No)'"
              />
              <q-toggle
                v-model="formData.hub_can_delivery"
                :label="formData.hub_can_delivery ? 'Hub Can Delivery (Yes)' : 'Hub Can Delivery (No)'"
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
            Save Hub Info
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
import { Api, Notice, isEmailValid, isNumeric } from 'services';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AddressTable from './AddressTable.vue';
import HourTable from './HourTable.vue';
import PersonTable from './PersonTable.vue';
import TenantsTable from './TenantsTable.vue';
import ImageTable from './ImageTable.vue';
import ImageChooser from 'web/share/partial/ImageChooser.vue';
import {
  getCustomerDetailByTenant,
  addCustomer,
  updateCustomer
} from 'components/services/share/src/graphql';

export default {
  components: {
    FormDialog,
    AddressTable,
    HourTable,
    PersonTable,
    ImageTable,
    ImageChooser,
    TenantsTable
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      creditPayment: { label: '', value: -1 },
      paymentType: { label: '', value: -1 },
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
        delivery_instruction: null,
        delivery_charge: 0,
        minimum_order: 0,
        hub: true,
        profile: null,
        halal_products: false,
        beef_products: false,
        cod: false,
        credit_term: null,
        payment_type: null,
        xero_id: null,
        active: true,
        direction: null,
        hub_delivery_fee: null,
        hub_can_delivery: false,
        whatsapp_link: null
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
      tenantId: this.$store.state.tenant_id,
      customerProfiles: this.$helper.getCustomerProfiles(),
      creditPayments: this.$helper.getCreditPayments(),
      paymentTypes: this.$helper.getPaymentTypes(),
      directionlist: ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest']
    };
  },
  computed: {
    isEditMode() {
      return this.formData.id;
    },
    isThirdPartyAllowed() {
      return ['production', 'staging', 'testing'].includes(env);
    }
  },
  watch: {
    'formData.name': function (val) {
      this.formData.name = val ? val.removeSpecialCharacter() : '';
    },
    'formData.delivery_instruction': function (val) {
      this.formData.delivery_instruction = val ? val.removeSpecialCharacter() : '';
    }
  },
  async mounted() {
    if (this.id) {
      this.formData.id = this.id;
      this.getCustomerDetail();
    }
  },
  methods: {
    async getCustomerDetail() {
      try {
        const response = await this.$apollo
          .query({
            query: getCustomerDetailByTenant,
            variables: {
              customer_id: this.formData.id,
              tenant_id: this.tenantId
            }
          })
          .then(async (res) => res)
          .catch((err) => err);

        const customer = response?.data?.getCustomerDetailByTenant;
        if (customer) {
          /**
           * We separate keys that is not needed by the formdata
           * If we don't there will be error when updating data
           */
          const { address, persons, __typename, ...data } = customer;

          this.formData = { ...data };

          /** We use comparison to prevent null error on AddressTable, PersonTable, and Branch Error */
          this.addresses = address
            ? address.map((v) => {
                return {
                  ...v,
                  address_type: v.type.name,
                  country: v.country.name,
                  active: v.active ? 1 : 0
                };
              })
            : [];
          this.persons = persons || [];
          this.previousNCND = data.cod;

          this.getDueDate(this.formData.credit_term);
          this.getPaymentType(this.formData.payment_type);
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (err) {
        Notice.fail(err.message);
      }
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
    getCustomerPayload() {
      const minimumOrder = this.formData.minimum_order || 0;
      const deliveryCharge = this.formData.delivery_charge || 0;
      const hubDeliveryFee = this.formData.hub_delivery_fee || 0;
      return {
        name: this.formData.name,
        alias_name: this.formData.alias_name,
        profile: this.formData.profile,
        halal_products: this.formData.halal_products,
        beef_products: this.formData.beef_products,
        cod: this.formData.cod,
        credit_term: this.formData.credit_term,
        payment_type: this.formData.payment_type,
        delivery_instruction: this.formData.delivery_instruction,
        delivery_charge: parseFloat(deliveryCharge),
        minimum_order: parseFloat(minimumOrder),
        hub: this.formData.hub,
        active: this.formData.active,
        direction: this.formData.direction,
        hub_delivery_fee: parseFloat(hubDeliveryFee),
        hub_can_delivery: this.formData.hub_can_delivery,
        whatsapp_link: this.formData.whatsapp_link,
        tenant_id: this.tenantId
      };
    },
    async onSubmit() {
      const data = this.isEditMode ? await this.edit() : await this.add();
      if (!data) return;

      if (this.isEditMode) {
        this.$emit('edit-complete', this.formData.id);
      } else {
        this.formData.id = data.id; // Set isEditMode flag to true
        this.$emit('add-complete', data.id);
      }

      this.getCustomerDetail();
    },
    async add() {
      try {
        this.submitLoading = true;

        const payload = {
          customer: this.getCustomerPayload(),
          is_parent: true
        };

        const response = await this.$apollo
          .mutate({
            mutation: addCustomer,
            variables: payload
          })
          .then(async (res) => res)
          .catch((err) => err);

        const customer = response?.data?.addCustomer;
        if (customer) {
          Notice.ok('New Hub added');
          return customer;
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (err) {
        Notice.fail(err.message);
        return null;
      } finally {
        this.submitLoading = false;
      }
    },
    async edit() {
      try {
        this.submitLoading = true;

        const payload = {
          customer: {
            id: this.formData.id,
            ...this.getCustomerPayload()
          }
        };

        const response = await this.$apollo
          .mutate({
            mutation: updateCustomer,
            variables: payload
          })
          .then(async (res) => res)
          .catch((err) => err);

        const customer = response?.data?.updateCustomer;
        if (customer) {
          Notice.ok('Hub is updated');
          return customer;
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (err) {
        Notice.fail(err.message);
        return null;
      } finally {
        this.submitLoading = false;
      }
    },
    /** Because we don't need any result from this function. So it's better not to await this. */
    updateBranchNCND() {
      const promiseArr = this.branches.map((v) => {
        return this.$api.update('customers', { cod: this.formData.cod }, v.customer_id);
      });

      return Promise.allSettled(promiseArr).then((results) => {
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
        default:
          this.creditPayment = this.creditPayments.filter((item) => item.value === 4)[0];
          break;
      }
    },
    getPaymentType(v) {
      this.paymentType = this.paymentTypes.filter((item) => item.value === v)[0];
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
