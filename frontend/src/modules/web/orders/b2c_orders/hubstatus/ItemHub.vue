<template>
  <form-dialog title="Item Hub" class="modal-md">
    <q-card-section>
      <q-table
        flat
        dense
        :data="data"
        :columns="columns"
        row-key="id"
        :visible-columns="visibleColumns"
        :pagination.sync="pagination"
      >
        <template v-slot:body-cell-pooling="props">
          <q-td :props="props">
            <q-icon v-if="props.row.pooling" name="eva-checkmark-outline" color="green" />
            <q-icon v-else name="eva-close-outline" color="red" />
          </q-td>
        </template>
        <template v-slot:body-cell-progress="props">
          <q-td :props="props">
            <div>{{ props.row.in_progress }}</div>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-icon
              name="eva-edit-outline"
              size="xs"
              class="cursor-pointer"
              @click="onShowBuyerInfo(props.row)"
            />
            <q-tooltip :offset="[10, 10]">Detail</q-tooltip>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
    <template v-slot:actions>
      <template>
        <q-btn
          flat
          label="Close"
          class="btn-cancel q-mr-sm"
          @click="$emit('close-form', null, 1, 50)"
          v-close-popup
        />
      </template>
    </template>

    <q-dialog v-model="showItemOrderInfo" persistent>
      <item-order-info :item="selectedItem" />
    </q-dialog>
  </form-dialog>
</template>

<script>
import FormDialog from 'web/share/partial/FormDialog.vue';
import ItemOrderInfo from './ItemOrderInfo.vue';
export default {
  components: {
    FormDialog,
    ItemOrderInfo
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 10
      },
      showItemOrderInfo: false,
      selectedItem: null,
      visibleColumns:
        this.$store.state.tenant_id == 1 ||
        this.$store.state.tenant_id == 2 ||
        this.$store.state.tenant_id == 4
          ? ['sku', 'pooling', 'quantity', 'in_progress', 'outstanding', 'actions']
          : ['sku', 'pooling', 'quantity', 'in_progress', 'outstanding'],
      columns: [
        {
          name: 'sku',
          label: 'Sku',
          align: 'left',
          field: 'sku',
          sortable: true
        },
        {
          name: 'pooling',
          label: 'Pooling',
          align: 'left',
          field: 'pooling',
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
          name: 'in_progress',
          label: 'In Progress',
          align: 'left',
          field: 'in_progress',
          sortable: true
        },
        {
          name: 'outstanding',
          label: 'outstanding',
          align: 'left',
          field: 'outstanding',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        }
      ],
      data: []
    };
  },
  mounted() {
    if (this.item) {
      this.data = this.item.details;
    }
  },
  methods: {
    onShowBuyerInfo(row) {
      this.selectedItem = row;
      this.showItemOrderInfo = true;
    }
  }
};
</script>
<style scoped>
.product {
  font-weight: 600;
  color: #777777;
  font-size: 14px;
}
.qty {
  font-weight: 600;
  color: #353535;
  font-size: 14px;
}
.table-header {
  color: #000000 !important;
}
.table-noborder table tbody tr td {
  border: none !important;
}
</style>
