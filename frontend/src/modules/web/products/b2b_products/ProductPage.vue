<template>
  <q-page padding>
    <q-table
      title="Product / SKU"
      :data="data"
      :columns="columns"
      row-key="id"
      selection="multiple"
      :selected.sync="selected"
      :filter="filter"
      grid
      hide-header
    >
      <template v-slot:top-right>
        <div class="top-right-inline">
          <div class="q-gutter-xs top-actions">
            <q-btn class="btn-add" no-caps color="primary" label="Import" @click="inception = true"> </q-btn>
            <q-btn flat class="btn-add" style="border-radius: 24px" no-caps @click="onShowQRCode"
              >Generate QR Code</q-btn
            >
            <q-btn flat class="btn-add" style="border-radius: 24px" no-caps @click="showGenerateSku = true"
              >Create SKU</q-btn
            >
            <q-btn-dropdown
              class="btn-add q-mr-sm"
              no-caps
              color="primary"
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
          </div>
          <search-input v-model="filter" label="Search" />
        </div>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card
            :class="`sku-card q-ma-xs ${props.selected ? 'bg-grey-2' : ''}`"
            style="border-radius: 24px"
          >
            <q-checkbox size="lg" dense v-model="props.selected" class="checkbox" />

            <q-img
              :src="props.row.image.large"
              style="height: 200px; border-radius: 24px 24px 0px 0px"
              v-if="props.row.image"
            />
            <q-img
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png"
              style="height: 200px; border-radius: 24px 24px 0px 0px"
              v-else
            />

            <q-card-section>
              <div class="text-body1 text-weight-bold">
                {{ props.row.product_name }}
              </div>
              <div class="text-body1 text-weight">
                {{ props.row.product_alias }}
              </div>
              <div class="row justify-between">
                <div class="text-caption">Item Code</div>
                <div class="text-caption">#{{ props.row.id }}</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">Categories</div>
                <div class="text-caption">{{ props.row.main_category }}-{{ props.row.sub_category }}</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">Price</div>
                <div class="text-caption">{{ props.row.currency_symbol }} {{ props.row.total_price }}</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">Tax Rate</div>
                <div class="text-caption">{{ props.row.tax_rate }} %</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">Weight per {{ props.row.oom }}</div>
                <div class="text-caption">{{ props.row.weight }} KG</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">Incremental Qty</div>
                <div class="text-caption">{{ props.row.increment_qty }}</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">UOM (Unit Measurement)</div>
                <div class="text-caption">{{ props.row.uom }}</div>
              </div>
              <div class="row justify-between">
                <div class="text-caption">OOM (Order Measurement)</div>
                <div class="text-caption">{{ props.row.oom }}</div>
              </div>
              <!-- <template v-if="props.row.b2c === 1">
                <div class="line"></div>
                <div class="row justify-between">
                  <div class="text-caption">B2C Price</div>
                  <div class="text-caption">${{ props.row.b2c_total_price}}</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">B2C Weight per {{props.row.b2c_oom}}</div>
                  <div class="text-caption">{{ props.row.b2c_weight}} KG</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">Incremental Qty</div>
                  <div class="text-caption">{{ props.row.b2c_increment_qty}}</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">UOM (Unit Measurement)</div>
                  <div class="text-caption">{{ props.row.b2c_uom}}</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">OOM (Order Measurement)</div>
                  <div class="text-caption">{{ props.row.b2c_oom}}</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">Pooling Quantity</div>
                  <div class="text-caption">{{ props.row.b2c_pooling_qty}}</div>
                </div>
                <div class="row justify-between">
                  <div class="text-caption">B2C Packaging</div>
                  <div class="text-caption">{{ props.row.b2c_packaging || "-" }}</div>
                </div>
              </template> -->
            </q-card-section>
            <q-card-actions>
              <q-img
                class="q-mr-xs"
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/halal.svg"
                style="width: 28px"
                v-show="props.row.halal"
              >
                <q-tooltip>Halal</q-tooltip>
              </q-img>
              <q-img
                class="q-mr-xs"
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/group.png"
                style="width: 28px"
                v-show="props.row.b2c"
              >
                <q-tooltip>Available in B2C Order</q-tooltip>
              </q-img>
              <q-img
                src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/perishable-2.png"
                style="width: 28px"
                v-show="props.row.perishable"
              >
                <q-tooltip>Perishable</q-tooltip>
              </q-img>
              <q-icon
                name="eva-slash-outline"
                size="sm"
                color="negative"
                v-show="props.row.is_out_of_stock === 1"
              >
                <q-tooltip>Out of stock</q-tooltip>
              </q-icon>
              <q-space />
              <q-btn
                outline
                size="md"
                color="primary"
                icon="eva-edit-outline"
                @click="
                  selectedItem = { ...props.row };
                  showSkuForm = true;
                "
              >
                <q-tooltip :offset="[10, 10]">Edit</q-tooltip>
              </q-btn>
              <q-btn
                outline
                size="md"
                color="primary"
                icon="eva-archive-outline"
                @click="onShowStockDialog(props.row)"
              >
                <q-tooltip :offset="[10, 10]"
                  >See how many stocks left from suppliers which have this Sku</q-tooltip
                >
              </q-btn>
              <q-toggle
                :value="props.row.active === 1"
                checked-icon="eva-checkmark-outline"
                color="primary"
                unchecked-icon="eva-close-outline"
                @input="onToggleClick(props.row)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="showSkuForm" persistent>
      <sku-form :item="selectedItem" @edit-complete="onEditComplete" />
    </q-dialog>

    <q-dialog v-model="showGenerateSku" persistent>
      <generate-sku @on-save="onGenerateSku" />
    </q-dialog>

    <q-dialog v-model="showStockDialog">
      <stock-dialog :item="selectedItem" @on-close="onCloseStockDialog" />
    </q-dialog>

    <q-dialog v-model="showQRCodeDialog">
      <qr-code-generator :item="selectedItem" />
    </q-dialog>

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
  </q-page>
</template>

<script>
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import SearchInput from 'web/share/partial/SearchInput.vue';
import ProductForm from './products/ProductForm.vue';
import SkuForm from './products/EditSku.vue';
import GenerateSku from './products/GenerateSku.vue';
import { Api, Notice, ImportXlxs, dataToCSV } from 'services';

export default {
  components: {
    ProductForm,
    SkuForm,
    GenerateSku,
    SearchInput,
    StockDialog: () => import('./products/StockDialog.vue'),
    QrCodeGenerator: () => import('web/share/partial/QrCodeGenerator.vue')
  },
  data() {
    return {
      credentials: this.$store.state,
      inception: false,
      i_inventories: false,
      File: null,
      filter: '',
      uoms: [],
      selected: [],
      showSkuForm: false,
      showGenerateSku: false,
      showStockDialog: false,
      showQRCodeDialog: false,
      selectedItem: null,
      selectedUOM: null,
      selectedOOM: null,
      options: [],
      columns: [
        {
          name: 'product_name',
          field: 'product_name',
          sortable: true
        },
        {
          name: 'selling_price',
          field: 'selling_price',
          sortable: true
        },
        {
          name: 'code_inventory',
          field: 'code_inventory',
          sortable: true
        },
        {
          name: 'category',
          field: 'category',
          sortable: true
        }
      ],
      data: []
    };
  },
  created() {
    this.getData();
  },
  methods: {
    showConfirmDialog(title, messaage, callback) {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: title,
          message: messaage
        })
        .onOk(() => {
          if (callback) callback();
        });
    },
    onToggleClick(row) {
      const newActive = row.active ? 0 : 1;
      Api.update('skus', { active: newActive }, row.id);
      this.data[this.data.findIndex((x) => x.id === row.id)].active = newActive;
    },
    async getData(...skuIds) {
      if (skuIds.length > 0) {
        const { data } = await Api.get('v_skus', `id IN (${skuIds.join(',')})`, null, 'id DESC');

        for (let d of data) {
          const currentDataIdx = this.data.findIndex((v) => v.id === d.id);
          this.$set(this.data, currentDataIdx, d);
        }
      } else {
        if (this.$store.state.tenant_id != null) {
          let tenant_id = this.$store.state.tenant_id;
          const { data } = await Api.get('v_skus', `tenant_id = ${tenant_id}`, null, 'id DESC');
          this.data = [...data];
        } else {
          const { data } = await Api.get('v_skus', null, null, 'id DESC');
          this.data = [...data];
        }
      }
    },
    async onEditComplete(payload, id, isUpdateQuotedPrice) {
      try {
        this.$q.loading.show({ message: 'Updating sku...' });

        let res = await Api.update('skus', payload, id);
        if (!res.status) throw new Error(res.message);

        if (isUpdateQuotedPrice) {
          this.$q.loading.show({ message: 'Updating quoted prices...' });

          const lastUserId = this.credentials.id;
          const totalPrice = payload.total_price;

          res = await Api.exec('p_update_quoted_prices_after_edit_sku_price', [id, totalPrice, lastUserId]);
          if (!res.status) throw new Error(res.message);

          if (res.data)
            res.data.forEach((price) => {
              this.$api.add('app_notification', {
                table_id: price.id,
                user_id: this.$store.state.id,
                app_mode: this.$firebase.appMode(),
                notification_type: 'increased_price'
              });
            });
        }

        this.showSkuForm = false;
        this.getData();
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
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
    },
    onShowStockDialog(selected) {
      this.selectedItem = {
        sku_id: selected.id
      };
      this.showStockDialog = true;
    },
    onShowQRCode() {
      this.showQRCodeDialog = true;
    },
    async onTagSubmit(data) {
      this.showTagSkuForm = false;
      this.$q.loading.show();

      const cek = await Api.get(
        'v_inventories',
        `customer_id = ${data.customer_id} AND sku_id = ${data.sku_id} AND product_type_id = ${data.product_type_id}`
      );
      const get_data = cek.data[0];

      if (cek.data[0] != null) {
        Notice.fail('Product have been tagged to ' + get_data.supplier);
      } else {
        const res = await Api.add('inventories', data);
        if (!res.status) {
          Notice.fail(res.message);
        } else {
          Notice.ok('Sku successfully tagged');
        }
      }

      this.$q.loading.hide();
    },
    updatePrice(data) {
      const payload = {
        price: data.price
      };
      Api.update('skus', payload, data.id);
    },
    updateWeight(data) {
      const payload = {
        weight: data.weight
      };
      Api.update('skus', payload, data.id);
    },
    updateIncremental(data) {
      const payload = {
        increment_qty: data.increment_qty
      };
      Api.update('skus', payload, data.id);
    },
    /**
     * Parse an object into JSON String first
     * If there's an escaped character, such as "\n", or "\"", it will be replaced to
     * "\\n", or "\\""
     * If we don't parse it like this, then it will be an error on the p_generate_sku procedure
     * because it can't extract the JSON String
     * @param {String} json
     */
    doubleEscapeStringify(json) {
      const stringify = JSON.stringify(json);
      const regex = /\\/g;
      return stringify.replace(regex, '\\\\'); // To prevent error on MySQL's parsing function
    },
    async onGenerateSku(skuPayload) {
      this.$q.loading.show({
        message: 'Generating Skus.....'
      });
      const res = await Api.exec('p_generate_sku', [this.doubleEscapeStringify(skuPayload)]);
      if (!res.status) {
        Notice.fail(res.message);
      } else {
        this.showGenerateSku = false;
        this.getData();
      }
      this.$q.loading.hide();
    },
    async onCloseStockDialog(skuId) {
      await this.getData(skuId);
      this.showStockDialog = false;
    },
    onBulkEmptyStock() {
      this.showConfirmDialog(
        'Confirmation',
        'Are you sure want to set these sku as out of stock?',
        this.bulkEmptyStock
      );
    },
    async bulkEmptyStock() {
      const ids = this.selected.map((v) => v.id);
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
    }
  }
};
</script>

<style scoped>
.top-right-inline {
  display: flex;
}
.top-right-inline .act-btn {
  margin-left: 0.5rem;
  border-radius: 0.35rem;
  margin-bottom: 0.5rem;
}
.line {
  display: block;
  border-bottom: 1px solid #dedede;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 1px;
}
.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}
.sku-card {
  display: block;
}
.checkbox {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 2;
  background-color: white;
  background-size: 10% !important;
  border-radius: 0px !important;
}
@media (max-width: 480px) {
  .top-right-inline {
    display: block;
  }
  .top-right-inline .top-actions {
    display: block;
    width: 100%;
    text-align: center;
  }
  .top-right-inline .act-search {
    display: block;
    width: 100%;
    margin-left: 0;
  }
}
</style>
