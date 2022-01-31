<template>
  <q-card style="width: 500px">
    <q-card-section>
      <div class="text-h6">Details {{ item.name }}</div>
    </q-card-section>
    <q-table flat dense :data="data" :columns="columns" row-key="id" :pagination.sync="pagination"> </q-table>
    <q-card-actions align="right" class="bg-white text-teal">
      <q-btn flat label="OK" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script>
import { Api, Notice } from 'services';
export default {
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 5
      },
      columns: [
        {
          name: 'hub_name',
          align: 'left',
          label: 'Hub Name',
          field: 'hub_name',
          sortable: true
        },
        {
          name: 'priode',
          align: 'left',
          label: 'Spree Priode',
          field: 'priode',
          sortable: true
        },
        {
          name: 'total',
          align: 'left',
          label: 'Sales',
          field: 'total',
          sortable: true
        }
      ],
      data: []
    };
  },
  created() {
    if (this.item) {
      this.getListData();
    }
  },
  methods: {
    async getListData() {
      const res = await Api.get('v_detail_b2c_sales_orders', `tenant_id = ${this.item.tenant_id}`);
      this.data = [...res.data];
    }
  }
};
</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 300px
</style>
