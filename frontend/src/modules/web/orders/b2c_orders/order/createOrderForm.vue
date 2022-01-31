<template>
  <form-dialog :title="getTitle" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-md">
        <!-- LEFT -->
        <div class="col-xs-12 col-md-4">
          <q-input
            :value="
              isEditMode && !formData.customer.tenant
                ? formData.tenant_name
                : isAdmin
                ? credentials.tenant
                : formData.tenant.name
            "
            label="Choose Tenant *"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
            :disable="isAdmin"
          >
            <q-menu v-model="showSelectTenant">
              <choose-tenant v-model="formData.tenant" @set-tenant="setTenant" />
            </q-menu>
          </q-input>
          <q-input
            :value="isEditMode && !formData.customer.name ? formData.customer : formData.customer.name"
            label="Choose Collection Point *"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
          >
            <q-menu v-model="showSelectCustomer">
              <choose-customer
                v-model="formData.customer"
                :selectedTenant="selectedTenant"
                :isHub="true"
                :isEditMode="isEditMode"
                @set-customer="setCustomer"
                @change-collection-point="changeCollectionPoint"
              />
            </q-menu>
          </q-input>

          <q-input
            :value="isEditMode && !formData.user ? formData.user_name : formData.user.full_name"
            label="Choose User *"
            lazy-rules
            :disable="isEditMode"
            :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
          >
            <q-menu v-model="showSelectUser">
              <choose-user
                v-model="formData.user"
                :selectedHub="selectedHub"
                :selectedTenant="selectedTenant"
                :isHub="false"
                @set-user="setUser"
              />
            </q-menu>
          </q-input>

          <div class="datepicker">
            <q-tooltip
              v-if="listSpree.length === 0"
              class="tooltip-style"
              anchor="top middle"
              self="bottom right"
              >other Collection date not available</q-tooltip
            >
            <q-select
              v-model="formData.delivery_date"
              :options="listSpree"
              label="Choose Collection Date"
              emit-value
              map-options
              option-label="label"
              option-value="value"
              :rules="[(val) => (val && val.length > 0) || 'Please choose something']"
              @input="onChangeCollectionDate"
            >
              <template v-slot:append>
                <q-icon name="event" color="orange" />
              </template>
            </q-select>
            <!-- <q-input
              rounded
              v-model="formData.delivery_date"
              mask="date"
              :rules="[val => !!val || 'Please choose something', 'date']"
              label="Delivery Date*"
            >
              <q-menu self="bottom left" v-model="showSelectDate">
                <q-select v-model="formData.delivery_date" :options="listSpree" />
              </q-menu>
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer"></q-icon>
              </template>
            </q-input> -->
          </div>
          <q-input v-model="formData.remark" label="Remarks" lazy-rules />
        </div>

        <!-- RIGHT -->
        <div class="col-xs-12 col-md-8">
          <product-table
            v-model="products"
            :item="item"
            :selected-customer="formData.customer"
            :selected-tenant="formData.tenant"
            @deleteItem="removeItem"
            @cancel-item="cancelItem"
            @change-item-status="changeItemStatus"
            @split-item="splitItem"
            @add-item="addItem"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <!-- SUMMARY -->
          <template>
            <ul class="leaders">
              <li>
                <span>Subtotal</span>
                <span>{{ credentials.currency_symbol }} {{ subTotal }}</span>
              </li>

              <li>
                <span>Delivery Fee</span>
                <span>{{ credentials.currency_symbol }} {{ deliveryFee }}</span>
              </li>

              <li>
                <span>Tax Amount</span>
                <span>{{ credentials.currency_symbol }} {{ tax }}</span>
              </li>
              <li>
                <span class="gtotal" color="primary">Grand Total</span>
                <span class="gtotal" color="primary">{{ credentials.currency_symbol }} {{ grandTotal }}</span>
              </li>
            </ul>
          </template>
          <template>
            <ul class="leaders">
              <li>
                <span>Refund Subtotal</span>
                <span>{{ credentials.currency_symbol }} {{ refundSubTotal }}</span>
              </li>

              <li>
                <span>Delivery Fee</span>
                <span>{{ credentials.currency_symbol }} {{ deliveryFee }}</span>
              </li>

              <li>
                <span>Refund Tax Amount</span>
                <span>{{ credentials.currency_symbol }} {{ refundTax }}</span>
              </li>
              <li>
                <span class="gtotal" color="primary">Refund Total</span>
                <span class="gtotal" color="primary"
                  >{{ credentials.currency_symbol }} {{ refundTotal }}</span
                >
              </li>
            </ul>
          </template>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn
          flat
          no-caps
          label="Cancel"
          class="btn-cancel q-mr-sm"
          @click="$emit('cancel')"
          v-close-popup
        />
        <q-btn
          :disable="disable_menu()"
          flat
          :label="needCard ? 'Require Card' : 'Save'"
          class="btn-save"
          form="myForm"
          type="submit"
        />
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
import ChooseUser from './ChooseUser.vue';
import ChooseTenant from './ChooseTenant.vue';
import { Notice, isNumeric } from 'services';
import {
  cancelB2cOrderItem,
  changeGBCollectionPoint,
  groupBuyChangeCollectionDate,
  b2cOrderDetails,
  getAvailableSprees,
  b2cOrderList
} from 'treeGQL';
export default {
  components: {
    FormDialog,
    ProductTable,
    ChooseCustomer,
    ChooseTenant,
    ChooseUser
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
      selectedHub: {},
      showSelectTenant: false,
      selectedTenant: {},
      showSelectUser: false,
      showSelectDate: false,
      listSpree: [],
      formData: {
        id: null,
        customer: {},
        tenant: {},
        user: {},
        delivery_date: null,
        remark: null,
        products: [] // To store only necessary items for the table
      },
      tookanIdRules: [
        (val) => (val && val.length > 0) || 'Please type something',
        (val) => isNumeric(val) || 'Please use numeric character only'
      ]
    };
  },
  computed: {
    isPayCard() {
      // disable Request by JC, here the log chat:
      // [18:46, 8/23/2020] Jc Treedots: Can we temporarily switch off the requirement to need CC
      // [18:46, 8/23/2020] Jc Treedots: Because when we launch
      // [18:46, 8/23/2020] Jc Treedots: Some user may still be transiting from bank transfer
      // [18:46, 8/23/2020] Jc Treedots: So we need to help those user put in order
      // if(this.formData.user_name && !this.formData.stripe_card_id){
      // return this.formData.user_name;
      return false;
    },
    needCard() {
      // disable Request by JC, here the log chat:
      // [18:46, 8/23/2020] Jc Treedots: Can we temporarily switch off the requirement to need CC
      // [18:46, 8/23/2020] Jc Treedots: Because when we launch
      // [18:46, 8/23/2020] Jc Treedots: Some user may still be transiting from bank transfer
      // [18:46, 8/23/2020] Jc Treedots: So we need to help those user put in order
      // if(this.formData.user_name && !this.formData.stripe_card_id){
      //   return true;
      // }
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
          .filter((x) => x.order_item_status_id != 12 && x.order_item_status_id != 13)
          .map((v) => parseFloat(v.price * v.quantity))
          .reduce((total, v) => total + v, 0)
      ).toFixed(4);
    },
    refundSubTotal() {
      return Number(
        this.products
          .filter((x) => '12,13'.includes(x.order_item_status_id.toString()))
          .map((v) => parseFloat(v.price * v.quantity))
          .reduce((total, v) => total + v, 0)
      ).toFixed(4);
    },
    deliveryFee() {
      return 0.0;
    },
    tax() {
      return (
        Number(
          this.products
            .filter((x) => x.order_item_status_id != 12 && x.order_item_status_id != 13)
            .map((v) => parseFloat(v.price * v.quantity) * parseFloat(v.tax_rate / 100))
            .reduce((total, v) => total + v, 0)
        ) + Number(this.deliveryFee)
      ).toFixed(4);
    },
    refundTax() {
      return (
        Number(
          this.products
            .filter((x) => '12,13'.includes(x.order_item_status_id.toString()))
            .map((v) => parseFloat(v.price * v.quantity) * parseFloat(v.tax_rate / 100))
            .reduce((total, v) => total + v, 0)
        ) + Number(this.deliveryFee)
      ).toFixed(4);
    },
    grandTotal() {
      return this.$helper.customToFixed2(Number(this.subTotal) + Number(this.tax) + Number(this.deliveryFee));
    },
    refundTotal() {
      return this.$helper.customToFixed2(
        Number(this.refundSubTotal) + Number(this.refundTax) + Number(this.deliveryFee)
      );
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    },
    isAdmin() {
      return this.$store.state.user_type_id == 2
        ? true
        : this.$store.state.user_type_id == 4
        ? true
        : this.$store.state.user_type_id == 1
        ? true
        : false;
    }
  },
  async mounted() {
    await this.getData();
  },
  methods: {
    async getData() {
      if (this.isEditMode) {
        const res = await this.getB2cOrderDetails(this.item.tenant_id, this.item.order_id);

        this.products = [...res.data.getB2COrderdetails];

        this.item.product = [...res.data.getB2COrderdetails];
        this.item.delivery_date = this.$dayjs(this.item.delivery_date).format('DD MMMM YYYY');
        this.item.current_delivery_date = this.$dayjs(this.item.delivery_date).format('DD MMMM YYYY');
        this.formData = this.item;
        this.formData.remark = this.item.description;
        this.setDeliveryDay(this.item.tenant_id, this.item.customer_buyer_id);
      } else {
        this.formData.customer = {};
        this.formData.tenant = {};
        this.formData.user = {};
      }
    },
    async checkPreviosOrder() {
      if (this.isEditMode) return false;
      try {
        const tenantId = this.isAdmin ? this.credentials.tenant_id : this.selectedTenant.tenant_id;
        const response = await this.$apollo
          .query({
            query: b2cOrderList,
            variables: {
              tenantIdList: [tenantId],
              hubIdList: [this.selectedHub.id],
              deliveryDate: this.formData.delivery_date
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        const orders = response?.data?.getB2COrderList || [];
        return orders.length > 0;
      } catch (err) {
        return false;
      }
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
    disable_menu() {
      return this.needCard ? true : !this.isAdmin && !this.isAdvocate ? true : false;
    },
    // customToFixed2(subTotal){
    //   return Number((subTotal * 100).toString().split('.')[0]/ 100).toFixed(2)
    // },
    async onSubmit() {
      if (this.isEditMode) {
        this.submitLoading = true;

        let simplified = this.products.map((x) => {
          let total_price = Number(x.quantity * x.price);
          let tax_rate = parseFloat(x.tax_rate / 100);

          let total_tax = Number(total_price * tax_rate);

          return {
            id: x.id,
            customer_buyer_id:
              this.formData.customer.id == undefined
                ? this.formData.customer_buyer_id
                : this.formData.customer.id,
            active: 1,
            tenant_id: x.tenant_id,
            sku_id: x.sku_id,
            total_qty: x.quantity,
            sale_unit_price: Number(x.price),
            total_price: total_price,
            tax: total_tax,
            order_item_status_id: x.order_item_status_id,
            old_order_item_status_id: x.old_order_item_status_id,
            new_order_item_status_id: x.new_order_item_status_id,
            old_order_status_id: x.old_order_status_id,
            new_order_status_id: x.new_order_status_id,
            order_status_id: x.order_status_id,
            status_note: x.status_note,
            pooling: x.pooling,
            pooling_qty: x.pooling_qty,
            order_qty: x.quantity,
            close_date: x.close_date
          };
        });
        const b2c_delivery_method_id = 0;
        const deliverydata = {
          id: b2c_delivery_method_id,
          order_id: this.item.id,
          delivery_fee: this.deliveryFee
        };

        const payload = {
          delivery_data: deliverydata,
          id: this.item.order_id,
          order_status_id:
            this.products.filter((x) => '-1,-2,11,14,16'.includes(x.order_item_status_id)).length == 0
              ? 12
              : this.products.map((x) => x.order_status_id)[0],
          delivery_date: this.$dayjs(this.formData.delivery_date).format('YYYY-MM-DD'),
          last_user_id: this.formData.user_id,
          description: this.formData.remark,
          items: simplified
        };
        if (simplified.length > 0) {
          this.$emit('edit-complete', payload);
          Notice.ok('Edit Order');
        }
        this.submitLoading = false;
      } else {
        if (this.products.length === 0) return this.$notice.warn('Product cannot be empty');

        this.submitLoading = true;
        const isPreviousOrderExist = await this.checkPreviosOrder();
        this.submitLoading = false;

        if (isPreviousOrderExist) {
          this.$q
            .dialog({
              parent: this,
              component: ConfirmMessage,
              html: true,
              title: 'Previous Order',
              message: `You have ordered for this delivery date <strong>${this.$dayjs(
                this.formData.delivery_date
              ).format('DD MMMM YYYY')}</strong>, continue?`
            })
            .onOk(() => {
              this.placeOrder();
            });
        } else {
          this.placeOrder();
        }
      }
    },
    async placeOrder() {
      let simplified = this.products.map((x) => {
        return {
          skuId: x.sku_id,
          quantity: x.quantity
        };
      });
      const tenantId = this.isAdmin ? this.credentials.tenant_id : this.selectedTenant.tenant_id;
      const payload = {
        userId: this.formData.user.id,
        tenantId: tenantId,
        hubId: this.selectedHub.id,
        deliveryDate: this.formData.delivery_date,
        description: this.formData.remark || undefined,
        cartItems: simplified
      };

      if (simplified.length > 0) this.$emit('add-complete', payload);
    },
    addItem() {
      this.addProduct = true;
    },
    removeItem(id) {
      const idx = this.products.findIndex((v) => v.id === id);
      this.products.splice(idx, 1);
    },
    async setCustomer(data) {
      this.formData.customer = data;
      this.selectedHub = data;

      if (this.isAdmin) {
        this.showSelectCustomer = false;
        this.setDeliveryDay(this.credentials.tenant_id, this.selectedHub.id);
      } else {
        this.showSelectCustomer = data === undefined;
        this.setDeliveryDay(
          this.isEditMode ? this.item.tenant_id : this.selectedTenant.tenant_id,
          this.selectedHub.id
        );
      }
    },
    async setTenant(data) {
      this.showSelectTenant = data === undefined;
      this.formData.tenant = data;
      this.selectedTenant = data;
      this.setDeliveryDay(this.selectedTenant.tenant_id, this.selectedHub.id);
    },
    setUser(data) {
      this.showSelectUser = data === undefined;
      this.formData.user = data;
    },
    async cancelItem(PreOrderItemid) {
      return await this.cancelPreOrderItemsB2cDashboard(PreOrderItemid);
    },
    async cancelPreOrderItemsB2cDashboard(preOrderItemId) {
      try {
        return await this.$apollo
          .mutate({
            mutation: cancelB2cOrderItem,
            variables: {
              id: preOrderItemId,
              appMode: this.$firebase.appMode()
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
      } finally {
        this.$q.loading.hide();
      }
    },
    async changeItemStatus(id, newItemStatusId, newItemStatus) {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      const selectedItem = this.products.find((v) => v.id === id);
      selectedItem.old_order_item_status_id = selectedItem.order_item_status_id;
      selectedItem.order_item_status_id = newItemStatusId;
      selectedItem.new_order_item_status_id = newItemStatusId;
      selectedItem.old_item_status = selectedItem.item_status;
      selectedItem.item_status = newItemStatus;
      if (newItemStatusId === 13) {
        //using V3 BE to Cancel order item and do refund
        const cancelItemResult = await this.cancelItem(id);
        if (cancelItemResult?.data?.cancelB2cOrderItem) {
          //change item status to refunded after do refund
          selectedItem.order_item_status_id = 12;
          selectedItem.new_order_item_status_id = 12;
          selectedItem.item_status = 'Refunded';
        } else {
          selectedItem.order_item_status_id = selectedItem.old_order_item_status_id;
          selectedItem.new_order_item_status_id = selectedItem.old_order_item_status_id;
          selectedItem.item_status = selectedItem.old_item_status;
        }

        //if there this item and other item already B2C cancelled update order status to B2C cancelled
        if (this.products.filter((x) => '-1,-2,11,14,16'.includes(x.order_item_status_id)).length == 0) {
          selectedItem.old_status_id = selectedItem.order_status_id;
          selectedItem.order_status_id = 12;
          selectedItem.new_order_status_id = 12;
        }
      }
      this.$q.loading.hide();
    },
    async setDeliveryDay(tenantId, hubId) {
      if (tenantId && hubId) {
        try {
          this.listSpree = [];
          const response = await this.$apollo
            .query({
              query: getAvailableSprees,
              variables: {
                hub_id: hubId,
                tenant_id: tenantId
              }
            })
            .then(async (res) => {
              return res;
            })
            .catch((err) => {
              return err;
            });
          const sprees = response?.data?.getAvailableSprees || [];
          this.listSpree = sprees.map((v) => ({
            label: this.$dayjs(v.delivery_date).format('DD MMMM YYYY'),
            value: v.delivery_date
          }));
        } catch (error) {}
      }
    },
    async splitItem(item) {
      const pooledItems = item.poolingInformation.filter((col) => col.isPooled == 1);
      const unpooledItems = item.poolingInformation.filter((col) => col.isPooled == 0);
      let payload = {
        // customer
      };
      if (pooledItems.length > 0) {
        pooledItems.forEach(async (value, index) => {
          const price = (Number(item.price) * Number(value.total_order)).toFixed(2);
          const tax_rate = parseFloat(value.tax_rate / 100);

          const tax = (Number(price) * tax_rate).toFixed(2);

          const { data, status, message } = await this.$api.update(
            'pre_order_items',
            { total_qty: value.total_order, total_price: price, tax: tax },
            item.id
          );
        });
      }
      if (unpooledItems.length > 0) {
        unpooledItems.forEach(async (value, index) => {
          const price = (Number(item.price) * Number(value.total_order)).toFixed(2);
          const tax_rate = parseFloat(value.tax_rate / 100);

          const tax = (Number(price) * tax_rate).toFixed(2);
          payload = {
            order_item_id: item.id,
            total_qty: Number(value.total_order),
            total_price: Number(price).toFixed(2),
            tax: Number(tax).toFixed(2)
          };

          const { data, status, message } = await this.$api.exec('p_split_item', [
            JSON.stringify(payload).replace(/'/g, '`')
          ]);

          if (status) {
            const updatePoolingInformationDetails = await this.$api.update(
              `pooling_information_details`,
              { order_item_id: data[0].id, active: 0, isPooled: 0 },
              value.id
            );
            const updateSplittedPreOrderItems = await this.$api.update(
              'pre_order_items',
              { order_item_status_id: 13 },
              data[0].id
            );
          }
        });
      }
      await this.getData();
      // item.poolingInformation.forEach((value, index)=>{
      //   if(!value.isPooled){
      //     const {data, status, message} = this.$api.update("pre_order_items", {}, value.order_item_id)
      //   }
      // })
    },
    async changeCollectionPoint(spreeId) {
      this.showSelectCustomer = false;
      try {
        this.$q.loading.show({ message: 'Updating collection point' });
        const response = await this.$apollo
          .mutate({
            mutation: changeGBCollectionPoint,
            variables: {
              orderId: this.item.order_id,
              newSpreeId: spreeId,
              appMode: this.$firebase.appMode()
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        const order = response?.data?.changeGBCollectionPoint;
        if (order && order.id) {
          const newCollectionPoint = order.pre_order_item[0].hub;
          this.$emit('update-collection-point', {
            delivery_date: order.delivery_date,
            customer_buyer_id: newCollectionPoint.id,
            customer: newCollectionPoint.name,
            alias_name: newCollectionPoint.alias_name
          });
          await this.getData();
        } else {
          throw this.$helper.getGraphqlErrorMessage(response);
        }
      } catch (error) {
        this.$notice.fail(error.message || error);
      } finally {
        this.$q.loading.hide();
      }
    },
    async onChangeCollectionDate() {
      let orderId = this.products.length > 0 ? this.products[0].order_id : undefined;
      let newCollectionDate =
        this.$dayjs(new Date(this.formData.delivery_date)).format('YYYY-MM-DDT00:00:00.000') + 'Z';
      let oldCollectionDate =
        this.$dayjs(new Date(this.formData.current_delivery_date)).format('YYYY-MM-DDT00:00:00.000') + 'Z';
      if (this.isEditMode && newCollectionDate !== oldCollectionDate) {
        this.$q
          .dialog({
            parent: this,
            component: ConfirmMessage,
            title: 'Collection Date Update',
            message: this.$t('change_collection_date_confirmation', {
              delivery_date: this.$dayjs(this.item.delivery_date).format('DD MMMM YYYY')
            })
          })
          .onOk(async () => {
            //call function to call GraphQl API
            this.$q.loading.show({
              message: 'Please wait...'
            });
            await this.ChangeCollectionDate(newCollectionDate, orderId);
            this.$q.loading.hide();
          })
          .onCancel(() => {
            return;
          });
      } else {
        this.$q.loading.show({
          message: 'Please make sure, you click cancel not save if u dont wanna change collection date'
        });
        this.$q.loading.hide();
      }
    },
    async ChangeCollectionDate(newCollectionDate, orderId) {
      try {
        await this.$apollo
          .mutate({
            mutation: groupBuyChangeCollectionDate,
            variables: {
              newCollectionDate: newCollectionDate,
              orderId: orderId,
              appMode: this.$firebase.appMode()
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
    async getB2cOrderDetails(tenantId = undefined, orderId = undefined) {
      try {
        return await this.$apollo
          .query({
            query: b2cOrderDetails,
            variables: {
              tenantId: tenantId,
              orderId: orderId
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
