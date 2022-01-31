<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Inventory Locations</div>
        </div>
      </div>
      <div class="header-right">
        <div class="row items-center">
          <div>
            <q-btn
              color="primary"
              rounded
              unelevated
              no-caps
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
      :data="data"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-cube-outline"
            size="sm"
            class="cursor-pointer"
            @click="$router.push(`/main/b2b/inventory_locations/${props.row.id}/skus`)"
          />
          <q-tooltip :offset="[10, 10]">See SKUs</q-tooltip>
        </q-td>
      </template>

      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="1"
            :false-value="0"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';

export default {
  components: {
    SearchInput
  },
  data() {
    return {
      credential: this.$store.state,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'no',
          align: 'left',
          label: 'No',
          field: 'no',
          sortable: true
        },
        {
          name: 'name',
          align: 'left',
          label: 'Supplier Name',
          field: 'name',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ],
      data: [],
      downloading: false
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.$q.loading.show({ message: 'Loading...' });

        const res = await Api.get('v_inventory_locations', `tenant_id = ${this.credential.tenant_id}`);
        if (!res.status) {
          throw new Error(res.message);
        }

        this.data = res.data.map((v, i) => {
          return {
            no: i + 1,
            ...v
          };
        });
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    async downloadStockInventories() {
      if (this.downloading) return;

      try {
        this.downloading = true;
        const { status, message, data } = await this.$api.get(
          'v_inventories',
          `active = 1 AND tenant_id = ${this.credential.tenant_id} AND product_type_id = 1 AND quantity > 0`,
          `REPLACE(sku, '"', '') as sku,supplier,quantity,min_qty,par_level,weight,par_level - quantity as replenish_qty`
        );

        if (!status) throw message;

        var csv = '\uFEFF' + 'Stock Location,Qty to Replenish,SKU,OOM Weight\n';
        for (let x of data) {
          let quantity = x.quantity == -1 ? '∞' : x.quantity;
          let min_qty = x.quantity == -1 ? '∞' : x.min_qty;
          let par_level = x.quantity == -1 ? '∞' : x.par_level;
          let replenish_qty = x.quantity == -1 ? '∞' : x.replenish_qty;

          let rowString = `${x.supplier}!${replenish_qty}!${x.sku}!${x.weight} KG\n`;
          csv += rowString.replace(/(,|#)/g, '').replace(/!/g, ',');
        }
        csv +=
          '-------------------------------------------------TreeDots Enterprise---------------------------------------------------';
        csv = 'data:text/csv;charset=utf-8,' + csv;
        var encodedUri = encodeURI(csv);
        var link = document.createElement('a');
        var tenantName = this.credential.tenant;
        link.setAttribute('href', encodedUri);
        link.setAttribute(
          'download',
          `Inventory_Location_${tenantName.replace(' ', '_')}_${this.$dayjs().format('YYYYMMDDHHmmss')}.csv`
        );
        document.body.appendChild(link);
        link.click();
      } catch (error) {
      } finally {
        this.downloading = false;
      }
    }
  }
};
</script>
