<template>
  <q-page padding>
    <div class="row q-mb-sm">
      <div class="col-sm-2">
        <div class="text-h4 items-end q-pt-xs page-title">Sales Order</div>
      </div>
      <div class="col-sm-10 q-gutter-xs">
        <div class="top-search row justify-end">
          <q-select round outlined v-model="month" :options="months" dense label="Select Month" />

          <q-select round outlined v-model="year" :options="years" dense label="Select Year" />

          <search-input v-model="filter" label="Search" class="input-search q-ma-sm" />
        </div>
      </div>
    </div>
    <q-btn outline color="primary" no-caps rounded @click="getHubDetail()">All</q-btn>
    <div></div>
    <template>
      <div class="q-pt-lg">
        <q-table
          :data="data"
          :columns="columns"
          :filter="filter"
          :loading="isLoading"
          :pagination.sync="pagination"
          :rows-per-page-options="[100, 200, 300, 0]"
          class="tdots-table"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-icon
                name="eva-edit-outline"
                size="sm"
                class="cursor-pointer"
                @click="
                  sales_info = props.row;
                  showInfo = true;
                "
              />
              <q-tooltip :offset="[10, 10]">Detail</q-tooltip>
            </q-td>
          </template>
        </q-table>
      </div>
    </template>
    <q-dialog v-model="showInfo">
      <sales-info :item="sales_info" />
    </q-dialog>
  </q-page>
</template>
<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';

import SalesInfo from './salesOrder/salesInfoPage.vue';

import { Api, Notice } from 'services';
import { getMaster } from 'services';
import { date } from 'quasar';

export default {
  components: {
    SearchInput,
    SalesInfo
  },

  data() {
    return {
      sales_info: null,
      showInfo: false,
      inception: false,
      dateRange: false,
      month: 'November',
      months: [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'December'
      ],
      year: '2020',
      years: ['2018', '2019', '2020', '2021'],
      date: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      date2: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      filter: null,
      model: null,
      showItems: false,
      selectedItem: null,
      isLoading: false,
      pagination: {
        rowsPerPage: 100
      },
      columns: [
        {
          name: 'name',
          align: 'left',
          label: 'Company Name',
          field: 'name',
          sortable: true
        },
        {
          name: 'total_sale',
          align: 'left',
          label: 'Total Sales',
          field: 'total_sale',
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'left',
          label: 'Month',
          field: 'delivery_date',
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
    this.getData();
  },
  methods: {
    async getData() {
      const res = await Api.get('v_b2c_sales_orders', null, null, 'id desc');
      this.data = [...res.data];
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
.primary_text {
  font-weight: 500;
  color: #131313;
}
</style>
