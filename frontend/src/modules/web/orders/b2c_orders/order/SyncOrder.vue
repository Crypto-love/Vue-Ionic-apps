<template>
  <form-dialog title="Sync Order B2C to B2B" class="modal-xl">
    <q-form @submit.prevent="onSubmit" id="SyncOrderForm">
      <div class="q-gutter-xs row">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-6" style="padding: 10px">
              <!-- <div class="label" style="font-weight:600;">B2C Order</div> -->
              <q-table
                card-class="no-shadow"
                :data="dataB2C"
                :columns="columns"
                title="B2C Order"
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

                    <q-td class="primary_text" key="customer_name" :props="props" width="400px">
                      {{ props.row.user_name }} {{ props.row.mobile ? `(${props.row.mobile})` : '' }}
                      <div class="customer_company">
                        {{ !props.row.alias_name ? props.row.customer : props.row.alias_name }}
                      </div>
                    </q-td>
                    <q-td class="primary_text" :props="props"
                      >{{ credentials.currency_symbol }}{{ props.row.prices }}</q-td
                    >
                    <q-td class="primary_text" key="price" :props="props"
                      >{{ credentials.currency_symbol
                      }}{{ (Number(props.row.prices) + Number(props.row.taxes)).toFixed(4) }}</q-td
                    >

                    <q-td key="delivery_date" :props="props">{{
                      $dayjs(props.row.delivery_date).format('D MMMM YYYY')
                    }}</q-td>
                    <q-td key="info" :props="props">
                      <q-icon name="eva-info-outline" size="sm" />
                      <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">{{
                        props.row.info
                      }}</q-tooltip>
                    </q-td>
                    <q-td key="status" class="primary_text" :props="props" width="200px">{{
                      props.row.status
                    }}</q-td>
                  </q-tr>
                  <q-tr
                    v-show="props.expand"
                    :props="props"
                    v-for="item in props.row.items"
                    :key="item.unique_key"
                  >
                    <q-td class="sub_text">{{ item.unique_key }}</q-td>
                    <q-td auto-width class="sub_text text-center">{{ item.id }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.sku }}</q-td>
                    <q-td auto-width class="sub_text"
                      >{{ credentials.currency_symbol
                      }}{{ (Number(item.total_price) + Number(item.tax)).toFixed(4) }}</q-td
                    >
                    <q-td class="sub_text">{{ item.total_qty }}</q-td>
                    <q-td class="sub_text">{{ item.item_status }}</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
            <div class="col-md-6" style="padding: 10px">
              <q-table
                card-class="no-shadow"
                :data="dataB2B"
                :columns="columnsB2B"
                title="B2B Order"
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
                    <q-td :props="props" class="primary_text" key="customer" width="800px">{{
                      props.row.customer
                    }}</q-td>

                    <q-td class="primary_text" key="minimum_order" :props="props" width="50px"
                      >{{ credentials.currency_symbol }}{{ props.row.minimum_order }}</q-td
                    >
                    <q-td key="delivery_date" :props="props">{{
                      $dayjs(props.row.delivery_date).format('D MMMM YYYY')
                    }}</q-td>
                    <q-td key="unit_price" :props="props">- </q-td>
                    <q-td class="primary_text" key="price" :props="props"
                      >{{ credentials.currency_symbol
                      }}{{ Number(props.row.total_price_inc_tax).toFixed(4) }}</q-td
                    >
                    <q-td class="primary_text" key="tax_rate" :props="props">-</q-td>
                    <q-td key="status" class="primary_text" :props="props" width="200px">-</q-td>
                  </q-tr>
                  <q-tr
                    v-show="props.expand"
                    :props="props"
                    v-for="item in props.row.items"
                    :key="item.sku_id"
                  >
                    <q-td class="sub_text"></q-td>
                    <q-td auto-width class="sub_text">{{ item.sku }}</q-td>
                    <q-td auto-width class="sub_text">{{ item.b2b_qty }}</q-td>
                    <q-td class="sub_text"
                      >{{ credentials.currency_symbol
                      }}{{ parseFloat(item.unit_price_inc_tax).toFixed(4) }}</q-td
                    >
                    <q-td auto-width class="sub_text"
                      >{{ credentials.currency_symbol
                      }}{{ parseFloat(item.total_price_inc_tax).toFixed(4) }}</q-td
                    >
                    <q-td class="sub_text">{{ item.tax_rate }}</q-td>
                    <q-td class="sub_text">{{ item.status_item }}</q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center">*Supplier tax rate will be applied when SKU tax rate is 0.</div>
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
      hubFrom: null,
      hubTo: null,
      hubOptions: ['Hub A', 'Hub B', 'Hub C', 'Hub D', 'Hub E'],
      pagination: {
        rowsPerPage: 0
      },
      data: [],
      dataB2C: [],
      columns: [
        {
          name: 'id',
          label: 'Order No.',
          align: 'left',
          field: 'id',
          sortable: true
        },
        {
          name: 'customer_name',
          align: 'left',
          label: 'Hub',
          field: 'customer',
          sortable: true
        },
        {
          name: 'price',
          align: 'left',
          label: 'Purchase',
          field: 'prices',
          sortable: true
        },
        {
          name: 'info',
          align: 'left',
          label: 'Info',
          field: 'info',
          sortable: true
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true
        }
      ],
      dataB2B: [],
      columnsB2B: [
        {
          name: 'customer',
          label: 'Customer',
          align: 'left',
          field: 'customer',
          sortable: true
        },
        {
          name: 'minimum_order',
          align: 'left',
          label: 'Minimum Order',
          field: 'minimum_order',
          sortable: true
        },
        {
          name: 'unit_price',
          align: 'left',
          label: 'Unit Price',
          field: 'info',
          sortable: true
        },
        {
          name: 'price',
          align: 'left',
          label: 'Purchase',
          field: 'price',
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
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
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
        let stripeIds = [];
        const res = await this.$api.get(
          'v_orderhub_summary',
          `hub = 1 and tenant_id = ${this.item.selectedTenant.tenant_id} and customer_buyer_id = ${this.item.selectedHub.hub_id} and delivery_date = '${this.item.date}' `
        );
        this.data = res.data;

        const preOrderItems = await this.$api.get(
          'v_pre_order_items',
          `order_id in (${this.data.map((col) => col.id).toString()}) `
        );

        this.data.forEach(async (value, index) => {
          let getListItems = preOrderItems.data.filter((col) => col.order_id == value.id);
          let total_price = 0;
          let tax = 0;
          getListItems.forEach((sValue, sIndex) => {
            if (sValue.order_item_status_id == 12 || sValue.order_item_status_id == 13) {
              sValue.total_price = 0;
              sValue.tax = 0;
            } else {
              total_price += Number(sValue.total_price);
              tax += Number(sValue.tax);
            }
            sValue.unique_key = Math.floor(10000 + Math.random() * 90000).toString();
          });
          value.prices = total_price;
          value.taxes = tax;
          if (value.stripe_transaction_id != null) {
            stripeIds.push(value.stripe_transaction_id);
          }
          value.items = getListItems;
        });

        this.dataB2C = this.data;

        // const items = await this.$api.get(
        //   "v_hub_spree_status",
        //   `hub = 1 and tenant_id = ${this.item.selectedTenant.tenant_id} and customer_buyer_id = '${this.item.selectedHub.hub_id}' and delivery_date = '${this.item.date}'`
        // );
        //const items = await this.$api.exec('p_hub_spree_status',[` and a.hub = 1 and spree.tenant_id = "${this.item.selectedTenant.tenant_id}" and and customer_buyer_id = "${this.item.selectedHub.hub_id}" and delivery_date = "${this.item.date}"`,'','',''])

        this.data.forEach((value, index) => {
          if (!this.dataB2B.some((col) => col.customer_id == value.customer_buyer_id)) {
            this.dataB2B.push({
              name: value.alias_name,
              customer: value.customer,
              delivery_date: value.delivery_date,
              delivery_time: value.delivery_time,
              standalone: value.standalone,
              po_number: value.po_number,
              description: value.description,
              hub: value.hub,
              minimum_order: value.minimum_order,
              customer_id: value.customer_buyer_id,
              user_id: value.user_id,
              stripeIds: stripeIds,
              items: [],
              status_id: value.status_id,
              status: value.status
            });
          }
        });

        //get hub data to get delivery address, billing address, and postal code
        const gethubdata = await this.$api.get('v_hubs', ` hub_id = '${this.item.selectedHub.hub_id}'`);

        const getPreparingOrdeItemB2B = await this.$api.exec(
          'p_preparing_b2c_order_EP',
          [this.item.selectedTenant.tenant_id, this.item.selectedHub.hub_id, this.item.date],
          'read'
        );

        if (getPreparingOrdeItemB2B.status) {
          this.dataB2B[0].items = getPreparingOrdeItemB2B.data;
          let total_price = 0;
          let total_price_inc_tax = 0;
          let tax = 0;
          this.dataB2B[0].items.forEach((value, index) => {
            let tax_rate = this.SetTaxRate(value);
            value.tax_rate = tax_rate;
            total_price += parseFloat(value.b2b_qty) * parseFloat(value.b2c_unit_price);
            value.unit_price_inc_tax =
              parseFloat(value.b2c_unit_price) +
              parseFloat(parseFloat(value.b2c_unit_price) * parseFloat(tax_rate / 100));
            value.total_price_inc_tax = parseFloat(value.b2b_qty) * parseFloat(value.unit_price_inc_tax);
            total_price_inc_tax += value.total_price_inc_tax;
            tax += parseFloat(
              parseFloat(value.b2b_qty) * parseFloat(value.b2c_unit_price) * (tax_rate / 100)
            );
            value.tax = parseFloat(
              parseFloat(value.b2b_qty) * parseFloat(value.b2c_unit_price) * (tax_rate / 100)
            );
          });
          this.dataB2B[0].prices = total_price;
          this.dataB2B[0].taxes = tax;
          this.dataB2B[0].total_price_inc_tax = total_price_inc_tax;

          //add new property for new data require
          this.dataB2B[0].billing_address =
            gethubdata.data.length > 0 ? gethubdata.data[0].billing_address : '-';
          this.dataB2B[0].delivery_address =
            gethubdata.data.length > 0 ? gethubdata.data[0].delivery_address : '-';
          this.dataB2B[0].postal_code =
            gethubdata.data.length > 0 ? gethubdata.data[0].default_postal_code : '-';
        } else {
          Notice.fail('something went wrong!');
        }

        // setTimeout(()=>{
        //   this.dataB2B = this.PreparingB2BOrder(this.data, items.data);
        // }, 500)
      } catch (error) {}
    },
    onSubmit() {
      const payload = {
        delivery_date: this.dataB2B[0].delivery_date,
        delivery_time: this.dataB2B[0].delivery_time,
        po_number: this.dataB2B[0].po_number,
        standalone: this.dataB2B[0].standalone,
        user_id: this.dataB2B[0].user_id,
        customer_id: this.dataB2B[0].customer_id,
        currency_symbol: this.credentials.currency_symbol,
        currency_code: this.credentials.currency_code,
        delivery_address: this.dataB2B[0].delivery_address,
        postal_code: this.dataB2B[0].postal_code,
        billing_address: this.dataB2B[0].billing_address,
        items: []
      };

      this.dataB2B[0].items.forEach(async (value, index) => {
        const invId = await this.$api.get('inventories', `sku_id = ${value.sku_ID}`);
        if (value.order_item_status_id == 11) {
          payload.items.push({
            quantity: parseFloat(value.b2b_qty),
            unit_price: parseFloat(value.b2c_unit_price).toFixed(4),
            total_price: parseFloat(parseFloat(value.b2b_qty) * parseFloat(value.b2c_unit_price)).toFixed(2),
            id: invId.data[0].id,
            product_type_id: invId.data[0].product_type_id,
            sku_id: value.sku_ID,
            tax_rate: value.tax_rate
          });
        }
      });

      setTimeout(() => {
        this.$emit('syncOrder-complete', payload);
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
