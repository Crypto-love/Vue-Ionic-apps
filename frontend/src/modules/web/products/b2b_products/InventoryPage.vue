<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Inventories</div>
          <div class="text-caption d-none"></div>
        </div>
      </div>
      <div class="header-right">
        <div class="row items-center">
          <q-btn-dropdown
            unelevated
            rounded
            icon="eva-funnel-outline"
            class="bg-primary text-white q-px-sm q-my-sm q-mx-md"
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
                    v-model="needReplenish"
                    class="checkbox"
                    label="Quantity to Replenish > 0"
                    color="primary"
                    @input="onRequest({ pagination: pagination, filter: filter })"
                  />
                </div>
              </div>
            </div>
          </q-btn-dropdown>
          <div>
            <q-btn
              color="primary"
              rounded
              unelevated
              no-caps
              class="q-px-sm"
              icon="eva-cloud-download-outline"
              label="Download"
              :loading="downloading"
              @click="downloadStockInventories"
            />
          </div>
          <search-input v-model="filter" label="Search" class="q-ml-md" />
        </div>
      </div>
    </div>
    <q-table
      :columns="columns"
      row-key="id"
      :filter="filter"
      :filter-method="search"
      :pagination.sync="pagination"
      :loading="isLoading"
      :data="data"
      class="tdots-table"
      :rows-per-page-options="[50, 100, 200, 300, 0]"
      @request="onRequest"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" auto-width>
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width key="sku" :props="props">{{ props.row.name }}</q-td>
          <q-td>{{ props.row.tot > 0 ? props.row.tot : null }}</q-td>
          <q-td auto-width class="text-center" key="actions">
            <q-btn
              :ref="`expandBtn${props.row.id}`"
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'eva-chevron-up-outline' : 'eva-chevron-down-outline'"
            >
              <q-tooltip>Supplier/Inventory</q-tooltip>
            </q-btn>
            <q-btn
              class="q-ml-sm"
              size="sm"
              color="primary"
              round
              dense
              icon="eva-archive-outline"
              @click="onShowStockDialog(props.row)"
            >
              <q-tooltip>Tag to supplier</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="3" class="no-padding">
            <template>
              <SupplierAccordionForSKU :idSKU="props.row.id" />
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="showStockDialog">
      <stock-dialog :item="selectedItem" @on-close="onCloseStockDialog" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import SupplierAccordionForSKU from './inventory/SupplierAccordionForSKU';
import PersonCard from 'web/share/partial/PersonCard.vue';
import MyForm from './inventory/Form.vue';

export default {
  components: {
    SupplierAccordionForSKU,
    SearchInput,
    PersonCard,
    MyForm,
    TableTopRight,
    StockDialog: () => import('./products/StockDialog.vue')
  },
  data() {
    return {
      credential: this.$store.state,
      filter: null,
      selected: [],
      showStockDialog: false,
      selectedItem: null,
      isOnlyOutOfStock: false,
      isLoading: false,
      rapl: 0,
      pagination: {
        rowsPerPage: 10,
        page: 1,
        rowsNumber: 0
      },
      columns: [
        {
          name: 'sku',
          align: 'left',
          label: 'SKU',
          field: (row) => row.name,
          required: true,
          sortable: true
        },
        {
          name: 'tot',
          align: 'left',
          label: 'Replenish',
          sortable: false
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          sortable: false
        }
      ],
      data: [],
      filteredData: [],
      downloading: false,
      needReplenish: false
    };
  },
  created() {
    this.onRequest({
      pagination: this.pagination,
      filter: this.filter
    });
  },
  methods: {
    async getTotalData(filter = null) {
      const tenantID = this.credential.tenant_id;
      let where = `tenant_id=${tenantID} and active = 1 and quantity != -1 `;

      if (filter) {
        const keyFilter = filter.toLowerCase();
        where += ` AND LOWER(product_name) LIKE LOWER('%${keyFilter}%')`;
      }

      where += ' GROUP BY id ';

      if (this.needReplenish) where += ' HAVING tot > 0 ';

      const res = await Api.get(
        `(select id, sum(total) as tot from v_sku_inventories where ${where}) as skus`,
        null,
        'COUNT(id) as total_data',
        'id asc'
      );
      if (!res.status) throw new Error(res.message);
      return res.data[0].total_data;
    },
    async getSkus(limit, offset, filter = null) {
      const tenantID = this.credential.tenant_id;
      let where = `tenant_id=${tenantID} and active = 1 and quantity != -1 `;

      if (filter) {
        const keyFilter = filter.toLowerCase();
        where += ` AND LOWER(product_name) LIKE LOWER('%${keyFilter}%')`;
      }
      where += ' GROUP BY id ';

      if (this.needReplenish) where += ' HAVING tot > 0 ';

      const res = await Api.get(
        'v_sku_inventories',
        where,
        'id, product_id, product_name as name, sum(total) as tot',
        'name asc',
        limit,
        offset
      );
      if (!res.status) throw new Error(res.message);
      return res.data;
    },
    async onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;

      this.isLoading = true;
      this.$q.loading.show({ message: 'Please wait...' });

      try {
        // Get Total Data
        this.pagination.rowsNumber = await this.getTotalData(filter);

        const limit = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;
        const offset = (page - 1) * rowsPerPage;

        const skus = await this.getSkus(limit, offset, filter);
        this.data = skus;
        // await this.getReplenish(skus);
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
        this.$q.loading.hide();
      }
    },

    search(rows, terms, cols) {
      return this.data.filter((x) => {
        return this.getValuesOfNestedObject(x)
          .filter((value) => value != 'NULL' && value)
          .join(' ')
          .toLowerCase()
          .includes(terms.toLowerCase());
      });
    },
    getValuesOfNestedObject(data) {
      return data && typeof data === 'object'
        ? Object.values(data).map(this.getValuesOfNestedObject).flat()
        : [data];
    },

    onShowStockDialog({ id }) {
      this.selectedItem = {
        id: undefined,
        customer_id: undefined,
        sku_id: id,
        product_type_id: undefined,
        unit_price: undefined,
        price: undefined,
        quantity: undefined,
        expired_at: undefined,
        logistic_type: undefined
      };
      this.showStockDialog = true;
    },
    showDeleteConfirm(data, isRestore = false) {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: isRestore ? 'Restore Confirmation' : 'Delete Confirmation',
          message: 'Are you sure?'
        })
        .onOk(() => {
          const active = isRestore ? 1 : 0;
          this.exec({ id: data.id, active }, true);
        });
    },
    async onCloseStockDialog(skuId) {
      /** If it's stoopid, but it works. Then it's not stoopid. ~Albert Ensten */
      this.$refs[`expandBtn${this.selectedItem.sku_id}`].click();
      await this.$nextTick();
      this.$refs[`expandBtn${this.selectedItem.sku_id}`].click();

      this.showStockDialog = false;
    },
    toggleOutOfStock(show) {
      this.isOnlyOutOfStock = show;
      if (show) {
        this.filteredData = this.data.filter((v) => v.quantity === 0);
      } else {
        this.filteredData = [...this.data];
      }
    },
    async sendNotification(newData) {
      // This will send notification to Sales Person and Buyer
      // 1. Get inventory id
      const { status, data } = await this.$api.get(
        'inventories',
        `sku_id = ${newData.sku_id} AND product_type_id = ${newData.product_type_id} AND customer_id = ${newData.customer_id}`,
        'id'
      );

      // 2. Send notification
      if (status && data.length > 0 && data[0].id) {
        this.$api.add('app_notification', {
          table_id: data[0].id,
          user_id: this.$store.state.id,
          app_mode: this.$firebase.appMode(),
          notification_type: 'new_inventory'
        });
      }
    },
    async downloadStockInventories() {
      if (this.downloading) return;

      try {
        this.downloading = true;
        const { status, message, data } = await this.$api.get(
          'v_inventories',
          `active = 1 AND tenant_id = ${this.credential.tenant_id}`,
          `REPLACE(sku, '"', '') as sku,supplier,quantity,min_qty,par_level,product_type,weight,par_level - quantity as replenish_qty`,
          'sku'
        );

        if (!status) throw message;

        var csv =
          '\uFEFF' +
          'SKU,Stock Location,Product Type,OOM Weight,Available Stock,Min Stock,Par Level,Qty to Replenish\n';
        for (let x of data) {
          let quantity = x.quantity == -1 ? '∞' : x.quantity;
          let min_qty = x.quantity == -1 ? '∞' : x.min_qty;
          let par_level = x.quantity == -1 ? '∞' : x.par_level;
          let replenish_qty = x.quantity == -1 ? '∞' : x.replenish_qty;

          let rowString = `${x.sku}!${x.supplier}!${x.product_type}!${x.weight} KG!${quantity}!${min_qty}!${par_level}!${replenish_qty}\n`;
          csv += rowString.replace(/(,|#)/g, '').replace(/!/g, ',');
        }
        csv += '--------------------------------------------------------------------------';
        csv = 'data:text/csv;charset=utf-8,' + csv;
        var encodedUri = encodeURI(csv);
        var link = document.createElement('a');
        var tenantName = this.credential.tenant;
        link.setAttribute('href', encodedUri);
        link.setAttribute(
          'download',
          `Inventory_${tenantName.replace(' ', '_')}_${this.$dayjs().format('YYYYMMDDHHmmss')}.csv`
        );
        document.body.appendChild(link);
        link.click();
      } catch (error) {
      } finally {
        this.downloading = false;
      }
    },

    resetFilter() {
      this.needReplenish = false;
    }
  }
};
</script>

<style scoped>
/* .q-table--no-wrap tr {
  white-space: normal;
  vertical-align: top;
} */
.vertical-align-top {
  vertical-align: top;
}
.nowrap {
  white-space: normal !important;
}
</style>
