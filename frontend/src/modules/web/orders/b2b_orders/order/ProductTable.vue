<template>
  <div>
    <q-table
      card-class="no-shadow"
      :data="data"
      :columns="columns"
      row-key="name"
      title="Product"
      class="tdots-table"
    >
      <template v-slot:top-right>
        <q-btn
          class="q-mr-sm"
          unelevated
          rounded
          color="primary"
          label="Add Sample"
          no-caps
          style="width:120px height:32px"
          @click="showProduct(true)"
        />
        <q-btn
          unelevated
          rounded
          color="primary"
          label="Add Product"
          no-caps
          style="width:120px height:32px"
          @click="showProduct()"
          data-cy="add-product"
        />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="primary_text" key="name">
            <div>
              <strong>{{ props.row.sku }}</strong>
              <q-badge
                v-if="props.row.dispute_id"
                class="in-dispute-badge"
                color="red"
                @click="openDisputeDetails(props.row.dispute_id, props.row.sku)"
              >
                Dispute Present
              </q-badge>
            </div>
            <div>
              Price / Item: {{ credentials.currency_symbol }}
              {{ props.row.price }}
            </div>
            <div>Default weight: {{ props.row.weight }} Kg</div>
            <div v-if="props.row.catch_weight">Catch weights: {{ props.row.catch_weight }}</div>
            <div v-if="props.row.show_restock_qty && props.row.order_item_status_id === 10">
              Restock qty: {{ props.row.restock_qty }}
            </div>
          </q-td>

          <q-td key="note" :props="props">{{ props.row.note }}</q-td>

          <!-- <q-td class="primary_text" key="price_item" :props="props"
            >${{ props.row.price }}</q-td
          >
          <q-td class="primary_text" key="weight" :props="props">{{
            props.row.weight
          }}</q-td> -->
          <q-td key="quantity" :props="props">
            <qty-field
              v-model="props.row.quantity"
              :is-processed="isProcessed"
              :sample="
                props.row.sample ||
                props.row.order_item_status_id === 10 ||
                parseFloat(props.row.price_total) <= 0 ||
                props.row.is_order_by_weight === 1
              "
              @change="onQtyChanged(props.row, ...arguments)"
            />
          </q-td>

          <q-td class="primary_text" key="total_weight" :props="props">{{ props.row.total_weight }} Kg</q-td>

          <q-td class="primary_text" key="price_total" :props="props"
            >{{ credentials.currency_symbol }}
            {{ $helper.displayPrice(calculateTotalPrice(props.row)) }}</q-td
          >

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
              :disable="isProcessed"
              v-if="props.row.item_status"
            >
              <q-list dense v-for="(item, index) in listItemStatus" :key="index">
                <q-item
                  :active="item.id !== props.row.order_item_status_id"
                  :clickable="item.id !== props.row.order_item_status_id"
                  @click="onChangeItemOrderStatus(props.row.id, item.id, item.name)"
                  v-close-popup
                >
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
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
                color="black"
                :disable="props.row.active === 0 || props.row.sample"
                @click="
                  onUpdateCatchWeight(
                    props.rowIndex,
                    props.row.quantity,
                    props.row.price,
                    props.row.weight,
                    props.row.catch_weight
                  )
                "
              >
                <q-img src="statics/icons/weight.svg" style="width: 20px"></q-img>
                <q-tooltip>Catch Weight</q-tooltip>
              </q-btn>
              <q-btn
                v-if="isEditMode"
                flat
                round
                color="red-4"
                :disable="props.row.active === 0 || !props.row.order_item_id"
                @click="onCancelItem(props.row)"
                icon="eva-slash-outline"
              >
                <q-tooltip>Cancel this item</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!props.row.order_item_id"
                flat
                round
                color="red-4"
                @click="onDeleteProduct(props.pageIndex)"
              >
                <q-img
                  src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/bin.png"
                  style="width: 20px"
                ></q-img>
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
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
import QtyField from './DashboardQtyField';
import { Api, Notice } from 'services';
import CancelItemDialog from './CancelItemDialog.vue';
import RestockQtyDialog from './RestockQtyDialog.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import CatchWeightDialog from './CatchWeightDialog.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

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
      listItemStatus: [],
      shouldResetCatchWeight: true,
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Product Name',
          align: 'left',
          field: 'product',
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
          name: 'total_weight',
          align: 'center',
          label: 'Total Weight',
          field: 'total_weight',
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
    isEditMode() {
      return this.item !== null;
    },
    isProcessed() {
      return this.isEditMode && this.item.status_id !== 1;
    },
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
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
    showAlert(title, message) {
      this.$q.dialog({
        parent: this,
        component: AlertMessage,
        title,
        message
      });
    },
    calculateTotalPrice(item) {
      return item.is_order_by_weight || item.catch_weight
        ? (parseFloat(item.price) / parseFloat(item.weight)) * item.total_weight
        : parseFloat(item.price) * item.quantity;
    },
    onAddProduct(newData) {
      for (let nd of newData) {
        // Find if data is already exist, if it does, then set qty + 1
        const idx = this.data.findIndex((v) => v.sku_id === nd.sku_id && v.active === 1);
        if (idx === -1) {
          this.data.push(nd);
        } else {
          if (!nd.sample) {
            this.data[idx].quantity++;
            this.data[idx].price = nd.price;
          }
        }
      }
      this.showProductForm = false;
    },
    onDeleteProduct(idx) {
      this.$q
        .dialog({
          title: 'Confirm',
          message: 'Would you like to delete this item ?',
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.data.splice(idx, 1);
        })
        .onCancel(() => {});
    },
    /** Catch Weight Popup Diaolog*/
    onUpdateCatchWeight(idx, qty, price, weight, catchWeight) {
      this.$q
        .dialog({
          component: CatchWeightDialog,
          cancel: true,
          persistent: true,
          currentQty: qty,
          price: parseFloat(price),
          defaultWeight: parseFloat(weight),
          currentCatchWeight: catchWeight
        })
        .onOk((obj) => {
          this.shouldResetCatchWeight = true;
          this.data[idx].quantity = obj.new_qty;
          this.data[idx].total_weight = obj.new_total_weight;
          this.data[idx].catch_weight = obj.catch_weight;
        })
        .onCancel(() => {});
    },
    async getRestockQty(currentQty) {
      return new Promise((resolve, reject) => {
        this.$q
          .dialog({
            component: RestockQtyDialog,
            currentQty,
            cancel: false,
            persistent: true
          })
          .onOk((restockQty) => {
            return resolve(restockQty);
          })
          .onCancel(() => {
            return resolve(null);
          });
      });
    },
    async getReason(title = undefined, description = undefined, note = undefined) {
      return new Promise((resolve, reject) => {
        this.$q
          .dialog({
            component: CancelItemDialog,
            title,
            description,
            note,
            cancel: true,
            persistent: true
          })
          .onOk((reason) => {
            return resolve(reason);
          })
          .onCancel(() => {
            return resolve(null);
          });
      });
    },
    async onCancelItem(row) {
      const reason = await this.getReason();
      let restockQty = row.restock_qty;

      if (reason && row.order_item_status_id > 1) {
        restockQty = await this.getRestockQty(row.prev_quantity);
      }

      if (reason && restockQty) {
        this.cancelItem(row.order_item_id, reason, restockQty);
      }
    },
    /** Update item Order status*/
    onChangeItemOrderStatus(id, newItemStatusId, newItemStatus) {
      this.$q
        .dialog({
          title: 'Confirm Message',
          message: `Do You want to update Item Order Status?`,
          component: ConfirmMessage,
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.changeItemStatus(id, newItemStatusId, newItemStatus);
        })
        .onCancel(async () => {});
    },
    async updateItem(id) {
      this.$emit('deleteItem', id);
    },
    cancelItem(id, reason, restockQty) {
      this.$emit('cancel-item', id, reason, restockQty);
    },
    changeItemStatus(id, newItemStatusId, newItemStatus) {
      this.$emit('change-item-status', id, newItemStatusId, newItemStatus);
    },
    showProduct(sample = false) {
      if (this.isProcessed) {
        this.showAlert('Warning', 'Order is no longer processing. Please create new order');
      } else {
        const customerId = this.isEditMode ? this.item.customer_buyer_id : this.selectedCustomer.id;

        if (customerId) {
          this.isSample = sample;
          this.showProductForm = true;
        } else {
          Notice.warn('Select Customer first!');
        }
      }
    },
    capitalize(str) {
      if (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      return '';
    },
    async getListItemStatus() {
      try {
        const res = await Api.get('order_item_statuses', 'id IN (1, 2, 7, 8, 9)');
        this.listItemStatus = res.data;
      } catch (error) {}
    },
    getItemStatusColor(item_status) {
      switch (item_status.toLowerCase()) {
        case 'cancelled':
          return 'red-7';
        default:
          return 'primary';
      }
    },
    openDisputeDetails(disputeId, productName) {
      this.selectedDisputeId = disputeId;
      this.selectedDisputeProduct = productName;
      this.showDisputeDetails = true;
    },
    onSaveDispute() {
      this.showDisputeDetails = false;
    },
    async onQtyChanged(row, currentQty) {
      /** Show Cancel Item Dialog here, because we need to input reason */
      if (this.isEditMode && row.order_item_id && !row.status_note && row.prev_quantity != currentQty) {
        const note = this.shouldResetCatchWeight
          ? `Note: Catch weight will reset to default. You will need to enter the actual weight again.`
          : null;
        const reason = await this.getReason(
          'Item Amendment',
          `You're about to change ${row.sku}'s qty. Please specify a reason.`,
          note
        );
        if (!reason) {
          row.quantity = row.prev_quantity;
          this.shouldResetCatchWeight = false;
          return;
        } else {
          row.status_note = reason;
        }
      }

      if (this.shouldResetCatchWeight) {
        row.total_weight = row.quantity * row.weight;
        row.catch_weight = null;
      } else {
        this.shouldResetCatchWeight = true;
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
