<template>
  <div>
    <div class="row bg-grey-2">
      <q-input
        v-model="filterAccordion"
        dense
        borderless
        input-class="text-left"
        class="bg-transparent search-input col"
        label="Search"
      >
        <template v-slot:prepend>
          <q-icon
            v-if="filterAccordion === null || filterAccordion === ''"
            name="eva-search"
            class="search-icon q-ml-sm"
          />
          <q-icon
            v-else
            name="eva-close"
            class="cursor-pointer search-icon q-ml-sm"
            @click="filterAccordion = ''"
          />
        </template>
      </q-input>
      <q-btn-dropdown
        unelevated
        dense
        rounded
        icon="eva-funnel-outline"
        class="bg-primary text-white q-px-md q-my-sm q-mx-md"
        label="Filter"
        no-caps
      >
        <div class="filter-box no-wrap q-pa-md" style="width: 275px">
          <div
            class="filter-head"
            style="padding: 0 0 5px 0; margin-bottom: 0.5rem; border-bottom: 1px solid #dedede"
          >
            <div class="row">
              <div class="title col" style="font-weight: 500; padding: 3px 0 0 0">Filter Based</div>
              <div class="col text-right">
                <q-btn
                  flat
                  padding="none sm"
                  color="red-8"
                  size="md"
                  label="Reset"
                  style="text-transform: none"
                  @click="resetFilter"
                />
              </div>
            </div>
          </div>
          <div class="filter-body">
            <div class="col">
              <q-checkbox
                dense
                v-model="filter.needReplenish"
                class="checkbox"
                label="Quantity to Replenish > 0"
                color="primary"
              />
            </div>
          </div>
        </div>
      </q-btn-dropdown>
    </div>
    <q-table
      class="supplier-accordion-table q-mb-md no-border-radius"
      :columns="columns"
      :pagination.sync="pagination"
      row-key="id"
      :filter="filterAccordion"
      :loading="loadData"
      :data="filteredData"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:body="props">
        <q-tr>
          <q-td class="text-left bg-grey-2 ellipsis word-wrap w-25vw">
            {{ props.row.supplier }}
          </q-td>
          <q-td class="text-center">
            {{ props.row.rank ? props.row.rank : '-' }}
          </q-td>
          <q-td class="text-center">
            {{
              props.row.quantity === -1
                ? '&#8734;'
                : (props.row.quantity ? Number(props.row.quantity) : 0) +
                  (props.row.onhold_qty ? Number(props.row.onhold_qty) : 0)
            }}
          </q-td>
          <q-td class="text-center">
            {{ props.row.quantity ? (props.row.quantity === -1 ? '&#8734;' : props.row.quantity) : 0 }}
          </q-td>
          <q-td class="text-center">
            {{ props.row.onhold_qty ? props.row.onhold_qty : 0 }}
          </q-td>
          <q-td class="text-center">
            {{ props.row.par_level }}
          </q-td>
          <q-td class="text-center">
            {{ props.row.min_qty }}
          </q-td>
          <q-td class="text-center" v-html="props.row.replenish_qty"></q-td>
          <q-td class="text-center" style="width: 200px">
            <div class="row justify-evenly">
              <div>
                <q-btn
                  class="q-mt-sm"
                  size="sm"
                  color="primary"
                  round
                  dense
                  icon="eva-swap-outline"
                  @click="
                    displayUpdateRankingDialog = true;
                    selectedSupplier = props.key;
                    selectedCustomerId = props.row.customer_id;
                  "
                />
                <q-tooltip anchor="bottom middle" self="center middle"> Set Ranking </q-tooltip>
              </div>
              <div>
                <q-btn
                  class="q-mt-sm"
                  size="sm"
                  color="primary"
                  round
                  dense
                  icon="la la-boxes"
                  :disable="props.row.quantity === -1"
                  @click="
                    displayUpdateStockDialog = true;
                    selectedSupplier = props.key;
                    selectedCustomerId = props.row.customer_id;
                    newStockQty = parseInt(props.row.quantity || 0);
                    newParLevel = parseInt(props.row.par_level || 0);
                    newMinQty = parseInt(props.row.min_qty || 0);
                  "
                />
                <q-tooltip anchor="bottom middle" self="center middle"> Update Stock </q-tooltip>
              </div>
              <div>
                <q-toggle
                  :value="props.row.quantity !== -1"
                  title="Track Inventory"
                  @input="updateTrackInventory(props)"
                />
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="displayUpdateStockDialog" persistent>
      <q-card style="min-width: 35vw">
        <q-card-section>
          <div class="text-h6">New stock quantity</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit.prevent="updateStock" id="stockForm">
            <small>*) Protip: you can double click on the value to edit it directly</small>
            <br />
            <small>*) Also. Don't forget to click on "check" button to save the value</small>
            <table>
              <tr>
                <td>Stock</td>
                <td>:</td>
                <td class="q-px-md">
                  <qty-field v-model="newStockQty" />
                </td>
              </tr>
              <tr>
                <td>Par Level</td>
                <td>:</td>
                <td class="q-px-md">
                  <qty-field v-model="newParLevel" />
                </td>
              </tr>
              <tr>
                <td>Min Qty</td>
                <td>:</td>
                <td class="q-px-md">
                  <qty-field v-model="newMinQty" />
                </td>
              </tr>
            </table>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn type="submit" flat label="Update" form="stockForm" />
        </q-card-actions>
        <q-inner-loading :showing="displayUpdateStockDialogLoading">
          <q-spinner-dots size="2em" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>
    <q-dialog v-model="displayUpdateRankingDialog" persistent>
      <q-card style="min-width: 35vw">
        <q-card-section>
          <div class="text-h6">Update Rank</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            autofocus
            type="number"
            min="1"
            v-model="newRankValue"
            @keyup.enter="newRankFilter() ? null : updateRank(data)"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat :disable="newRankFilter()" label="Update" @click="updateRank(data)" />
        </q-card-actions>
        <q-inner-loading :showing="displayUpdateRankingDialogLoading">
          <q-spinner-dots size="2em" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { Api, isNumeric, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import QtyField from 'web/share/partial/QtyField.vue';

export default {
  components: {
    TableTopRight,
    SearchInput,
    QtyField
  },
  data() {
    return {
      displayUpdateStockDialog: false,
      displayUpdateStockDialogLoading: false,
      displayUpdateRankingDialog: false,
      displayUpdateRankingDialogLoading: false,
      newStockQty: 0,
      newParLevel: 0,
      newMinQty: 0,
      newRankValue: 1,
      selectedSupplier: null,
      selectedCustomerId: null,
      filterAccordion: '',
      data: [],
      columns: [
        {
          name: 'Supplier Name',
          align: 'left',
          label: 'Supplier Name',
          field: (row) => row.supplier,
          headerClasses: 'bg-primary text-white ellipsis',
          sortable: true
        },
        {
          name: 'Rank',
          align: 'center',
          label: 'Rank',
          field: 'rank',
          sortable: true
        },
        {
          name: 'Stock',
          align: 'center',
          label: 'Stock',
          field: 'stock',
          sortable: true
        },
        {
          name: 'Available',
          align: 'center',
          label: 'Available',
          field: 'available',
          sortable: true
        },
        {
          name: 'On-hold',
          align: 'center',
          label: 'On-hold',
          field: 'onhold',
          sortable: true
        },
        {
          name: 'Par',
          align: 'center',
          label: 'Par',
          field: 'par_level',
          sortable: true
        },
        {
          name: 'Min Qty',
          align: 'center',
          label: 'Min Qty',
          field: 'min_qty',
          sortable: true
        },
        {
          name: 'Qty to replenish',
          align: 'center',
          label: 'Qty to replenish',
          sortable: true
        },
        {
          name: 'Action',
          align: 'center',
          label: 'Action',
          field: 'action',
          sortable: false
        }
      ],
      loadData: true,
      pagination: {
        rowsPerPage: 10
      },
      filter: {
        needReplenish: false
      }
    };
  },
  props: {
    idSKU: {
      type: Number,
      required: true
    }
  },
  computed: {
    filteredData() {
      return this.data.filter((v) => {
        let condition = true;

        if (this.filter.needReplenish) {
          condition = condition && v.replenish_qty > 0;
        }

        /**
         * if you want to add more filter in the future...
         * Just add more "if" on the lines below
         *
         * Example
         * if (this.filter.showInfinite) {
             condition = condition && (v.quantity === -1);
           }
         */
        return condition;
      });
    }
  },
  created() {
    this.setDataFromProps();
  },
  methods: {
    async setDataFromProps() {
      let i = 0;
      this.loadData = true;
      const { data } = await Api.get(
        'v_inventories',
        `active = 1 and sku_id = ${this.idSKU}`,
        'id,customer_id, sku_id, product_type_id, supplier,rank,quantity, par_level, min_qty',
        'supplier asc'
      );
      this.data = [...data];
      for (i = 0; i < this.data.length; i++) {
        this.data[i].replenish_qty =
          this.data[i].quantity === -1
            ? '&#8734;'
            : this.data[i].par_level - (this.data[i].quantity ? Number(this.data[i].quantity) : 0) >= 0
            ? this.data[i].par_level - (this.data[i].quantity ? Number(this.data[i].quantity) : 0)
            : 0;

        const { data } = await Api.get(
          'order_items',
          `order_item_status_id = 1 and active = 1 and sku_id = ${this.idSKU} and customer_seller_id = ${this.data[i].customer_id}`,
          'sum(total_qty) as onhold_qty'
        );
        this.data[i].onhold_qty = data[0].onhold_qty;
      }
      this.loadData = false;
    },
    search(rows, terms, cols) {
      return this.data.filter((x) => {
        return this.getValuesOfNestedObject(x)
          .filter((value) => value !== 'NULL' && value)
          .join(' ')
          .toLowerCase()
          .includes(terms.toLowerCase());
      });
    },
    newRankFilter() {
      const value = this.newRankValue;
      return value === '' || value === null || value <= 0;
    },
    async updateTrackInventory(data) {
      this.loadData = true;
      let newStock = 0;
      if (data.row.quantity === -1) {
        newStock = 0;
      } else {
        newStock = -1;
      }
      const res = await Api.update('inventories', { quantity: newStock }, data.key);
      if (res.status) {
        Notice.ok('Update the tracking status of inventory');
        await this.setDataFromProps();
      } else {
        Notice.fail('Update the tracking status of inventory');
      }
      this.loadData = false;
    },
    async updateStock() {
      this.displayUpdateStockDialogLoading = true;
      const res = await Api.update(
        'inventories',
        {
          quantity: this.newStockQty,
          par_level: this.newParLevel,
          min_qty: this.newMinQty
        },
        this.selectedSupplier
      );
      if (res.status) {
        await this.setDataFromProps();
        this.displayUpdateStockDialogLoading = false;
        this.displayUpdateStockDialog = false;
        Notice.ok('Update stock quantity');
      } else {
        Notice.fail('Update stock quantity');
      }

      this.newStockQty = 0;
      this.newParLevel = 0;
      this.newMinQty = 0;

      this.displayUpdateStockDialogLoading = false;
    },
    async updateRank(data) {
      this.displayUpdateRankingDialogLoading = true;
      let newRankValue = Number(this.newRankValue);
      let res = await Api.get('inventories', `active = 1 and sku_id = ${this.idSKU}`, 'rank');
      if (res.status) {
        const existedRanking = res.data;
        let existedRankingToFilter = existedRanking.filter(function (el) {
          return el.rank === newRankValue;
        });
        if (existedRankingToFilter.length > 0) {
          this.displayUpdateRankingDialogLoading = false;
          Notice.fail(`Update inventory ranking, Rank ${newRankValue} already exist.`);
          return;
        }
        res = await Api.update('inventories', { rank: newRankValue }, this.selectedSupplier);
        if (res.status) {
          this.newRankValue = 1;
          await this.setDataFromProps();
          this.displayUpdateRankingDialogLoading = false;
          this.displayUpdateRankingDialog = false;
          Notice.ok('Update inventory ranking');
        } else {
          this.newRankValue = 1;
          Notice.fail('Update inventory ranking');
        }
      } else {
        this.newStockQty = 0;
        Notice.fail(`Update inventory ranking: ${res.message}`);
      }
      this.displayUpdateRankingDialogLoading = false;
    },
    resetFilter() {
      for (let key in this.filter) {
        this.filter[key] = false;
      }
    }
  }
};
</script>
<style>
.supplier-accordion-table .q-table__sort-icon {
  opacity: unset !important;
}
.supplier-accordion-table .eva-swap-outline {
  transform: rotate(90deg) !important;
}
.supplier-accordion-table .w-25vw {
  width: 25vw !important;
}
.supplier-accordion-table .word-wrap {
  white-space: normal !important;
}
.supplier-accordion-table .bg-primary {
  background-color: #04565a !important;
}
/* .supplier-accordion-table th {
  background-color: #04565A !important;
} */
</style>
