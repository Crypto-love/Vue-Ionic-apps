<template>
  <form-dialog :title="getTitle" class="modal-xl" data-cy="create-order-form">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-md">
        <!-- LEFT -->
        <div class="col-xs-12 col-md-4">
          <q-input
            :disable="isEditMode"
            :value="isEditMode ? this.item.customer : formData.customer.name"
            label="Choose Customer *"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
            data-cy="choose-customer"
          >
            <q-menu v-model="showSelectCustomer">
              <choose-customer v-model="formData.customer" @set-customer="setCustomer" />
            </q-menu>
          </q-input>
          <q-input
            :value="isEditMode ? formData.delivery_address : formData.customer.delivery_address"
            label="Delivery Address"
            lazy-rules
          >
            <template v-if="!isEditMode" v-slot:append>
              <q-icon
                name="mdi-arrow-right-thick"
                class="cursor-pointer"
                @click="
                  showAddressSelection(
                    'delivery',
                    formData.customer.delivery_address_id,
                    formData.customer.id
                  )
                "
              ></q-icon>
            </template>
          </q-input>
          <q-input
            :value="isEditMode ? formData.billing_address : formData.customer.billing_address"
            label="Billing Address"
            lazy-rules
          >
            <template v-if="!isEditMode" v-slot:append>
              <q-icon
                name="mdi-arrow-right-thick"
                class="cursor-pointer"
                @click="
                  showAddressSelection('billing', formData.customer.billing_address_id, formData.customer.id)
                "
              ></q-icon>
            </template>
          </q-input>
          <div class="datepicker">
            <q-input
              rounded
              v-model="formData.delivery_date"
              mask="date"
              :rules="[(val) => !!val || 'Please choose something', 'date']"
              label="Delivery Date*"
              data-cy="delivery-date"
            >
              <q-menu self="bottom left" v-model="showSelectDate">
                <q-date
                  v-model="formData.delivery_date"
                  :options="filterDate"
                  @input="setDeliveryDate"
                  mask="YYYY-MM-DD"
                />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input>
          </div>
          <q-input v-model="formData.po_number" label="PO Number" lazy-rules />
          <q-toggle v-model="formData.standalone" label="Separate Invoice" data-cy="separate-invoice" />
          <q-input v-model="formData.remark" label="Remarks" lazy-rules data-cy="remark" />
        </div>

        <!-- RIGHT -->
        <div class="col-xs-12 col-md-8">
          <product-table
            v-model="products"
            :item="item"
            :selected-customer="formData.customer"
            @deleteItem="removeItem"
            @cancel-item="cancelItem"
            @change-item-status="changeItemStatus"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <!-- SUMMARY -->
          <ul class="leaders">
            <li>
              <span>Subtotal</span>
              <span>{{ credentials.currency_symbol }} {{ $helper.displayPrice(subTotal) }}</span>
            </li>

            <li>
              <span>Delivery Fee</span>
              <span>{{ credentials.currency_symbol }} {{ deliveryFee }}</span>
            </li>

            <li>
              <span>Tax Amount</span>
              <span>{{ credentials.currency_symbol }} {{ $helper.displayPrice(tax) }}</span>
            </li>

            <li>
              <span class="gtotal" color="primary">Grand Total</span>
              <span class="gtotal" color="primary"
                >{{ credentials.currency_symbol }} {{ $helper.displayPrice(grandTotal) }}</span
              >
            </li>
          </ul>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <q-circular-progress
        indeterminate
        size="30px"
        color="primary"
        class="q-mr-md q-mb-md"
        v-if="submitLoading"
      />
      <template v-else>
        <q-btn flat no-caps label="Cancel" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn
          v-if="needCard"
          disable
          flat
          label="Require Card"
          class="btn-save"
          form="myForm"
          type="submit"
          data-cy="submit-order"
        />
        <q-btn v-else flat label="Save" class="btn-save" form="myForm" type="submit" data-cy="submit-order" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ProductTable from './ProductTable.vue';
import ChooseCustomer from './ChooseCustomer.vue';
import AddressSelection from './AddressSelection.vue';
import { Api, Notice, isNumeric, disableYesterdayDates } from 'services';
import { stripe } from 'services';
export default {
  components: {
    FormDialog,
    ProductTable,
    ChooseCustomer
  },
  props: {
    item: {
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      date: new Date(),
      submitLoading: false,
      showProductForm: false,
      products: [],
      addProduct: false,
      showSelectCustomer: false,
      showSelectUser: false,
      showSelectDate: false,
      users: [],
      filterUsers: [],
      formData: {
        id: null,
        customer: {
          // To store only necessary items for the table
        },
        user: null,
        sub_company: {},
        delivery_date: null,
        standalone: false,
        po_number: null,
        remark: null,
        products: []
      },
      tookanIdRules: [
        (val) => (val && val.length > 0) || 'Please type something',
        (val) => isNumeric(val) || 'Please use numeric character only'
      ],
      invoice: null
    };
  },
  computed: {
    isPayCard() {
      return this.formData.customer.payment_type == 2;
    },
    needCard() {
      if (this.formData.customer.payment_type == 2 && !this.formData.customer.stripe_card_id) {
        return true;
      }
      return false;
    },
    isEditMode() {
      return this.item !== null;
    },
    getTitle() {
      return this.isEditMode ? 'Edit Order' : 'Add New Order';
    },
    subTotal() {
      return Number(
        this.products
          .filter((v) => v.active === 1)
          .map((v) => {
            return Number(this.$helper.displayPrice((v.price / v.weight) * v.total_weight));
          })
          .reduce((total, v) => total + v, 0)
      );
    },
    deliveryFee() {
      return 0;
    },
    tax() {
      return Number(
        this.products
          .filter((v) => v.active === 1)
          .reduce((total, v) => {
            const totalPrice = Number(
              v.is_order_by_weight || v.catch_weight
                ? this.$helper.displayPrice((Number(v.price) / Number(v.weight)) * Number(v.total_weight))
                : this.$helper.displayPrice(v.quantity * Number(v.price))
            );

            return Number(this.$helper.displayPrice(total + (v.tax_rate / 100) * totalPrice));
          }, 0)
      );
    },
    grandTotal() {
      return Number(this.subTotal) + Number(this.deliveryFee) + Number(this.tax);
    }
  },

  async mounted() {
    this.$q.loading.show({ message: 'Please wait...' });
    if (this.isEditMode) {
      const { data } = await Api.get(
        'v_prices',
        `order_id = ${this.item.id} and tenant_id = ${this.credentials.tenant_id}`,
        '*, quantity AS prev_quantity, order_item_status_id AS prev_order_item_status_id, quantity AS restock_qty'
      );

      const res = await Api.get('invoices', `id=${this.item.invoice_id}`);
      this.invoice = res.data[0];

      /**
       * Don't show inactive item
       * But if an item status is Cancelled (10) -> keep showing it
       * If item is cancelled, it's status = 10, and active status = 0
       */
      const filteredProduct = data.filter((v) => {
        return v.active === 1 || v.order_item_status_id === 10 || v.order_item_status_id === 15;
      });
      this.products = [...filteredProduct]; // to avoid mutating original array
      this.item.product = [...filteredProduct]; // to avoid mutating original array
      this.formData = this.item;
      this.formData.delivery_address = this.invoice.delivery_address;
      this.formData.billing_address = this.invoice.billing_address;
      this.formData.delivery_postal_code = this.invoice.delivery_postal_code;
      this.formData.standalone = this.item.standalone == 1 ? true : false;
      this.formData.user = {
        label: this.item.user_name,
        value: this.item.user_id
      };
      this.formData.remark = this.item.description;
    }
    this.$q.loading.hide();
  },
  methods: {
    showAlert(title, message) {
      this.$q.dialog({
        parent: this,
        component: AlertMessage,
        title,
        message
      });
    },
    filterUser(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.filterUsers = this.users;
        } else if (needle.length >= 2) {
          this.filterUsers = this.users.filter((v) => v.label.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    filterDate(date) {
      return disableYesterdayDates(date);
    },
    async checkPreviosOrder() {
      if (this.isEditMode) return false;
      const { data } = await Api.get(
        'v_order_summary',
        `delivery_date='${this.formData.delivery_date}'
        and customer_buyer_id=${this.formData.customer.id}
        and active = 1 and stripe_transaction_id is null
        and tenant_id=${this.credentials.tenant_id}`,
        null,
        null,
        1
      );
      return data.length > 0;
    },
    async havePreviosOrder() {
      if (await this.checkPreviosOrder()) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Previous Order',
          message: `You have ordered for this delivery date [${this.formData.delivery_date}]`
        });
      }
    },
    delete() {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      setTimeout(() => {
        const idx = this.data.findIndex((v) => v === this.selectedItem);
        this.data.splice(idx, 1);
        this.selectedItem = null;
        this.$q.loading.hide();
      }, 2000);
    },
    async onSubmit() {
      if (this.isEditMode) {
        let simplified = this.products.map((x) => {
          /* New formula to calculate total price,
          because now there's catch weight feature which use this function.
          So we need to generalize how we calculate it */
          const totalPrice =
            x.catch_weight || x.is_order_by_weight
              ? (parseFloat(x.price) / parseFloat(x.weight)) * parseFloat(x.total_weight)
              : parseFloat(x.price) * Number(x.quantity);
          return {
            id: x.id,
            order_item_id: x.order_item_id,
            active: x.active,
            sku: x.sku, // For notification purposes
            sku_id: x.sku_id,
            product_type_id: x.product_type_id,
            quantity: x.quantity,
            prev_quantity: x.prev_quantity,
            restock_qty: x.restock_qty,
            weight: parseFloat(x.weight),
            total_weight: parseFloat(x.total_weight),
            catch_weight: x.catch_weight,
            prev_order_item_status_id: x.prev_order_item_status_id,
            unit_price: parseFloat(x.price),
            total_price: parseFloat(this.$helper.displayPrice(totalPrice)),
            order_item_status_id: x.order_item_status_id,
            status_note: x.status_note,
            is_order_by_weight: x.is_order_by_weight,
            tax_rate: x.tax_rate
          };
        });

        const shouldCancelOrder = simplified.reduce((res, v) => {
          return res && (v.order_item_status_id == 10 || v.order_item_status_id == -3);
        }, true);

        const payload = {
          customer_id: this.item.customer_buyer_id,
          delivery_date: this.formData.delivery_date,
          last_user_id: this.$store.state.id,
          description: this.formData.remark,
          standalone: this.formData.standalone === true ? 1 : 0,
          po_number: this.formData.po_number,
          items: simplified,
          payment_type: this.invoice.payment_type,
          credit_term: this.invoice.credit_term,
          delivery_address: this.formData.delivery_address,
          billing_address: this.formData.billing_address,
          postal_code: this.formData.delivery_postal_code,
          currency_code: this.invoice?.currency_code || this.$store.state.currency_code,
          currency_symbol: this.invoice?.currency_symbol || this.$store.state.currency_symbol
        };

        if (simplified.length > 0) {
          this.$emit('edit-complete', this.item.id, payload, shouldCancelOrder);
        }
      } else {
        this.submitLoading = true;
        if (await this.checkPreviosOrder()) {
          this.$q
            .dialog({
              parent: this,
              class: 'previous-order-dialog',
              component: ConfirmMessage,
              title: 'Previous Order',
              message: `You have ordered for this delivery date [${this.formData.delivery_date}], continue?`
            })
            .onOk(async () => {
              await this.placeOrder();
              this.submitLoading = false;
            })
            .onCancel(() => {
              this.submitLoading = false;
              return;
            });
        } else {
          await this.placeOrder();
          this.submitLoading = false;
        }
      }
    },
    async placeOrder() {
      let simplified = this.products.map((x) => {
        /* New formula to calculate total price,
          because now there's catch weight feature which use this function.
          So we need to generalize how we calculate it */
        const totalPrice =
          x.catch_weight || x.is_order_by_weight
            ? (parseFloat(x.price) / parseFloat(x.weight)) * parseFloat(x.total_weight)
            : parseFloat(x.price) * Number(x.quantity);
        return {
          sku_id: x.sku_id,
          sku: x.sku, // For slack notification purposes
          product_type_id: x.product_type_id,
          quantity: x.quantity,
          weight: parseFloat(x.weight),
          total_weight: parseFloat(x.total_weight),
          catch_weight: x.catch_weight,
          unit_price: parseFloat(x.price),
          total_price: parseFloat(this.$helper.displayPrice(totalPrice)),
          is_order_by_weight: x.is_order_by_weight,
          tax_rate: x.tax_rate
        };
      });

      let creditTerm = this.formData.customer.credit_term;
      let standalone = this.formData.standalone === true ? 1 : 0;

      if (this.formData.customer.payment_type === 2) {
        creditTerm = this.formData.customer.default_credit_card_term || 0;
        standalone = 1; // force it to be 1
      }

      const payload = {
        delivery_date: this.formData.delivery_date,
        last_user_id: this.$store.state.id,
        user_id: this.formData.user ? this.formData.user.value : this.$store.state.id,
        customer_id: this.formData.customer.id,
        customer: this.formData.customer.name, // For slack notification purposes
        description: this.formData.remark,
        standalone,
        po_number: this.formData.po_number,
        items: simplified,
        payment_type: this.formData.customer.payment_type,
        credit_term: creditTerm,
        delivery_address: this.formData.customer.delivery_address,
        billing_address: this.formData.customer.billing_address,
        postal_code: this.formData.customer.delivery_postal_code,
        stripe_card_id: this.formData.customer.stripe_card_id,
        stripe_customer_id: this.formData.customer.stripe_customer_id
      };

      if (simplified.length > 0) {
        this.$emit('add-complete', payload);
      }
      this.submitLoading = false;
    },
    showAddressSelection(addressType, currentAddressId, companyId) {
      this.$q
        .dialog({
          parent: this,
          component: AddressSelection,
          addressType,
          currentAddressId,
          companyId
        })
        .onOk(([selectedAddress, id, postalCode]) => {
          let obj = {};
          if (addressType === 'delivery') {
            this.formData.customer.delivery_address = selectedAddress;
            this.formData.customer.delivery_address_id = id;
            this.formData.customer.delivery_postal_code = postalCode;
          } else {
            this.formData.customer.billing_address = selectedAddress;
            this.formData.customer.billing_address_id = id;
          }
        });
    },
    removeItem(id) {
      const idx = this.products.findIndex((v) => v.order_item_id === id);
      this.products.splice(idx, 1);
    },
    setCustomer(data) {
      this.showSelectCustomer = data === undefined;
    },
    setUser(data) {
      this.showSelectUser = data === undefined;
    },
    setDeliveryDate() {
      this.havePreviosOrder();
      this.showSelectDate = false;
    },
    cancelItem(id, reason, restockQty) {
      const cancelledItem = this.products.find((v) => v.order_item_id === id);
      cancelledItem.order_item_status_id = 10; // 10 = Cancelled
      cancelledItem.item_status = 'Cancelled';
      cancelledItem.status_note = reason;
      cancelledItem.active = 0;
      cancelledItem.restock_qty = restockQty;
      cancelledItem.show_restock_qty = true;
    },
    changeItemStatus(id, newItemStatusId, newItemStatus) {
      const selectedItem = this.products.find((v) => v.id === id);
      selectedItem.order_item_status_id = newItemStatusId;
      selectedItem.active = newItemStatusId === 10 || newItemStatusId === -3 ? 0 : 1;
      selectedItem.restock_qty = selectedItem.prev_quantity;
      selectedItem.item_status = newItemStatus;
    }
  }
};
</script>
