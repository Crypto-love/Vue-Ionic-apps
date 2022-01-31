<template>
  <q-card class="product-form main-card" style="overflow: hidden; height: 480px; max-height: 100%">
    <div class="card-top-header column">
      <search-input v-model="filter" label="Search By Name" class="search col" />
      <div v-if="isPoolingItem" class="text-caption text-weight-medium col q-mt-md">
        * For pooling item, only one item is allowed
      </div>
    </div>

    <q-card-section class="card-body q-px-md">
      <q-scroll-area :style="{ height: `100%` }" class="q-pr-sm">
        <q-table
          :data="data"
          :columns="columns"
          card-class="no-shadow"
          row-key="id"
          :selection="isPoolingItem ? 'single' : 'multiple'"
          :selected.sync="selected"
          :filter="filter"
          :visible-columns="['name', 'price_item']"
          ref="table"
          class="tdots-table"
          :loading="isLoading"
        >
          <template v-slot:body-cell-name="props">
            <q-td key="name" :props="props">
              <div v-if="props.row.quantity === 0">
                <span class="text-red">{{ props.row.sku }} (OUT OF STOCK)</span>
              </div>
              <div v-else>{{ props.row.sku }}</div>
            </q-td>
          </template>
        </q-table>
      </q-scroll-area>
    </q-card-section>

    <q-card-actions class="absolute-bottom card-footer" align="right">
      <q-btn flat no-caps label="Cancel" class="btn-cancel" v-close-popup />
      <q-btn flat label="Save" class="btn-save" @click="save" />
    </q-card-actions>
  </q-card>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import { getB2cSkus } from 'treeGQL';

export default {
  components: {
    SearchInput
  },
  props: {
    customerId: {
      required: true
    },
    tenantId: {
      required: true
    },
    item: {
      required: true
    },
    sample: {
      default: null
    },
    isPoolingItem: {
      default: false
    }
  },
  data() {
    return {
      filter: null,
      selected: [],
      data: [],
      isLoading: false,
      columns: [
        {
          name: 'id'
        },
        {
          name: 'name',
          label: 'Name',
          align: 'left',
          field: 'sku',
          sortable: true
        },
        {
          name: 'price_item',
          label: 'Price',
          align: 'left',
          field: 'price',
          sortable: true
        },
        {
          name: 'sku_id',
          label: 'Sku id',
          align: 'left',
          field: 'sku_id',
          sortable: true
        }
      ]
    };
  },
  computed: {
    isThereAnyOutOfStock() {
      const filtered = this.selected.filter((v) => v.quantity === 0);

      return filtered.length > 0;
    },
    isAdmin() {
      return this.$store.state.user_type_id == 1
        ? true
        : this.$store.state.user_type_id == 2
        ? true
        : this.$store.state.user_type_id == 4
        ? true
        : false;
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    }
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        const response = await this.$apollo
          .query({
            query: getB2cSkus,
            variables: {
              tenantId: this.$store.state.tenant_id,
              isPooling: this.isPoolingItem
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        const data = response?.data?.getB2cSkus || [];
        let products = [];
        data.forEach((x) => {
          if (x.inventories.length)
            products.push({
              id: x.inventories[0].id,
              name: x.product.name,
              sku: x.b2c_packaging ? x.name.replace(/(\(.*?\))/gi, x.b2c_packaging) : x.name,
              price: (x.b2c_unit_price * x.b2c_unit_per_oom).toFixed(6),
              tax_rate: x.tax_rate || x.product.tenant.tax_rate,
              sku_id: x.id,
              pooling: x.is_b2c_pooling,
              pooling_qty: x.b2c_pooling_qty
            });
        });
        this.data = [...new Set(products)];
      } catch (error) {
        this.$notice.fail(error?.message || 'An error occurred!');
      } finally {
        this.isLoading = false;
      }
    },
    save() {
      if (this.isThereAnyOutOfStock) {
        return this.$notice.fail('You cannot add out of stock item to cart');
      }
      const payload = this.selected.map((v) => ({
        ...v,
        quantity: 1,
        sample: this.sample,
        order_item_status_id: v.pooling == 1 ? -2 : -1,
        item_status: v.pooling == 1 ? 'Processing in Hub' : 'Processed in Hub',
        order_qty: 1
      }));
      this.$emit('save', payload);
    }
  }
};
</script>
<style scoped>
/* Card ------------- */
.main-card {
  position: relative;
}
.main-card .card-top-header {
  position: sticky;
  display: flex;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 15px;
}
.main-card .card-top-header .btn {
  width: 30%;
}
.main-card .card-top-header .search {
  width: 100%;
  border: 1px transparent;
  margin-right: 10px;
}
.card-body {
  height: calc(100% - 90px);
}
.card-footer {
  border-top: 1px solid #fefefe;
  background: #ffffff;
  padding: 0.5rem 1rem 0.8rem 1rem;
}

/* ./Card ------------- */
.product-form {
  width: 720px;
  border-radius: 20px;
}
.form-group {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.card-action {
  display: block;
  width: 100%;
  position: relative;
  text-align: right;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 0.5rem;
}
.btn-save {
  color: #ffffff;
  background: #04565a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-cancel {
  color: #666666;
  background: #e4e4e4;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.q-field--with-bottom {
  padding-bottom: 15px;
}
</style>
