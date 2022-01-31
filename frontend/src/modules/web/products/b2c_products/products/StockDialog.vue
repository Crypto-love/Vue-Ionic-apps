<template>
  <form-card title="Supplier Stock" class="my-card">
    <q-table :data="data" :columns="columns" row-key="name" :loading="isLoading" :filter="filter">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-quantity="props">
        <q-td class="q-gutter-x-sm" :props="props" v-if="props.row.quantity == -1">
          <div v-html="`&infin;`"></div>
        </q-td>
        <q-td class="q-gutter-x-sm" :props="props" v-else>
          <div>{{ props.row.quantity }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="q-gutter-x-sm" :props="props">
          <q-btn
            outline
            size="md"
            color="primary"
            icon="eva-edit-outline"
            @click="onShowEditDialog({ ...props.row })"
          />
          <q-btn
            outline
            size="md"
            color="negative"
            icon="eva-refresh-outline"
            @click="onEmptyStock(props.row.id)"
          >
            <q-tooltip>Set stock to 0</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <template v-slot:actions>
      <q-btn flat label="Back" class="btn-cancel q-mr-sm" @click="onClose" />
      <q-btn
        label="Tag Supplier"
        no-caps
        class="q-mr-sm"
        color="primary"
        @click="onShowEditDialog({ ...item })"
      />
    </template>
    <q-dialog v-model="showTagSkuForm" persistent>
      <tag-sku-form title="Tag Sku to Supplier" :item="selectedItem" @edit-complete="onTagSubmit" />
    </q-dialog>
  </form-card>
</template>

<script>
// TODO: Empty stock functionality, search, and filter by type
import { Api, Notice } from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage';

export default {
  components: {
    FormCard,
    TagSkuForm: () => import('../inventory/Form')
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isLoading: false,
      showTagSkuForm: false,
      selectedItem: null,
      filter: null,
      data: [],
      columns: [
        {
          name: 'supplier',
          label: 'Supplier',
          align: 'left',
          field: 'supplier',
          sortable: true
        },
        {
          name: 'product_type',
          label: 'Type',
          align: 'left',
          field: 'product_type',
          sortable: true
        },
        {
          name: 'quantity',
          label: 'Stock',
          align: 'left',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'price',
          label: 'Cost Price',
          align: 'left',
          field: 'price',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        }
      ]
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    showPrompt(title, message, okCallBack, noCallback = null) {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: title,
          message: message
        })
        .onOk(() => {
          if (okCallBack) okCallBack();
        })
        .onCancel(() => {
          if (noCallback) noCallback();
        });
    },
    async getData() {
      try {
        const res = await Api.get('v_inventories', `sku_id = ${this.item.sku_id}`, null, 'customer_id');
        if (!res.status) {
          throw new Error(res.message);
        }
        this.data = [...res.data];
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    onShowEditDialog({
      id,
      customer_id,
      sku_id,
      product_type_id,
      unit_price,
      price,
      quantity,
      expired_at,
      logistic_type,
      currency_symbol
    }) {
      this.selectedItem = {
        id,
        customer_id,
        sku_id,
        product_type_id,
        unit_price,
        price,
        quantity,
        expired_at,
        currency_symbol,
        logistic_type: logistic_type ? logistic_type.split(',') : []
      };
      this.showTagSkuForm = true;
    },

    async onTagSubmit(data) {
      this.showTagSkuForm = false;
      this.$q.loading.show();

      try {
        delete data.currency_symbol;

        let res;
        if (data.id) {
          res = await this.edit(data);
        } else {
          res = await this.add(data);
        }

        Notice.ok(res);
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        await this.getData();
        this.$q.loading.hide();
      }
    },

    async add(data) {
      const cek = await Api.get(
        'v_inventories',
        `customer_id = ${data.customer_id} AND sku_id = ${data.sku_id} AND product_type_id = ${data.product_type_id}`
      );
      const get_data = cek.data[0];

      if (get_data != null) {
        throw new Error('Product has been tagged to ' + get_data.supplier);
      }

      const res = await Api.add('inventories', data);
      if (!res.status) {
        throw new Error(res.message);
      }

      this.sendNotification(data);
      return 'Supplier tagged successfully';
    },

    async edit(data) {
      const { id, ...payload } = data;

      const res = await Api.update('inventories', payload, id);
      if (!res.status) throw new Error(res.message);

      return 'Edited successfully';
    },

    onEmptyStock(id) {
      this.showPrompt('Confirmation', 'Do you want to mark this supplier as out of stock ?', () =>
        this.emptyStock(id)
      );
    },

    async emptyStock(inventoryId) {
      try {
        this.$q.loading.show('Please wait...');
        const res = await Api.update('inventories', { quantity: 0 }, inventoryId);
        if (!res.status) throw new Error(res.message);

        const currentInventory = this.data.find((v) => v.id === inventoryId);
        currentInventory.quantity = 0;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.$q.loading.hide();
      }
    },

    onClose() {
      this.$emit('on-close', this.item.sku_id);
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
    }
  }
};
</script>

<style scoped>
.my-card {
  height: 540px !important;
  min-width: 640px !important;
}
</style>
