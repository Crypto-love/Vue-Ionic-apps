<template>
  <q-dialog persistent ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-pa-md" :style="{ width: '700px', maxWidth: '50vw' }">
      <q-card-section>
        <div class="text-h6 text-center" data-cy="alert-title">Add Inventory Quantity</div>
      </q-card-section>

      <q-table
        :data="items"
        :columns="columns"
        :pagination="pagination"
        :loading="isLoading"
        hide-bottom
        row-key="id"
      >
        <template v-slot:body="props">
          <q-tr>
            <q-td key="sku">
              {{ props.row.sku }}
            </q-td>
            <q-td key="total_qty" :props="props">
              {{ props.row.total_qty }}
            </q-td>
            <q-td key="restock_qty" :props="props">
              <q-badge :color="props.row.total_qty == props.row.restock_qty ? 'positive' : 'blue'">{{
                props.row.restock_qty
              }}</q-badge>
              <q-popup-edit
                v-model="temp_quantity"
                buttons
                @show="temp_quantity = null"
                @hide="temp_quantity = null"
                @save="
                  (newVal, oldVal) => {
                    if (newVal && newVal >= 0)
                      props.row.restock_qty =
                        newVal > props.row.total_qty ? props.row.total_qty : Math.round(Number(newVal));
                  }
                "
              >
                <q-input
                  v-model="temp_quantity"
                  type="number"
                  pattern="[0-9]*"
                  :min="0"
                  :max="props.row.total_qty"
                  :placeholder="props.row.restock_qty"
                  dense
                  autofocus
                />
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <q-card-actions v-if="!isLoading" align="right" class="q-mt-md">
        <q-btn unelevated no-caps class="q-px-md" label="Cancel" color="grey-5" v-close-popup />
        <q-btn unelevated no-caps class="q-ml-lg q-px-md" label="Continue" color="primary" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      items: [],
      columns: [
        {
          name: 'sku',
          field: 'sku',
          label: 'Product / SKU',
          align: 'left'
        },
        {
          name: 'total_qty',
          align: 'center',
          label: 'Order Quantity',
          field: 'total_qty'
        },
        {
          name: 'restock_qty',
          align: 'center',
          label: 'Restock\nQuantity',
          field: 'restock_qty'
        }
      ],
      pagination: {
        rowsPerPage: 10,
        page: 1
      },
      temp_quantity: null
    };
  },

  props: {
    orderId: {
      required: true
    }
  },

  mounted() {
    this.getActiveOrderItems();
  },

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show();
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide();
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide');
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok');
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide();
    },

    onCancelClick() {
      // we just need to hide dialog
      this.hide();
    },

    async getActiveOrderItems() {
      this.isLoading = true;

      const { status, message, data } = await this.$api.get(
        'v_order_items',
        `order_id = ${this.orderId} AND active = 1`,
        'id, sku, image, total_qty, total_qty AS restock_qty'
      );

      this.isLoading = false;

      if (status && data && data.length > 0) {
        this.items = data;
        this.pagination.rowsPerPage = data.length;
      } else {
        this.$notice.fail('Cannot get an items');
        this.onCancelClick();
      }
    },

    submit() {
      const payload = Array.from(this.items, (val) => {
        return { order_item_id: val.id, restock_qty: val.restock_qty };
      });
      this.$emit('ok', payload);

      // This is required
      this.hide();
    }
  }
};
</script>
