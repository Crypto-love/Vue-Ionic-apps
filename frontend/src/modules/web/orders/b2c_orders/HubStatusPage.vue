<template>
  <q-page padding>
    <div class="row q-mb-sm">
      <div class="col-sm-2">
        <div class="text-h4 items-end q-pt-xs page-title">Hub Status</div>
      </div>
      <div class="col-sm-10 q-gutter-xs">
        <div class="top-search row justify-end">
          <q-input
            round
            outlined
            v-model="date"
            mask="date"
            :rules="['date']"
            label="Search by Date From "
            class="input-search q-ml-sm"
            dense
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="date">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="Cancel" color="primary" flat v-close-popup />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="getHubDetail(null, date)"
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-show="dateRange"
            round
            outlined
            v-model="date2"
            mask="date"
            :rules="['date']"
            label="Search by Date To"
            class="input-search q-ml-sm"
            dense
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-date v-model="date2">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="Cancel" color="primary" flat v-close-popup />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="getHubDetail(null, date, date2)"
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-toggle v-model="dateRange" color="green" label="Range" />
          <search-input v-model="filter" label="Search" class="input-search q-ma-sm" />
        </div>
      </div>
    </div>
    <q-btn outline color="primary" no-caps rounded flat @click="getHubDetail(null, 1, 50, null)">All</q-btn>
    <q-btn outline color="primary" no-caps rounded flat @click="getHubDetail(0, 1, 50, null)">Open</q-btn>
    <q-btn outline color="primary" no-caps rounded flat @click="getHubDetail(1, 1, 50, null)">Close</q-btn>
    <div></div>
    <template>
      <div class="q-pt-lg">
        <q-table
          :data="data"
          :columns="columns"
          row-key="hub_id"
          :filter="filter"
          :loading="isLoading"
          :pagination.sync="pagination"
          :rows-per-page-options="[25, 50, 100, 150]"
          class="tdots-table"
          @request="onRequest"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width />
              <q-th v-for="col in props.cols" :key="col.name" :props="props">{{ col.label }}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-btn
                  size="sm"
                  color="primary"
                  round
                  dense
                  @click="onShowHubItem(props.row)"
                  icon="eva-eye-outline"
                  :disable="props.row.details <= 0"
                />
                <q-tooltip>Show Items Detail</q-tooltip>
              </q-td>
              <q-td class="primary_text" key="hub_name">{{ props.row.collection_point_name }}</q-td>
              <q-td class="primary_text" key="tenant_name">{{ props.row.supplier }}</q-td>
              <q-td class="primary_text" key="buyer_count">{{ props.row.total_buyer }}</q-td>
              <q-td class="primary_text" key="summed_total_price">{{ props.row.total_Purchase }}</q-td>
              <q-td class="primary_text" key="minimum_order">{{ props.row.minimum_order }}</q-td>
              <q-td class="primary_text" key="completion">
                <q-linear-progress
                  rounded
                  size="25px"
                  :value="Number(props.row.completion)"
                  :color="colorStatus(props.row.completion)"
                  class="q-mt-sm"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="black" :label="`${props.row.completion} %`" />
                  </div>
                </q-linear-progress>
              </q-td>
              <q-td class="primary_text" key="delivery_date">{{
                $dayjs(props.row.delivery_date).format('DD MMM YYYY')
              }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </template>

    <q-dialog v-model="showItems" persistent>
      <item-hub-info :item="selectedItem" @close-form="getHubDetail" />
    </q-dialog>
  </q-page>
</template>
<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

import ItemOrderInfo from './hubstatus/ItemOrderInfo.vue';
import ItemHubInfo from './hubstatus/ItemHub.vue';

import { Api, Notice } from 'services';
import { getCollectionPointStatus } from 'treeGQL';

export default {
  components: {
    SearchInput,
    ItemOrderInfo,
    ItemHubInfo
  },

  data() {
    return {
      hub_info: null,
      showInfo: false,
      inception: false,
      dateRange: false,
      credentials: this.$store.state,
      date: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      date2: this.$dayjs(new Date()).format('YYYY/MM/DD'),
      filter: null,
      model: null,
      showItems: false,
      selectedItem: null,
      isLoading: false,
      pagination: {
        rowsPerPage: 25,
        rowsNumber: 25,
        page: 1
      },
      columns: [
        {
          name: 'hub_name',
          align: 'left',
          label: 'Hub',
          field: 'hub_name',
          sortable: true
        },
        {
          name: 'tenant_name',
          align: 'left',
          label: 'Supplier',
          field: 'tenant_name',
          sortable: true
        },
        {
          name: 'buyer_count',
          align: 'left',
          label: '# Of Buyers',
          field: 'buyer_count',
          sortable: true
        },
        {
          name: 'summed_total_price',
          align: 'left',
          label: 'Total Purchase',
          field: 'summed_total_price',
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
          name: 'completion',
          align: 'left',
          label: 'Completion',
          field: 'completion',
          sortable: true
        },
        {
          name: 'delivery_date',
          align: 'left',
          label: 'Delivery Date',
          field: 'delivery_date',
          sortable: true
        }
      ],
      data: [],
      master: []
    };
  },
  computed: {
    isSuperAdmin() {
      return this.$store.state.user_type_id == 1;
    },
    isAdmin() {
      return this.$store.state.user_type_id == 2 || this.$store.state.user_type_id == 4;
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    },
    hubidlist() {
      let result = [];
      let hubid_list = [
        ...new Set(this.credentials.customers.filter((x) => x.customer_type.name == 'buyer').map((x) => x.id))
      ];

      if (
        this.credentials.user_type_id == 1 ||
        this.credentials.user_type_id == 2 ||
        this.credentials.user_type_id == 4
      ) {
        result = [];
      } else {
        result = hubid_list;
      }
      return result;
    }
  },
  mounted() {
    this.getHubDetail(null, 1, 50, null);
  },
  methods: {
    colorStatus(v) {
      switch (true) {
        case v >= 0 && v < 33:
          return 'red';
        case v >= 33 && v < 66:
          return 'orange';
        case v >= 66 && v < 99:
          return 'yellow';
        case 100:
          return 'green';
        default:
          'gray';
      }
    },
    async getHubDetail(isComplete = null, page = null, rowsPerPage = null, filter = null) {
      this.isLoading = true;
      try {
        let query = '';
        let tenantid_list;
        if (this.isAdvocate) {
          query = `(select distinct id From v_tenant_hubs where hub_id in (${this.$store.state.customers
            .map((x) => x.id)
            .join()})) a`;
          const res = await Api.get(query);
          tenantid_list = [...new Set(res.data.map((x) => x.id))];
        }

        let tenantidlist = [];
        if (this.isSuperAdmin || this.isAdmin) {
          tenantidlist = [this.credentials.tenant_id];
        } else {
          tenantidlist = tenantid_list;
        }
        let obj = {
          tenantIdList: tenantidlist,
          hubIdList: this.hubidlist ? this.hubidlist : null,
          page: page,
          status: isComplete ? isComplete : null,
          perPage: rowsPerPage,
          keyword: filter
        };
        const getHubStatusData = await this.getCollectionPointStatus(obj);
        this.data = getHubStatusData?.data?.getCollectionPointStatus?.CollectionPointStatusHeader;
        this.pagination.rowsNumber = getHubStatusData?.data?.getCollectionPointStatus?.total_rows;
      } catch (error) {
        Notice.fail(error.message);
      }
      this.isLoading = false;
    },
    getdelivery_date() {
      let result = '';
      let now = this.$dayjs();
      if (now <= this.$dayjs().day(4).hour(22).minute(0)) {
        result = this.$dayjs().day(6).format('YYYY-MM-DD');
      } else if (now >= this.$dayjs().day(4).hour(22).minute(0)) {
        result = this.$dayjs().add(1, 'week').day(6).format('YYYY-MM-DD');
      }
      if (result == '') {
        result = this.$dayjs().day(6).format('YYYY-MM-DD');
      }
      return result;
    },
    onShowHubItem(row) {
      this.selectedItem = row;
      this.showItems = true;
    },
    async getCollectionPointStatus(obj) {
      this.isLoading = true;
      try {
        let params =
          obj.hubIdList.length > 0
            ? {
                tenantId: obj.tenantIdList,
                hubId: obj.hubIdList
              }
            : {
                tenantId: obj.tenantIdList
              };
        if (obj.status) {
          params.status = obj.status;
        }
        if (obj.keyword) {
          params.keyword = obj.keyword;
        }
        params.page = obj.page;
        params.perPage = obj.perPage;

        return await this.$apollo
          .query({
            query: getCollectionPointStatus,
            variables: params
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.loading.hide();
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.loading.hide();
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      await this.getHubDetail(null, page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
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
