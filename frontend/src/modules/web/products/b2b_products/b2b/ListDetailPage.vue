<template>
  <q-page class="bg-white q-pa-md">
    <div class="container">
      <div class="top-head">
        <div class="row justify-start">
          <div>
            <q-btn
              unelevated
              icon="eva-arrow-back"
              size="16px"
              class="btn-back bg-teal-10 q-mr-lg"
              @click="goBack"
            >
              <q-tooltip>Back</q-tooltip>
            </q-btn>
          </div>
          <div class="col">
            <q-tabs
              v-model="tab"
              dense
              align="left"
              class="text-grey"
              active-color="teal-10"
              indicator-color="teal-10"
              style="position: relative; border-bottom: 1px solid #e1e4e6"
            >
              <q-tab
                name="all"
                :label="`All Variants (${data ? data.length : '0'})`"
                class="tab"
                style="padding-bottom: 0.5rem"
              />
            </q-tabs>
          </div>
          <div class="col top-head-right">
            <!-- <div class="new-product-box">
              <q-btn class="btn-new" unelevated to="/main/b2b/products/add_new">
                <q-icon name="eva-plus-outline" size="16px"></q-icon>
                <span class="btn-new-label">Add SKU</span>
              </q-btn>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <!-- Tab Header:Search & Filter -->
    <div class="row">
      <div class="col-12">
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="fade"
          transition-next="fade"
          class="q-mb-md"
          style="padding: 0"
        >
          <q-tab-panel name="all" style="padding: 0.8rem 0">
            <div class="row">
              <new-search-input v-model="filter" label="Search for the product name, code, etc" />
              <q-btn-dropdown
                class="btn q-ml-sm q-mr-sm"
                no-caps
                unelevated
                label="Bulk Action"
                :disable="selected.length === 0"
              >
                <q-list>
                  <q-item clickable @click="onBulkEmptyStock">
                    <q-item-section>
                      <q-item-label>Empty stock</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-space />
              <filter-and-sort-data />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Content Data -->

    <div class="row">
      <div v-if="!fetchingProduct && !errorFetchingProduct && productData" class="col-12">
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="fade"
          transition-next="fade"
          style="background: #ffffff"
        >
          <q-tab-panel name="all" style="background: #fff; padding: 0">
            <div class="product-list q-mb-md">
              <div class="name">
                <div class="p-image row justify-center">
                  <div class="iimage">
                    <q-img
                      :src="productData.image ? productData.image.medium : null"
                      basic
                      no-default-spinner
                      placeholder-src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
                      ratio="1"
                      style="width: 64px; height: auto"
                    />
                  </div>
                  <div class="iname column justify-center">
                    <div class="ilabel">Product Name</div>
                    <div class="ivalue">{{ productData.name }}</div>
                  </div>
                </div>
              </div>
              <div class="halal column justify-center">
                <div class="ilabel">Halal</div>
                <div v-if="productData.halal === 1" class="ivalue">Halal</div>
                <div v-else class="ivalue">Non Halal</div>
              </div>
              <div class="category column justify-center">
                <div class="ilabel">Category</div>
                <div class="ivalue">{{ productData.main_category }}</div>
              </div>
              <div class="subcategory column justify-center">
                <div class="ilabel">Subcategory</div>
                <div class="ivalue">{{ productData.sub_category }}</div>
              </div>
              <div class="variants column justify-center">
                <div class="ilabel">Variants</div>
                <div class="ivalue">{{ data ? data.length : '0' }}</div>
              </div>
              <div class="qty column justify-center">
                <div class="ilabel">Total QTY</div>
                <div class="ivalue">
                  {{ productData.qty ? productData.qty : '-' }}
                </div>
              </div>
              <div class="actions column justify-center">
                <div class="q-gutter-sm" style="display: inherit !important">
                  <div v-if="productData.active === 1" class="status active bg-grey-2">ACTIVE</div>
                  <div v-else class="status bg-grey-2 text-red-8">DISABLED</div>
                  <q-btn
                    unelevated
                    align="around"
                    icon="eva-edit"
                    size="sm"
                    class="btn-edit"
                    style="background: #f4f6f8; color: #353535"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <q-table
                  selection="multiple"
                  :selected.sync="selected"
                  :data="data"
                  :columns="columns"
                  :filter="filter"
                  row-key="sku_id"
                  class="no-shadow product-list-table"
                >
                  <template v-slot:body-cell-channel="props">
                    <q-td :props="props">
                      <div v-if="props.row.b2c === 1">B2C</div>
                      <div v-else>B2B</div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        unelevated
                        align="around"
                        icon="eva-more-vertical"
                        size="sm"
                        class="btn-edit"
                        style="background: #f4f6f8; color: #353535"
                      >
                        <q-tooltip>More</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="available" style="background: #f4f6f8; padding: 0">
            <p>product detail</p>
          </q-tab-panel>
          <q-tab-panel name="outofstock" style="background: #f4f6f8; padding: 0">
            <p>images</p>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>
<script>
import NewSearchInput from 'web/share/partial/NewSearchInput.vue';
import FilterAndSortData from 'web/share/partial/FilterAndSortData.vue';
import { Api, Notice } from 'services';
import ConfirmMessage from 'web/share/partial/ConfirmMessage';
export default {
  components: {
    NewSearchInput,
    FilterAndSortData
  },
  data() {
    return {
      credentials: this.$store.state,
      selected: [],
      tab: 'all',
      filter: '',
      fetchingProduct: true,
      errorFetchingProduct: false,
      productData: null,
      fetchingData: true,
      errorFetchingData: false,
      columns: [
        {
          name: 'sku',
          label: 'SKU',
          field: 'sku_id',
          align: 'center',
          sortable: true
        },
        {
          name: 'name',
          label: 'Display Name',
          field: 'sku',
          align: 'left',
          sortable: true
        },
        {
          name: 'channel',
          label: 'Channel',
          field: 'b2c',
          align: 'center',
          sortable: true
        },
        {
          name: 'oom',
          label: 'OOM',
          field: 'oom',
          align: 'center',
          sortable: true
        },
        {
          name: 'uom',
          label: 'UOM',
          field: 'uom',
          align: 'center',
          sortable: true
        },
        {
          name: 'weight',
          label: 'Weight',
          field: 'weight',
          align: 'center',
          sortable: true
        },
        /**
        {
          name: "min_unit",
          label: "Min. Unit",
          field: "min_unit",
          align: "left",
          sortable: true,
        },
        */
        {
          name: 'prices',
          label: 'Prices',
          field: 'price',
          align: 'center',
          sortable: true
        },
        {
          name: 'incremental_qty',
          label: 'Increment Qty',
          field: 'increment_qty',
          align: 'center',
          sortable: true
        },
        {
          name: 'available',
          label: 'Available Qty',
          field: 'quantity',
          align: 'center',
          sortable: true
        },
        /**
        {
          name: "onhold",
          label: "On Hold",
          field: "onhold",
          align: "left",
          sortable: true,
        },
        */
        {
          name: 'actions',
          label: '',
          field: 'actions',
          align: 'right',
          sortable: true
        }
      ],
      data: [],
      listSKU: null
    };
  },
  props: {
    productId: {
      required: true
    }
  },
  created() {
    this.getProductDetail();
  },
  methods: {
    async getProductDetail() {
      this.fetchingProduct = true;
      this.errorFetchingProduct = false;

      const response = await this.$api.get('v_products', `id = ${this.productId}`);
      this.fetchingProduct = false;
      if (response && response.status && response.data.length > 0) {
        this.productData = response.data[0];
        await this.getData();
      } else {
        this.showDialog('Failed', response.message);

        this.errorFetchingProduct = true;
      }
    },
    async getData() {
      this.fetchingData = true;
      this.errorFetchingData = false;

      const response = await this.$api.get('v_skus', `product_id = ${this.productId}`);
      this.fetchingData = false;
      if (response && response.status) {
        const dataToParse = response.data;
        // this.data = response.data;
        this.listSKU = dataToParse.map(({ id }) => id);
        await this.getInventoryData();
      } else {
        this.showDialog('Failed', response.message);

        this.errorFetchingData = true;
      }
    },
    async getInventoryData() {
      this.fetchingData = true;
      this.errorFetchingData = false;
      let i;
      for (i = 0; i < this.listSKU.length; i++) {
        let response = await Api.get(
          'v_inventories',
          `active = 1 and sku_id = ${this.listSKU[i]}`,
          'id, sku, b2c, oom, uom, weight, price, increment_qty, quantity, customer_id, sku_id',
          'supplier asc'
        );
        if (response && response.status) {
          this.data = [...response.data];
        } else {
          this.showDialog('Failed', response.message);
          this.errorFetchingData = true;
          return;
        }
      }
      this.fetchingData = false;
    },
    showConfirmDialog(title, message, onOk = null, onCancel = null) {
      this.$q
        .dialog({
          title: title,
          message: message,
          component: ConfirmMessage
        })
        .onOk(onOk ? onOk : () => {})
        .onCancel(onCancel ? onCancel : () => {});
    },
    onBulkEmptyStock() {
      this.showConfirmDialog(
        'Confirmation',
        'Are you sure want to set these sku as out of stock?',
        this.bulkEmptyStock
      );
    },
    async bulkEmptyStock() {
      const ids = this.selected.map((v) => v.sku_id);
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const inventories = await Api.exec('p_sku_bulk_set_out_of_stock', [JSON.stringify(ids)]).then(
          (res) => {
            if (!res.status) throw new Error(res.message);
            return res.data;
          }
        );
        this.selected = [];
        await this.getData(ids);
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },
    goBack() {
      this.$emit('back');
    }
  }
};
</script>
<style>
.product-list-table .q-table__sort-icon {
  opacity: unset !important;
}
</style>
<style scoped>
.status {
  padding: 0.35rem 1rem;
  border-radius: 1rem;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 500;
}
.product-list {
  display: flex;
}
.product-list .name .image {
  position: absolute;
  width: 64px;
}
.product-list .ilabel {
  font-weight: 500;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #999999;
}
.product-list .ivalue {
  font-weight: 500;
  font-size: 0.8rem;
  color: #131313;
}
.product-list .name {
  position: relative;
  display: flex;
  flex: auto;
  padding: 0 0.35rem;
}
.product-list .name .p-image .iimage {
  position: absolute;
  width: 64px;
  min-height: 70px;
  top: 0;
  left: 0;
}
.product-list .name .p-image .iname {
  margin-left: 70px;
  min-height: 70px;
}
.product-list .name,
.product-list .halal,
.product-list .category,
.product-list .subcategory,
.product-list .variants,
.product-list .qty,
.product-list .actions {
  padding: 0 0.5rem;
}
@media (min-width: 1024px) {
  .product-list .name {
    width: 250px;
    position: relative;
  }
  .product-list .halal {
    width: 90px;
  }
  .product-list .category {
    width: 100px;
  }
  .product-list .subcategory {
    width: 100px;
  }
  .product-list .variants {
    width: 90px;
  }
  .product-list .qty {
    width: 90px;
  }
  .product-list .actions {
    position: relative;
    display: flex;
  }
}
.product-list .istatus .status {
  background: #f4f6f8;
  padding: 0.135rem 1.5rem;
  border-radius: 1rem;
  text-align: center;
}
.top-head {
  background: #ffffff;
  position: relative;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  z-index: 2;
  padding: 0.35rem 0;
}
.top-head-right {
  max-width: 170px;
  text-align: right;
  border-bottom: 1px solid #e1e4e6;
}
.content {
  z-index: 2;
}
.tab {
  text-transform: none !important;
}
.btn-edit {
  max-width: 32px;
  align-items: center;
}
.btn-back {
  max-width: 34px;
  height: 34px;
  color: #ffffff;
  text-transform: none;
  font-size: 0.72rem !important;
}
.btn-new {
  background: #f29727;
  color: #ffffff;
  text-transform: none;
  font-size: 0.825rem !important;
}
.oos-badge {
  right: -25px;
  top: 0.4rem;
}
@media (max-width: 991px) {
  .top-head-right {
    max-width: 55px !important;
  }
  .btn-new-label {
    display: none;
  }
}
@media (max-width: 768px) {
  .product-list {
    display: block;
  }
  .product-list .name {
    display: block;
    width: 100%;
  }
  .product-list .name .ilabel,
  .product-list .name .ivalue {
    display: block;
    width: 100%;
  }
  .product-list .ilabel {
    display: inline-block;
    width: 25%;
  }
  .product-list .ivalue {
    display: inline-block;
    width: 58%;
  }
  .product-list .btn-edit {
    display: block;
    width: 24px;
  }
}
</style>
