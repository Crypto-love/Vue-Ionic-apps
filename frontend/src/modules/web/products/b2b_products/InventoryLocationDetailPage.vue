<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header row items-center">
          <q-btn
            class="q-mr-md"
            unelevated
            round
            size="12px"
            icon="eva-arrow-back-outline"
            color="primary"
            @click="$router.push('/main/b2b/inventory_locations')"
          />
          <div class="text-title text-h6">Skus of {{ supplierName }}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="row top-row items-center" style="height: 36px">
          <div class="q-gutter-xs btn-section"></div>

          <div class="q-gutter-xs search-section">
            <search-input v-model="filter" label="Search" />
          </div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="sku"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
      @request="getData"
    >
      <template v-slot:body-cell-quantity="props">
        <q-td :props="props">
          <span v-if="props.row.available === -1">&#8734;</span>
          <span v-else>
            {{ parseInt(props.row.available) + parseInt(props.row.onhold_qty) }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-available="props">
        <q-td :props="props">
          <span v-if="props.row.available === -1">&#8734;</span>
          <span v-else>
            {{ props.row.available }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-update_stock="props">
        <q-td :props="props">
          <div>
            <q-btn
              class="bg-primary text-white"
              size="sm"
              dense
              round
              unelevated
              align="center"
              icon="la la-boxes"
              :disable="props.row.quantity === -1"
              @click="
                displayUpdateStockDialog = true;
                selectedSku = props.row.id;
                selectedSkuId = props.row.sku_id;
                newStockQty = parseInt(props.row.quantity || 0);
                newParLevel = parseInt(props.row.par_level || 0);
                newMinQty = parseInt(props.row.min_qty || 0);
              "
            >
              <q-tooltip> Update Stock </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="displayUpdateStockDialog" persistent>
      <q-card style="min-width: 35vw">
        <q-card-section>
          <div class="text-h6">Update Stock</div>
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
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import QtyField from 'web/share/partial/QtyField.vue';

export default {
  components: {
    SearchInput,
    QtyField
  },
  data() {
    return {
      credential: this.$store.state,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      pagination: {
        sortBy: 'sku_id',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 10
      },
      supplierName: null,
      displayUpdateStockDialog: false,
      displayUpdateStockDialogLoading: false,
      newStockQty: 0,
      newParLevel: 0,
      newMinQty: 0,
      selectedSku: null,
      selectedSkuId: null,
      columns: [
        {
          name: 'no',
          align: 'left',
          label: 'No',
          field: 'no',
          sortable: true
        },
        {
          name: 'sku',
          align: 'left',
          label: 'SKU Name',
          field: (row) => row.sku,
          sortable: true
        },
        {
          name: 'weight',
          align: 'left',
          label: 'Unit Weight',
          field: 'weight',
          sortable: true,
          format: (val, row) => `${val} KG`
        },
        {
          name: 'quantity',
          align: 'left',
          label: 'Stock',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'available',
          align: 'left',
          label: 'Available',
          field: 'available',
          sortable: true
        },
        {
          name: 'onhold_qty',
          align: 'left',
          label: 'On Hold',
          field: 'onhold_qty',
          sortable: false
        },
        {
          name: 'par_level',
          align: 'left',
          label: 'Par',
          field: 'par_level',
          sortable: true
        },
        {
          name: 'min_qty',
          align: 'left',
          label: 'Min Qty',
          field: 'min_qty',
          sortable: true
        },
        {
          name: 'replenish_qty',
          align: 'left',
          label: 'Qty to Replenish',
          field: 'replenish_qty',
          sortable: true
        },
        {
          name: 'update_stock',
          align: 'center',
          label: 'Update Stock',
          field: 'update_stock'
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getSupplier().then((name) => (this.supplierName = name));
    this.getData({
      pagination: this.pagination,
      filter: undefined
    });
  },
  methods: {
    async getData({ filter, pagination }) {
      const { page, rowsPerPage, sortBy, descending } = pagination;

      try {
        this.$q.loading.show({ message: 'Loading...' });

        const sortColumn = sortBy === 'no' ? 'sku_id' : sortBy;
        const sortOrder = descending ? 'DESC' : 'ASC';
        let orderBy = sortBy ? `${sortColumn} ${sortOrder}` : null;

        this.pagination.rowsNumber = await this.getTotalSkus(filter);

        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;

        this.data = await this.getSkus(rowsPerPage, (page - 1) * rowsPerPage, filter, orderBy);

        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    async getTotalSkus(filter = null) {
      let where = `customer_id = ${this.$route.params.supplierId}`;

      if (filter) {
        where += ` AND LOWER(sku) LIKE '%${filter.toLowerCase()}%'`;
      }

      const res = await Api.get('v_inventories', where, `COUNT(0) AS count`);

      if (!res.status) throw new Error(res.message);
      return res.data[0].count;
    },

    async getSkus(limit, offset, filter = null, orderBy = null) {
      let where = `customer_id = ${this.$route.params.supplierId}`;

      if (filter) {
        where += ` AND LOWER(sku) LIKE '%${filter.toLowerCase()}%'`;
      }

      const res = await Api.get(
        'v_inventories',
        where,
        `id,sku_id, customer_id, REPLACE(sku, '"', '') as sku, weight, supplier, quantity AS available, min_qty, par_level, par_level - quantity as replenish_qty`,
        orderBy,
        limit,
        offset
      );
      if (!res.status) {
        throw new Error(res.message);
      }

      const promises = res.data.map(async (v, i) => {
        const res = await Api.get(
          'order_items',
          `order_item_status_id = 1 and active = 1 and sku_id = ${v.sku_id} and customer_seller_id = ${v.customer_id}`,
          'sum(total_qty) as onhold_qty'
        );

        if (!res.status) {
          throw new Error(res.message);
        }

        return {
          no: i + 1 + offset,
          ...v,
          onhold_qty: res.data[0].onhold_qty || 0
        };
      });

      return Promise.all(promises);
    },

    async getSupplier() {
      const res = await Api.get('customers', `id = ${this.$route.params.supplierId}`, 'name');
      if (!res.status) throw new Error(res.message);
      return res.data[0].name;
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
        this.selectedSku
      );
      if (res.status) {
        await this.getData();
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
    }
  }
};
</script>
