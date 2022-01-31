<template>
  <q-card class="product-form main-card" style="overflow: hidden; height: 450px; max-height: 100%">
    <div class="card-top-header" style="display: flex">
      <q-btn class="btn" unelevated rounded color="primary" label="Tag new inventory" no-caps />
      <q-space />
      <search-input v-model="filter" label="Search By Name" class="search" data-cy="search-product" />
    </div>

    <q-card-section class="card-body q-px-md">
      <q-scroll-area :style="{ height: `100%` }" class="q-pr-sm">
        <q-table
          :data="data"
          :columns="columns"
          card-class="no-shadow"
          row-key="id"
          selection="multiple"
          :selected.sync="selected"
          :filter="filter"
          :visible-columns="['name', 'price']"
          ref="table"
          class="tdots-table"
          :loading="isLoading"
          data-cy="product-table"
        >
          <template v-slot:body-cell-name="props">
            <q-td key="name" :props="props">
              <div v-if="props.row.quantity === 0">
                <span class="text-red">{{ props.row.sku }} (OUT OF STOCK)</span>
              </div>
              <div v-else>
                {{ props.row.sku }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-price="props">
            <q-td key="price" :props="props">
              {{ $helper.display4DpPrice(props.row.price) }}
              <q-popup-edit v-model="props.row.price">
                <q-input
                  v-model="props.row.price"
                  mask="#.####"
                  reverse-fill-mask
                  dense
                  autofocus
                  counter
                  @change="updatePrice(props.row)"
                />
              </q-popup-edit>
            </q-td>
          </template>
        </q-table>
      </q-scroll-area>
    </q-card-section>

    <q-card-actions class="absolute-bottom card-footer" align="right">
      <q-btn flat no-caps label="Cancel" class="btn-cancel" v-close-popup />
      <q-btn flat label="Save" class="btn-save" @click="save" data-cy="product-save-btn" />
    </q-card-actions>
  </q-card>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import { Api, Notice } from 'services';
export default {
  components: {
    SearchInput
  },
  props: {
    customerId: {
      required: true
    },
    item: {
      required: true
    },
    sample: {
      default: null
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
          name: 'price',
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
    }
  },
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        const res = await Api.exec(
          'p_get_sku_by_tenant_id',
          [this.$store.state.tenant_id, this.sample ? 2 : 1, this.customerId],
          'read'
        );

        this.data = res.data;
      } catch (error) {
      } finally {
        this.isLoading = false;
      }
    },
    save() {
      if (this.isThereAnyOutOfStock) {
        return Notice.fail('You cannot add out of stock item to cart');
      }
      const payload = this.selected.map((v) => ({
        ...v,
        quantity: 1,
        total_weight: v.weight, // v.weight * 1
        sample: this.sample,
        catch_weight: undefined,
        active: 1
      }));
      this.$emit('save', payload);
    },
    async updatePrice(data) {
      const response = await Api.exec('p_price_add', [
        data.sku_id,
        this.customerId,
        data.price,
        this.$store.state.id
      ]);
      const resData = response.data;
      if (response.status && resData && resData.length >= 0 && resData[0].id) {
        this.$api.add('app_notification', {
          target_only: true,
          user_id: this.$store.state.id,
          app_mode: this.$firebase.appMode(),
          notification_type: 'update_price',
          customer_id: this.customerId,
          sku: data.sku,
          user_full_name: `${this.$store.state.first_name} ${this.$store.state.last_name}`
        });
      }
      this.getData();
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
  width: 65%;
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
