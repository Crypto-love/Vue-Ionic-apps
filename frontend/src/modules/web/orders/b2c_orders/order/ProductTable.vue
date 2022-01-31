<template>
  <div>
    <q-table
      card-class="no-shadow"
      :data="value"
      :columns="columns"
      row-key="name"
      title="Product"
      class="tdots-table"
    >
      <template v-slot:top-right>
        <q-btn
          v-if="!isEditMode"
          unelevated
          rounded
          color="primary"
          label="Add Product"
          no-caps
          style="width:120px height:32px"
          @click="value.length === 0 ? null : showProduct(isPoolingItem)"
        >
          <q-menu v-if="value.length === 0">
            <q-list style="min-width: 120px">
              <q-item clickable v-close-popup @click="showProduct(true)">
                <q-item-section>Pooling Item</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="showProduct(false)">
                <q-item-section>Non-pooling Item</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="primary_text" key="name">
            {{ props.row.sku }}
            <q-badge
              v-if="props.row.dispute_id"
              class="in-dispute-badge"
              color="red"
              @click="openDisputeDetails(props.row.dispute_id, props.row.sku)"
            >
              Dispute Present
            </q-badge>
          </q-td>

          <q-td key="note" :props="props">{{ props.row.note }}</q-td>

          <q-td class="primary_text" key="price_item" :props="props"
            >{{ credentials.currency_symbol }}{{ props.row.price }}</q-td
          >
          <q-td key="quantity" :props="props">
            <qty-field v-model="props.row.quantity" :sample="props.row.sample" :isB2CEdit="isEditMode" />
          </q-td>
          <q-td class="primary_text" key="price_total" :props="props"
            >{{ credentials.currency_symbol
            }}{{ Number(props.row.price * props.row.quantity).toFixed(4) }}</q-td
          >
          <q-td key="info" :props="props">
            <q-icon name="eva-info-outline" size="sm" />
            <q-tooltip anchor="center left" self="center right" :offset="[-25, 10]">{{
              props.row.info
            }}</q-tooltip>
          </q-td>
          <q-td key="item_status" :props="props">
            <q-btn-dropdown
              split
              rounded
              unelevated
              no-caps
              align="center"
              text-color="white"
              size="md"
              :label="capitalize(props.row.item_status)"
              :color="getItemStatusColor(props.row.item_status)"
              class="q-my-md"
              v-if="props.row.item_status"
              :disable="isDisable"
            >
              <q-list dense v-for="(item, index) in listItemStatus" :key="index">
                <q-item
                  :active="props.row.item_status !== item.name"
                  :clickable="props.row.item_status !== item.name"
                  v-close-popup
                >
                  <q-item-section>
                    <q-item-label @click="onChangeItemOrderStatus(props.row, item.id, item.name)">{{
                      item.name
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
          <q-td v-if="isEditMode" key="status_note" :props="props">
            {{ props.row.status_note }}
            <q-popup-edit v-model="props.row.status_note" title="Item's note" buttons>
              <q-input type="textarea" v-model="props.row.status_note" dense autofocus />
            </q-popup-edit>
            <q-tooltip v-if="props.row.status_note" anchor="center left" self="center middle">{{
              props.row.status_note
            }}</q-tooltip>
          </q-td>
          <q-td>
            <div class="column justify-center items-center">
              <q-btn
                flat
                round
                color="red-4"
                @click="onCancelItem(props.row.id, props.row.order_item_status_id)"
                icon="eva-slash-outline"
                v-if="props.row.order_item_status_id && props.row.order_item_status_id !== 10"
              >
                <q-tooltip>Cancel this item</q-tooltip>
              </q-btn>
              <!-- <q-btn flat round color="red-4" @click="onDeleteProduct(props.row.id)">
                <q-img
                  src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/bin.png"
                  style="width: 20px; "
                ></q-img>
                <q-tooltip>Delete</q-tooltip>
              </q-btn> -->
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="showProductForm" persistent>
      <product-form
        @save="onAddProduct"
        :item="item"
        :sample="isSample"
        :customer-id="isEditMode ? this.item.customer_buyer_id : selectedCustomer.id"
        :tenant-id="isEditMode ? this.item.tenant_id : selectedTenant.tenant_id"
        :isPoolingItem="isPoolingItem"
      />
    </q-dialog>
    <q-dialog v-model="showDisputeDetails" persistent>
      <dispute-details
        @save="onSaveDispute"
        :disputeId="selectedDisputeId"
        :productName="selectedDisputeProduct"
      />
    </q-dialog>
  </div>
</template>

<script>
import ProductForm from './ProductForm.vue';
import DisputeDetails from './DisputeDetails.vue';
import QtyField from 'web/share/partial/QtyField.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { Notice } from 'services';
import { getOrderItemStatuses } from 'treeGQL';

export default {
  components: {
    ProductForm,
    DisputeDetails,
    QtyField
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    selectedCustomer: {
      default: null
    },
    selectedTenant: {
      default: null
    },
    item: {
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      showProductForm: false,
      showDisputeDetails: false,
      selectedDisputeId: null,
      selectedDisputeProduct: null,
      isSample: false,
      isPoolingItem: false,
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Product Name',
          align: 'left',
          field: 'sku',
          sortable: true
        },

        {
          name: 'note',
          align: 'center',
          label: ' ',
          field: 'note',
          sortable: true
        },
        {
          name: 'price_item',
          align: 'center',
          label: 'Price / Item',
          field: 'price',
          sortable: true
        },
        {
          name: 'quantity',
          align: 'center',
          label: 'Quantity',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'price_total',
          align: 'center',
          label: 'Price Total',
          field: 'price_total',
          sortable: true
        },
        {
          name: 'info',
          align: 'center',
          label: 'Info',
          field: 'info',
          sortable: true
        },
        {
          name: 'item_status',
          align: 'center',
          label: 'Item Status',
          field: 'item_status',
          sortable: true
        },
        {
          name: 'action',
          align: 'center',
          label: 'Action',
          field: 'action',
          sortable: true
        }
      ]
    };
  },
  computed: {
    isDisable() {
      return this.$store.state.user_type_id == 2
        ? false
        : this.$store.state.user_type_id == 4
        ? false
        : this.$store.state.user_type_id == 11
        ? false
        : this.$store.state.user_type_id == 1
        ? false
        : true;
    },
    isAdmin() {
      return this.$store.state.user_type_id == 2
        ? true
        : this.$store.state.user_type_id == 4
        ? true
        : this.$store.state.user_type_id == 11
        ? true
        : this.$store.state.user_type_id == 1
        ? true
        : false;
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    },
    isEditMode() {
      return this.item !== null;
    },
    isPoolingOrder() {
      return this.value.length && this.value[0].pooling;
    }
  },
  created() {
    if (this.isEditMode) {
      /** Add one column */
      this.columns.splice(-1, 0, {
        name: 'status_note',
        align: 'center',
        label: 'Note',
        field: 'status_note',
        style: 'max-width: 100px;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
        sortable: false
      });
    }
    this.getListItemStatus();
  },
  methods: {
    onAddProduct(newData) {
      const newItems = [...newData];
      if (this.isPoolingItem && newItems.length > 1) newItems = [newData[0]];

      for (let nd of newItems) {
        // Find if data is already exist, if it does, then set qty + 1
        const idx = this.value.findIndex((v) => v.sku_id === nd.sku_id);
        if (idx === -1) {
          this.value.push(nd);
        } else {
          if (!nd.sample) {
            this.value[idx].quantity++;
            this.value[idx].order_qty++;
            this.value[idx].price = nd.price;
          }
        }
      }

      this.showProductForm = false;
      this.$emit('add-item', newItems);
    },
    // onDeleteProduct(id) {
    //   if(this.item){
    //     this.$q
    //     .dialog({
    //       title: "Confirm",
    //       message: "Would you delete item ?",
    //       cancel: true,
    //       persistent: true
    //     })
    //     .onOk(() => {
    //       this.deleteItem(id);
    //     })
    //     .onCancel(() => {

    //     });

    //   }
    //   else{
    //     const idx = this.value.findIndex(v => v.id === id);
    //     this.value.splice(idx, 1);
    //   }
    // },
    onCancelItem(id) {
      if (this.item) {
        this.$q
          .dialog({
            title: 'Confirm',
            message: 'Would you delete item ?',
            cancel: true,
            persistent: true
          })
          .onOk(() => {
            this.updateItem(id);
          })
          .onCancel(() => {});
      } else {
        const idx = this.value.findIndex((v) => v.id === id);
        this.value.splice(idx, 1);
      }
    },
    // async deleteItem(id){
    //   const res = this.$api.update("pre_order_items",{active:0},id);
    //   this.$emit("deleteItem", id)
    // },
    async updateItem(id) {
      const res = this.$api.update('pre_order_items', { active: 0 }, id);
      this.$emit('deleteItem', id);
    },
    showProduct(isPoolingItem = false) {
      if (this.isPoolingOrder && this.value.length) return Notice.warn('Only one item is allowed');

      const customerId = this.isEditMode ? this.item.customer_buyer_id : this.selectedCustomer.id;
      const tenantID = this.isEditMode
        ? this.item.tenant_id
        : this.isAdmin
        ? this.$store.state.tenant_id
        : this.selectedTenant.tenant_id;

      if (tenantID) {
        this.isPoolingItem = isPoolingItem;
        this.showProductForm = true;
      } else {
        Notice.warn('Select Tenant first!');
      }
    },

    V2onChangeItemOrderStatus(item, newItemStatusId, newItemStatus) {
      let getPooledItems = item.poolingInformation.filter((col) => col.isPooled == 1).length;
      let getUnpooledItems = item.poolingInformation.filter((col) => col.isPooled == 0).length;
      if (getUnpooledItems > 0 && getPooledItems > 0) {
        if (newItemStatusId == 0) {
          this.$q
            .dialog({
              title: 'Pooling Confirmation',
              message: 'Do You want to split this pooling item?',
              component: ConfirmMessage,
              cancel: true,
              persistent: true
            })
            .onOk(() => {
              this.splitItem(item);
            })
            .onCancel(async () => {});
        } else {
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'Split Required',
            message: `You need to split this item first!`
          });
          return;
        }
      } else {
        if (newItemStatusId == 0) {
          this.$q.dialog({
            parent: this,
            component: AlertMessage,
            title: 'Pooling Successfully',
            message: `You can not split this item!`
          });
          return;
        } else {
          this.$q
            .dialog({
              title: 'Confirm Message',
              message: 'Do You want to update Item Order Status?',
              component: ConfirmMessage,
              cancel: true,
              persistent: true
            })
            .onOk(() => {
              this.changeItemStatus(item.id, newItemStatusId, newItemStatus);
            })
            .onCancel(async () => {});
        }
      }
    },
    onChangeItemOrderStatus(item, newItemStatusId, newItemStatus) {
      this.$q
        .dialog({
          title: 'Confirm Message',
          message: this.$t('change_order_item_status_confirmation'),
          component: ConfirmMessage,
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.changeItemStatus(item.id, newItemStatusId, newItemStatus);
        })
        .onCancel(async () => {});
    },
    changeItemStatus(id, newItemStatusId, newItemStatus) {
      this.$emit('change-item-status', id, newItemStatusId, newItemStatus);
    },
    splitItem(item) {
      this.$emit('split-item', item);
    },
    openDisputeDetails(disputeId, productName) {
      this.selectedDisputeId = disputeId;
      this.selectedDisputeProduct = productName;
      this.showDisputeDetails = true;
    },
    onSaveDispute() {
      this.showDisputeDetails = false;
    },
    async getListItemStatus() {
      try {
        const response = await this.$apollo
          .query({
            query: getOrderItemStatuses,
            variables: {
              ids: [-2, -1, 11, 13]
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        this.listItemStatus = response?.data?.getOrderItemStatuses || null;
      } catch (error) {}
    },
    capitalize(str) {
      if (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      return '';
    },
    getItemStatusColor(item_status) {
      switch (item_status.toLowerCase()) {
        case 'processing in hub':
          return 'amber-8';
        case 'processed in hub':
          return 'cyan';
        case 'b2c processed':
          return 'primary';
        case 'b2c cancelled':
          return 'red-7';
        case 'refunded':
          return 'red-7';
        default:
          return 'grey';
      }
    }
  }
};
</script>

<style>
.in-dispute-badge {
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
  cursor: pointer;
}
</style>
