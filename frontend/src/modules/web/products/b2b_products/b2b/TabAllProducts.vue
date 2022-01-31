<template>
  <div v-if="!detailProduct" class="bg-white">
    <div class="row q-my-md">
      <new-search-input v-model="filter" label="Search for the product name, code, etc" />
      <q-btn class="btn q-ml-sm q-mr-sm" no-caps unelevated label="Import" @click="inception = true"> </q-btn>
      <q-space />
      <filter-and-sort-data />
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      selection="multiple"
      :selected.sync="selected"
      class="table no-shadow"
      :filter="filter"
      @row-click="listDetail"
    >
      <template v-slot:body-cell-image="props">
        <q-td :props="props">
          <q-img
            basic
            no-default-spinner
            :src="props.row.image ? props.row.image.medium : null"
            placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
            ratio="1"
            style="width: 90px; height: auto"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-halal="props">
        <q-td :props="props">
          <q-img
            class="q-mr-xs"
            src="statics/icons/halal_new.png"
            style="width: 28px; height: 28px"
            v-show="props.row.halal === 1"
          >
            <q-tooltip>Halal</q-tooltip>
          </q-img>
        </q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <div v-if="props.row.active === 1" class="status active bg-grey-2">ACTIVE</div>
          <div v-else class="status bg-grey-2 text-red-8">DISABLED</div>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="inception">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Upload Template</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file color="purple-12" v-model="File" accept=".xls,.xlsx" label="Select File">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:after>
              <q-btn round dense flat class="btn-add q-mr-xs" @click="doImport()">Upload</q-btn>
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

  <div v-else>
    <detail-product :productId="selectedProductId" @back="detailProduct = false" />
  </div>
</template>
<script>
import { Api, dataToCSV, ImportXlxs, Notice } from 'services';
import NewSearchInput from 'web/share/partial/NewSearchInput.vue';
import FilterAndSortData from 'web/share/partial/FilterAndSortData.vue';
import DetailProduct from './ListDetailPage.vue';

export default {
  components: {
    NewSearchInput,
    FilterAndSortData,
    DetailProduct
  },
  data() {
    return {
      credentials: this.$store.state,
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 5
        // rowsNumber: xx if getting data from a server
      },
      selected: [],
      File: null,
      detailProduct: false,
      selectedProductId: null,
      isLoading: false,
      filter: '',
      columns: [
        {
          name: 'image',
          align: 'left',
          label: '',
          field: 'image',
          sortable: false
        },
        {
          name: 'product_name',
          required: true,
          label: 'PRODUCT NAME',
          align: 'left',
          field: 'name',
          sortable: true
        },
        /**
        {
          name: "halal",
          align: "left",
          label: "HALAL",
          field: "halal",
          sortable: true,
          align: "left",
        },
        */
        {
          name: 'category',
          label: 'CATEGORY',
          field: 'main_category',
          sortable: true,
          align: 'left'
        },
        {
          name: 'subcategory',
          label: 'SUB CATEGORY',
          field: 'sub_category',
          sortable: true,
          align: 'left'
        },
        /**
        { name: "qty", label: "QTY AVAILABLE", field: "qty", align: "left" }, */
        { name: 'active', label: '', field: 'active', align: 'center' }
      ],
      data: [],
      inception: false
    };
  },
  created() {
    this.getData();
  },

  computed: {
    pagesNumber() {
      return Math.ceil(this.rows.length / this.pagination.rowsPerPage);
    }
  },

  methods: {
    async getData(...skuIds) {
      if (skuIds.length > 0) {
        const { data } = await Api.get('v_products', `id IN (${skuIds.join(',')})`, null, 'id DESC');
        for (let d of data) {
          const currentDataIdx = this.data.findIndex((v) => v.id === d.id);
          this.$set(this.data, currentDataIdx, d);
        }
      } else {
        if (this.$store.state.tenant_id != null) {
          let tenant_id = this.$store.state.tenant_id;
          const { data } = await Api.get('v_products', `tenant_id = ${tenant_id}`, null, 'id DESC');
          this.data = [...data];
        } else {
          const { data } = await Api.get('v_products', null, null, 'id DESC');
          this.data = [...data];
        }
      }
    },

    listDetail(event, row, index) {
      if (row.id != null) {
        this.detailProduct = true;
        this.selectedProductId = row.id;
      }
    },

    async doImport() {
      await ImportXlxs(
        this.credentials,
        dataToCSV,
        this.File,
        'p_import_skus',
        'product',
        'IMPORT_PRODUCT_RESULT',
        'SKU_CODE,SUPPLIER,BUYER,REMARK',
        ['sku_code', 'supplier', 'buyer', 'remark']
      );
    }
  }
};
</script>
<style scoped>
.table {
  font-weight: 500;
}
.status {
  padding: 0.35rem 1rem;
  border-radius: 1rem;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 500;
}
.status.active {
  color: #131313;
}
.status.disabled {
  color: #e20404;
}
.btn {
  background: #f4f6f8;
  color: #03222f;
  height: 32px;
  text-transform: none;
}
</style>
