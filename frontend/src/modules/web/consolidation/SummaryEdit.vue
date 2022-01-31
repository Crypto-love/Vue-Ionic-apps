<template>
  <form-dialog title="Summary Detail" class="modal-xl">
    <div class="q-mb-md row justify-end items-center">
      <search-input v-model="filter" label="Search" class="input-search" />
    </div>
    <q-form id="summaryForm" @submit.prevent="onSubmit">
      <q-table
        class="q-mt-md tdots-table"
        dense
        :filter="filter"
        :data="data"
        :columns="columns"
        table-style="max-height: 400px"
        :pagination.sync="pagination"
        :rows-per-page-options="[0]"
        wrap-cells
      >
        <template v-slot:body-cell-driver_collect_user_id="props">
          <q-td :props="props">
            <q-select
              v-model="props.row.driver_collect_user_id"
              dense
              outlined
              :options="drivers"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              label="Select Collecting Driver"
              @input="updateCollectDriver(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-driver_delivery_user_id="props">
          <q-td :props="props">
            <q-select
              v-model="props.row.driver_delivery_user_id"
              dense
              outlined
              :options="drivers"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              label="Select Delivery Driver"
              @input="updateDeliveryDriver(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-cod="props">
          <q-td :props="props">
            <q-toggle
              v-model="props.row.cod"
              color="primary"
              :true-value="1"
              :false-value="0"
              @input="updateCod(props.row)"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-instruction="props">
          <q-td :props="props" auto-width>
            {{ props.row.description }}
            <q-popup-edit v-model="props.row.description" buttons>
              <q-input
                outlined
                v-model="props.row.description"
                dense
                autofocus
                label="Put Instruction Here"
                stack-label
                @change="updateDescription(props.row)"
              />
            </q-popup-edit>
          </q-td>
        </template>
      </q-table>
    </q-form>
    <template v-slot:actions>
      <q-btn flat label="Close" color="primary" v-close-popup />
    </template>
  </form-dialog>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import { Api, Notice } from 'services';
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  components: {
    FormDialog,
    SearchInput
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 0
      },
      data: [],
      filter: null,
      drivers: [],
      columns: [
        {
          name: 'zone',
          label: 'Zone',
          align: 'left',
          field: 'zone',
          sortable: true
        },
        {
          name: 'order_id',
          label: 'Order ID',
          align: 'left',
          field: 'order_id',
          format: (val, row) => `#${val}`,
          sortable: true
        },
        {
          name: 'buyer',
          label: 'Customer',
          align: 'left',
          field: 'buyer',
          sortable: true
        },
        {
          name: 'buyer_delivery_address',
          label: 'Delivery Address',
          align: 'left',
          field: 'buyer_delivery_address',
          sortable: true
        },
        {
          name: 'item',
          label: 'Item',
          align: 'left',
          field: 'item',
          sortable: false
        },
        {
          name: 'qty',
          label: 'Qty',
          align: 'left',
          field: 'qty',
          sortable: false,
          style: 'width: 60px'
        },
        {
          name: 'driver_collect_user_id',
          label: 'Collecting',
          align: 'left',
          field: 'driver_collect_user_id',
          sortable: false
        },
        {
          name: 'driver_delivery_user_id',
          label: 'Delivering',
          align: 'left',
          field: 'driver_delivery_user_id',
          sortable: false
        },
        {
          name: 'cod',
          label: 'COD',
          align: 'left',
          field: 'cod',
          sortable: false
        },
        {
          name: 'instruction',
          label: 'Instruction',
          align: 'left',
          field: 'instruction',
          sortable: false,
          style: 'width: 200px'
        }
      ]
    };
  },
  mounted() {
    this.getDrivers();
    this.getData();
  },
  methods: {
    async getData() {
      /* get item summary */
      const res = await Api.get(
        'v_consolidation_all_summary',
        `delivery_date = '${this.item.date}' and group_id = ${this.item.group_id} and tenant_id = ${this.item.tenant_id}`,
        null,
        'order_id'
      );
      if (res.status) {
        this.data = res.data;
      }
    },
    async getDrivers() {
      const { data } = await Api.get('users', `user_type_id = 9`);
      this.drivers = data.map((v) => ({
        id: v.id,
        name: `${v.first_name} ${v.last_name}`
      }));
    },
    async updateDescription(data) {
      const res = await Api.update('order_items', { description: data.description }, data.id);
      if (res.status) {
        Notice.ok('order_items updated');
      }
    },
    async updateCod(data) {
      const res = await Api.update('order_items', { cod: data.cod }, data.id);
      if (res.status) {
        Notice.ok('order_items updated');
      }
    },
    async updateCollectDriver(data) {
      const res = await Api.update(
        'order_items',
        { driver_collect_user_id: data.driver_collect_user_id },
        data.id
      );
      if (res.status) {
        Notice.ok('order_items updated');
      }
    },
    async updateDeliveryDriver(data) {
      const res = await Api.update(
        'order_items',
        { driver_delivery_user_id: data.driver_delivery_user_id },
        data.id
      );
      if (res.status) {
        Notice.ok('order_items updated');
      }
    }
  }
};
</script>
