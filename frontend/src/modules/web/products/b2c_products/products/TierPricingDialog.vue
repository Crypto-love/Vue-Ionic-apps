<template>
  <form-dialog :title="`Tier Pricing`" class="modal-md">
    <q-table :data="data" :columns="columns" row-key="name" :loading="isLoading" :filter="filter">
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <div>&nbsp;</div>
        <q-btn dense label="Add New" color="primary" @click="showTierPricingForm = true">
          <template v-slot:append>
            <q-icon name="plus" />
          </template>
        </q-btn>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>{{ props.row.product }}</q-td>
          <q-td>{{ props.row.quantity }}</q-td>
          <q-td>{{ props.row.discount }}</q-td>
          <q-td>{{ props.row.rank }}</q-td>
          <!-- <q-td
              key="default"
              :props="props"
            >
              <q-toggle
                :value="props.row.default == 1"
                checked-icon="check"
                color="primary"
                unchecked-icon="clear"
                @input="onToggleClick(props.row, true)"
              />
            </q-td> -->
          <q-td key="active" :props="props">
            <q-toggle
              :value="props.row.active == 1"
              checked-icon="check"
              color="primary"
              unchecked-icon="clear"
              @input="onToggleClick(props.row, false)"
            />
          </q-td>
          <q-td key="actions" class="q-gutter-x-sm" :props="props">
            <q-btn
              outline
              size="md"
              color="primary"
              icon="eva-edit-outline"
              @click="onShowEditDialog({ ...props.row })"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <template v-slot:actions>
      <q-btn flat label="Close" class="btn-cancel q-mr-sm" @click="onClose" />
    </template>
    <q-dialog v-model="showTierPricingForm" persistent>
      <tier-pricing-form
        title="Add Tier Pricing"
        :item="selectedItem"
        :product="item.product"
        @on-submit-complete="onSubmitComplete"
      />
    </q-dialog>
  </form-dialog>
</template>

<script>
// TODO: Empty stock functionality, search, and filter by type
import { Api, Notice } from 'services';
import FormCard from 'web/share/partial/FormCard.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage';

export default {
  components: {
    FormCard,
    FormDialog,
    TierPricingForm: () => import('./TierPricingForm.vue')
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
      showTierPricingForm: false,
      selectedItem: null,
      filter: null,
      data: [],
      columns: [
        {
          name: 'product',
          label: 'Product',
          align: 'left',
          field: 'product',
          sortable: true
        },
        {
          name: 'quantity',
          label: 'Quantity',
          align: 'left',
          field: 'quantity',
          sortable: true
        },
        {
          name: 'discount',
          label: 'Discount',
          align: 'left',
          field: 'discount',
          sortable: true
        },
        {
          name: 'rank',
          label: 'Rank',
          align: 'left',
          field: 'rank',
          sortable: true
        },
        // {
        //   name: "default",
        //   label: "Default",
        //   align: "left",
        //   field: "default",
        //   sortable: true
        // },
        {
          name: 'active',
          label: 'Active',
          align: 'left',
          field: 'active',
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
        const res = await Api.get('v_sku_deals', `sku_id = ${this.item.sku_id}`, null, `rank asc`);
        if (!res.status) {
          throw new Error(res.message);
        }
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },

    onShowEditDialog(rows) {
      this.selectedItem = rows;
      this.selectedItem.product = this.item.product;
      this.showTierPricingForm = true;
    },

    async onSubmitComplete(data, flag) {
      this.showTagSkuForm = false;
      this.$q.loading.show();

      try {
        let res;
        if (flag) {
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
      delete data.product;
      const res = await Api.add('sku_deals', data);

      this.showTierPricingForm = false;

      if (res.status) {
        return 'Data has been Added!';
      } else {
        return 'fail';
      }
    },

    async edit(data) {
      delete data.product;
      const res = await Api.update('sku_deals', data, data.id);
      if (!res.status) throw new Error(res.message);

      this.showTierPricingForm = false;
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
    },
    async onToggleClick(data, flag) {
      if (flag) {
        let newDefault = data.default ? 0 : 1;
        this.edit({ ...data, default: newDefault });
      } else {
        let newActive = data.active ? 0 : 1;
        this.edit({ ...data, active: newActive });
      }
      this.getData();
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
