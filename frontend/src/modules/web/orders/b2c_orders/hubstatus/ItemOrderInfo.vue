<template>
  <form-dialog title="Item Orders Info" class="modal-sm">
    <q-card-section>
      <div class="row q-mb-md">
        <div class="col product">{{ this.item ? this.item.sku : '-' }}</div>
      </div>
      <q-table
        class="table-noborder"
        table-header-class="table-header"
        flat
        dense
        :data="data"
        :columns="columns"
        row-key="id"
      />
      <template v-slot:body-pooling_status="data">
        <q-td :props="data">
          <div>{{ props.row.pooling_status ? props.row.pooling_status : 'Non Pooling Item' }}</div>
        </q-td>
      </template>
    </q-card-section>
    <template v-slot:actions>
      <template>
        <q-btn flat label="Close" class="btn-cancel q-mr-sm" v-close-popup />
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
      pagination: {
        rowsPerPage: 50
      },
      columns: [
        {
          name: 'full_name',
          label: 'Customer Name',
          align: 'left',
          field: 'full_name'
        },
        {
          name: 'mobile',
          label: 'Contact Number',
          align: 'left',
          field: 'mobile'
        },
        {
          name: 'total_order',
          label: 'Quantity',
          align: 'left',
          field: 'total_order'
        },
        {
          name: 'total_price',
          label: 'Price',
          align: 'left',
          field: 'total_price'
        },
        {
          name: 'pooling_status',
          label: 'Pooling Status',
          align: 'left',
          field: 'pooling_status'
        }
      ],
      data: []
    };
  },
  mounted() {
    if (this.item) {
      this.data = this.item.buyer_info;
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
