<template>
  <form-dialog title="Tier Pricing" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="SyncOrderForm">
      <div class="q-gutter-xs row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-5" style="padding: 10px">
              <!-- <div class="label" style="font-weight:600;">B2C Order</div> -->
              <q-table
                card-class="no-shadow"
                :data="data"
                :columns="columns"
                title="All Products"
                class="tdots-table"
                hide-bottom
                :pagination.sync="pagination"
                :rows-per-page-options="[0]"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width />
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn
                        size="sm"
                        color="accent"
                        round
                        dense
                        @click="props.expand = !props.expand"
                        :icon="props.expand ? 'remove' : 'add'"
                      />
                    </q-td>
                    <q-td :props="props" class="primary_text" key="id" width="50px">#{{ props.row.id }}</q-td>

                    <q-td class="primary_text" key="product" :props="props" width="400px">
                      {{ props.row.product }}
                    </q-td>
                    <q-td class="primary_text" key="total_qty" :props="props">{{ props.row.total_qty }}</q-td>
                    <q-td class="primary_text" key="total_price" :props="props"
                      >{{ credentials.currency_symbol }}{{ props.row.original_total_price }}</q-td
                    >
                    <q-td class="primary_text" key="tax" :props="props"
                      >{{ credentials.currency_symbol }}{{ props.row.original_tax }}</q-td
                    >
                  </q-tr>
                  <q-tr v-show="props.expand" :props="props" v-for="item in props.row.items" :key="item.id">
                    <q-td class="sub_text"></q-td>
                    <q-td auto-width class="sub_text text-center">{{ item.id }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.product }}</q-td>
                    <q-td class="sub_text">{{ item.total_qty }}</q-td>
                    <q-td auto-width class="sub_text"
                      >{{ credentials.currency_symbol }}{{ item.original_total_price }}</q-td
                    >
                    <q-td auto-width class="sub_text"
                      >{{ credentials.currency_symbol }}{{ item.original_tax }}</q-td
                    >
                  </q-tr>
                </template>
              </q-table>
            </div>
            <div class="col-md-7" style="padding: 10px">
              <q-table
                card-class="no-shadow"
                :data="dataTierPricing"
                :columns="columnsTierPricing"
                title="Tier Pricing"
                class="tdots-table"
                hide-bottom
                :pagination.sync="pagination"
                :rows-per-page-options="[0]"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th auto-width />
                    <q-th v-for="col in props.cols" :key="col.name" :props="props">
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td auto-width>
                      <q-btn
                        size="sm"
                        color="accent"
                        round
                        dense
                        @click="props.expand = !props.expand"
                        :icon="props.expand ? 'remove' : 'add'"
                      />
                    </q-td>
                    <q-td :props="props" key="sku_id" class="primary_text" width="50px">{{
                      props.row.sku_id
                    }}</q-td>

                    <q-td :props="props" key="product" class="primary_text" width="400px">{{
                      props.row.product
                    }}</q-td>
                    <q-td :props="props" key="tier_qty" class="primary_text" width="300px">{{
                      props.row.tier_qty
                    }}</q-td>
                    <q-td :props="props" key="discount" class="primary_text" width="100px"
                      >{{ props.row.discount }}%</q-td
                    >
                    <q-td :props="props" key="total_qty" class="primary_text" width="100px">{{
                      props.row.total_qty
                    }}</q-td>
                    <q-td :props="props" key="tax_rate" class="primary_text" width="100px">-</q-td>
                    <q-td :props="props" key="total_price_inc_tax" class="primary_text" width="100px">{{
                      props.row.total_price_inc_tax
                    }}</q-td>
                  </q-tr>
                  <q-tr v-show="props.expand" :props="props" v-for="item in props.row.items" :key="item.id">
                    <q-td class="sub_text"></q-td>
                    <q-td auto-width class="sub_text">{{ item.id }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.product }}</q-td>
                    <q-td auto-width class="sub_text"
                      >{{ item.original_total_price }} - ({{ item.discount }}%)</q-td
                    >
                    <q-td auto-width class="sub_text">{{ item.total_price_after_discount }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.total_qty }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.tax_rate }}%</q-td>
                    <q-td auto-width class="sub_text">{{ item.total_price_inc_tax }}</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center">*tax rate tenant will be applied when skus tax rate is zero (0).</div>
    </q-form>
    <template v-slot:actions>
      <template>
        <q-btn flat label="Close" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn flat label="Process" class="btn-save q-mr-sm" form="SyncOrderForm" type="submit" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormDialog from 'web/share/partial/FormDialog.vue';
import { Api, Notice } from 'services';
export default {
  components: {
    FormDialog
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      credentials: this.$store.state,
      pagination: {
        rowsPerPage: 0
      },
      data: [],
      columns: [
        {
          name: 'id',
          label: 'ID',
          align: 'left',
          field: 'id',
          sortable: true
        },
        {
          name: 'product',
          align: 'left',
          label: 'Product',
          field: 'product',
          sortable: true
        },
        {
          name: 'total_qty',
          align: 'left',
          label: 'Total Qty',
          field: 'total_qty',
          sortable: true
        },
        {
          name: 'total_price',
          align: 'left',
          label: 'Total Price',
          field: 'total_price',
          sortable: true
        },
        {
          name: 'tax',
          align: 'left',
          label: 'Tax',
          field: 'tax',
          sortable: true
        }

        // {
        //   name: "status",
        //   align: "center",
        //   label: "Status",
        //   field: "status",
        //   sortable: true
        // },
      ],
      dataTierPricing: [],
      columnsTierPricing: [
        {
          name: 'sku_id',
          label: 'ID',
          align: 'left',
          field: 'sku_id',
          sortable: true
        },
        {
          name: 'product',
          align: 'left',
          label: 'Product',
          field: 'product',
          sortable: true
        },
        {
          name: 'tier_qty',
          align: 'left',
          label: 'Tier Qty',
          field: 'tier_qty',
          sortable: true
        },
        {
          name: 'discount',
          align: 'left',
          label: 'Discount',
          field: 'discount',
          sortable: true
        },
        {
          name: 'total_qty',
          align: 'left',
          label: 'Total Qty',
          field: 'total_qty',
          sortable: true
        },
        {
          name: 'tax_rate',
          align: 'left',
          label: 'Tax Rate',
          field: 'tax_rate',
          sortable: true
        },
        {
          name: 'total_price_inc_tax',
          align: 'left',
          label: 'Total Inc. Tax',
          field: 'total_price_inc_tax',
          sortable: true
        }
      ]
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    SetTaxRate(item) {
      let tax_rate = 0;
      if (item.tax_rate == 0) {
        tax_rate = this.item.selectedTenant.tax_rate;
      } else {
        tax_rate = item.tax_rate;
      }
      return tax_rate;
    },
    async getData() {
      try {
        let new_data = [];
        const res = await this.$api.exec('p_hub_spree_status', [
          ` and a.tenant_id = ${this.item.selectedTenant.tenant_id} and a.hub_id = ${this.item.selectedHub.hub_id} and date(a.delivery_date) = "${this.item.date}" `,
          ' and sku_id is not null',
          '',
          ' order by sku'
        ]);
        if (res.status && res.data.length > 0) {
          let old_sku_id = 0;
          res.data.forEach((value, index) => {
            if (old_sku_id != value.sku_id) {
              old_sku_id = value.sku_id;
              let val = {
                id: value.sku_id,
                product: value.sku,
                total_qty: res.data
                  .filter((x) => x.sku_id == value.sku_id)
                  .reduce((total, v) => {
                    total = parseFloat(total) + parseFloat(v.total_qty);
                    return total;
                  }, 0),
                total_price: res.data
                  .filter((x) => x.sku_id == value.sku_id)
                  .reduce((total, v) => {
                    total = parseFloat(total) + parseFloat(v.total_price);
                    return total;
                  }, 0),
                tax: res.data
                  .filter((x) => x.sku_id == value.sku_id)
                  .reduce((total, v) => {
                    total = parseFloat(total) + parseFloat(v.tax);
                    return total;
                  }, 0),
                original_total_price: res.data
                  .filter((x) => x.sku_id == value.sku_id)
                  .reduce((total, v) => {
                    total = parseFloat(total) + parseFloat(v.original_total_price);
                    return total;
                  }, 0),
                original_tax: res.data
                  .filter((x) => x.sku_id == value.sku_id)
                  .reduce((total, v) => {
                    total = parseFloat(total) + parseFloat(v.original_tax);
                    return total;
                  }, 0)
              };
              new_data[index] = val;
            }
          });
        }
        this.data = new_data;
        const preOrderItems = await this.$api.get(
          'v_pre_order_items',
          `tenant_id = ${this.item.selectedTenant.tenant_id} and customer_buyer_id = ${this.item.selectedHub.hub_id} and delivery_date = '${this.item.date}'`,
          `id as id, sku_id as sku_id, sku as product, tax_rate as tax_rate, total_qty as total_qty, total_price as total_price, tax as tax, original_total_price as original_total_price, original_tax as original_tax`,
          null
        );
        this.data.forEach(async (value, index) => {
          value.items = preOrderItems.data.filter((col) => col.sku_id == value.id);
        });

        const getTierPricingData = await this.$api.exec(
          `p_tier_pricing_EP`,
          [this.item.selectedTenant.tenant_id, this.item.selectedHub.hub_id, this.item.date],
          'read'
        );
        if (getTierPricingData.status && getTierPricingData.data.length > 0) {
          this.dataTierPricing = getTierPricingData.data;
          const getTierPricingItems = await this.$api.get(
            'v_pre_order_items',
            `tenant_id = ${this.item.selectedTenant.tenant_id} and customer_buyer_id = ${this.item.selectedHub.hub_id} and delivery_date = '${this.item.date}' and order_item_status_id in (-1,-2,11)`,
            `id as id, sku_id as sku_id,sku as product, tax_rate as tax_rate, total_qty as total_qty, total_price as total_price, tax as tax, sale_unit_price as unit_price, original_total_price as original_total_price, original_tax as original_tax, original_sale_unit_price as original_unit_price`,
            null
          );

          this.dataTierPricing.forEach(async (value, index) => {
            let overallPrice = 0;
            let newTierPricingItems = getTierPricingItems.data.filter((col) => col.sku_id == value.sku_id);

            if (getTierPricingItems.status && getTierPricingItems.data.length > 0) {
              newTierPricingItems.forEach((sValue, sIndex) => {
                let tax_rate = this.SetTaxRate(sValue);

                sValue.sku_deal_id = value.id;
                sValue.discount = value.discount;
                sValue.tax_rate = tax_rate;
                sValue.unit_price_after_discount =
                  sValue.original_unit_price - sValue.original_unit_price * (value.discount / 100);
                sValue.total_price_after_discount =
                  sValue.original_total_price - sValue.original_total_price * (value.discount / 100);
                sValue.tax_after_discount = sValue.total_price_after_discount * (tax_rate / 100);
                sValue.total_price_inc_tax =
                  Math.round(
                    (Number(sValue.total_price_after_discount) +
                      Number(sValue.tax_after_discount) +
                      Number.EPSILON) *
                      100
                  ) / 100;
                overallPrice += Number(sValue.total_price_inc_tax);
              });
            }
            value.items = newTierPricingItems;
            value.total_price_inc_tax = Math.round((overallPrice + Number.EPSILON) * 100) / 100;
          });
        }
      } catch (error) {}
    },
    onSubmit() {
      const payload = this.dataTierPricing;

      setTimeout(() => {
        this.$emit('tierPricing-complete', payload);
      }, 500);
    }
  }
};
</script>
<style scoped>
/* ----------- */
.page-title {
  font-weight: 600;
  font-size: 22px;
}
.top-search {
  text-align: right;
}
.top-search .input-search {
  width: 220px;
  display: inline-block;
}
.mid-top-right {
  text-align: right;
}
.mid-top-right .btn-add {
  width: 170px;
  text-align: center;
}
.o-action {
  border: 1px solid transparent;
  width: auto;
}
.o-action .q-btn__wrapper {
  padding: 0 !important;
  min-height: 1rem;
}
.o-action:hover,
.o-action:active {
  background: transparent;
}
/* ----------- */
.ordered {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.customer_company {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.price_item {
  font-size: 12px;
  font-weight: normal;
  white-space: normal;
  color: #555;
}

.primary_text {
  font-size: 14px;
  font-weight: bold;
  white-space: normal;
  color: #000000;
}
.sub_text {
  font-size: 12px;
  font-weight: bold;
  white-space: normal;
  color: #000000;
}

.ellips_processing {
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background-color: #ffd600;
}

.ellips_processed {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: #57d3e2;
}

.ellips_cancelled {
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: red;
}

/* Media Screen */
@media (min-width: 600px) and (max-width: 1013px) {
}

@media (max-width: 599px) {
}
</style>
