<template>
  <q-page padding>
    <div class="d_header q-mb-md q-mt-lg">
      <div class="row">
        <div class="col-12 q-mb-md">
          <div class="text-title text-subtitle2 text-weight-bold">HOSTS</div>
        </div>
        <div class="col-12 q-mb-md">
          <div class="inline-block bg-pink-1 q-pa-md" style="border-radius: 4px">
            <div class="q-mb-sm text-weight-bold">Needs Approval</div>
            <div>
              <q-badge
                rounded
                class="q-mr-sm text-weight-medium q-px-md"
                color="orange-1"
                text-color="red"
                :label="countNewHost + ` New Host`"
              />
              <q-badge
                rounded
                class="q-mr-sm text-weight-medium q-px-md"
                color="blue-1"
                text-color="blue"
                :label="countNewCP + ` New Collection Points`"
              />
              <q-badge
                rounded
                class="text-weight-medium q-px-md"
                color="deep-purple-1"
                text-color="deep-purple"
                :label="countNewBank + ` New Bank Accounts`"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="id"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
      selection="multiple"
      :selected.sync="selectedRow"
      @row-click="listDetail"
      @request="onRequest"
      v-model="selectedRow"
    >
      <template v-slot:top-left>
        <q-btn label="⋮" flat size="md" class="q-mr-sm" color="grey-5">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="showActionModal(true)">Approve</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="showActionModal(false)">Reject</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn icon="las la-filter" size="sm" flat class="q-mr-sm" color="grey-5">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable>
                <q-option-group
                  v-model="groupFilter"
                  class="full-width"
                  :options="options"
                  color="primary"
                  type="checkbox"
                  @input="onChangeFilter"
                />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn class="q-ml-xs q-px-md" color="primary" outline rounded label="Add Host" @click="gotoNew" />
      </template>
      <template v-slot:top-right>
        <q-input
          bottom-slots
          v-model="filter"
          label="Search Hosts"
          rounded
          outlined
          dense
          @keypress.prevent.enter="filterByName"
          style="width: 298px"
        >
          <template v-slot:append>
            <q-icon v-if="filter" name="close" @click="filterByName('clean')" class="cursor-pointer" />
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <span>{{ $helper.truncateText(props.row.full_name, 20) }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <span>{{ $helper.truncateText(replaceStar(props.row.email), 30) }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-photoProfile="props">
        <q-td :props="props">
          <q-avatar class="q-my-sm">
            <img :src="photoProfile(props.row.image)" />
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-mobile="props">
        <q-td :props="props">
          <span>{{ phoneNumberFormat(replaceStar(props.row.mobile)) }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-refNumber="props">
        <q-td :props="props">
          <span class="text-cyan-4" style="text-decoration: underline">
            {{ props.row.referred_number }}
          </span>
        </q-td>
      </template>
      <template v-slot:body-cell-country="props">
        <q-td :props="props">
          <span>{{ props.row.country ? props.row.country.description : '' }}</span>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            v-if="props.row.status_approval === 0"
            rounded
            color="orange-2"
            text-color="orange"
            label="Pending Approval"
          />
          <q-badge
            v-if="props.row.status_approval === 1"
            rounded
            color="green-2"
            text-color="green"
            label="Approved"
          />
          <q-badge
            v-if="props.row.status_approval === 2"
            rounded
            color="red-2"
            text-color="red"
            label="Rejected"
          />
          <q-badge
            v-if="props.row.status_approval === 3"
            rounded
            color="blue-2"
            text-color="blue"
            label="Pending verification"
          />
          <q-badge
            v-if="props.row.status_approval === 4"
            rounded
            color="deep-purple-2"
            text-color="deep-purple"
            label="Pending verification"
          />
        </q-td>
      </template>
      <template v-slot:bottom="props">
        <div class="row col-12 t-bottom">
          <div class="col-sm-4 justify-start items-center flex">
            Page per row:
            <q-select
              class="q-ml-md t-select-row"
              borderless
              v-model="pagination.rowsPerPage"
              :options="rowsPerPageArray"
              :disable="true"
            />
          </div>
          <div class="col-4 justify-center text-center items-center flex">
            <q-btn
              icon="chevron_left"
              color="grey-8"
              round
              dense
              flat
              :disable="props.isFirstPage"
              @click="props.prevPage"
            />
            <span
              >{{ props.pagination.page }} of
              {{
                Math.ceil(
                  (props.pagination.rowsNumber ? props.pagination.rowsNumber : 1) /
                    props.pagination.rowsPerPage
                )
              }}</span
            >
            <q-btn
              icon="chevron_right"
              color="grey-8"
              round
              dense
              flat
              :disable="props.isLastPage"
              @click="props.nextPage"
            />
          </div>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="showForm">
      <advocate-bulk-action
        :userList="selectedRow"
        :actionType="actionType"
        @close="onFormClosed"
        @bulkUpdate="bulkUpdateUser"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import { getAllAdvocates, advocateApproval, getAdvocateNewRequestCount } from 'treeGQL';
import PersonCard from 'web/share/partial/PersonCard.vue';
import AdvocateBulkAction from './advocates/AdvocateBulkAction.vue';
import SearchTopRight from 'web/share/partial/SearchTopRight.vue';
import { aws_s3_bucket_public } from 'src/config';

export default {
  components: {
    AdvocateBulkAction,
    PersonCard,
    SearchTopRight
  },
  data() {
    return {
      showForm: false,
      showTagSalesForm: false,
      selectedItem: null,
      actionType: null,
      filter: null,
      selected: [],
      isLoading: false,
      customerType: 2, //Customers
      pagination: {
        rowsPerPage: 10,
        rowsNumber: 10,
        page: 1
      },
      rowsPerPageArray: [10, 20, 50],
      countNewHost: 0,
      countNewCP: 0,
      countNewBank: 0,
      groupFilter: ['all'],
      prevFilter: ['all'],
      options: [
        {
          label: 'All',
          value: 'all'
        },
        {
          label: 'Pending Approval',
          value: 0
        },
        {
          label: 'Pending Verification (Collection Point)',
          value: 3
        },
        {
          label: 'Pending Verification (Bank Account)',
          value: 4
        },
        {
          label: 'Approved',
          value: 1
        },
        {
          label: 'Rejected',
          value: 2
        }
      ],
      selectedRow: [],
      data: []
    };
  },
  computed: {
    userType() {
      return this.$store.state.user_type_id;
    },
    isAdminOrTenant() {
      return [1, 2].includes(this.userType);
    },
    columns() {
      const res = [
        {
          name: 'photoProfile',
          align: 'left',
          label: '',
          field: 'photoProfile',
          sortable: false
        },
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name',
          sortable: false
        },
        {
          name: 'email',
          align: 'left',
          label: 'E-mail ',
          field: 'email',
          sortable: false
        },
        {
          name: 'mobile',
          align: 'left',
          label: 'Number',
          field: 'mobile',
          sortable: false
        },
        {
          name: 'country',
          align: 'left',
          label: 'Country',
          field: 'country',
          sortable: false
        },
        {
          name: 'refNumber',
          align: 'left',
          label: 'Referral Number',
          field: 'refNumber',
          sortable: false
        },
        {
          name: 'status',
          align: 'left',
          label: 'Status',
          field: 'status',
          sortable: false
        }
      ];
      return res;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    onChangeFilter(val) {
      if (val[0] == 'all' && val.length > 1) this.groupFilter.splice(0, 1);
      if ((val.includes('all') && val[0] != 'all') || val.length === 0) this.groupFilter = ['all'];
      this.getData();
    },
    phoneNumberFormat(number) {
      return this.$helper.getPhoneString(number);
    },
    async getData(
      page = this.pagination.page,
      perPage = this.pagination.rowsPerPage,
      keyword = this.filter ? this.filter : undefined,
      statusList = this.groupFilter.includes('all') || this.groupFilter.length === 0
        ? undefined
        : this.groupFilter
    ) {
      try {
        this.isLoading = true;
        this.data = [];
        const response = await this.$apollo
          .query({
            query: getAllAdvocates,
            variables: {
              page: page,
              perPage: perPage,
              keyword: keyword,
              statusList: statusList
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        this.data = response?.data?.getAllAdvocates?.advocate_users || [];
        this.pagination.rowsNumber = response?.data?.getAllAdvocates?.total_rows;
        this.isLoading = false;
        await this.getNewAdvocateData();
      } catch (error) {}
    },
    async getNewAdvocateData() {
      try {
        return await this.$apollo
          .query({
            query: getAdvocateNewRequestCount
          })
          .then((res) => {
            this.countNewHost = res?.data?.getAdvocateNewRequestCount.new_hosts;
            this.countNewCP = res?.data?.getAdvocateNewRequestCount.new_collection_points;
            this.countNewBank = res?.data?.getAdvocateNewRequestCount.new_bank_accounts;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    onFormClosed() {
      this.showForm = false;
    },
    async bulkUpdateUser() {
      let statusApproval;
      if (this.actionType) {
        //approve
        statusApproval = 1;
      } else {
        //reject
        statusApproval = 2;
      }
      this.$q.loading.show({
        message: 'Please wait...'
      });
      const userApproval = await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: advocateApproval,
            variables: {
              listId: this.selectedRow.map((x) => x.id),
              statusApproval: statusApproval
            }
          })
          .then((res) => {
            return resolve(res?.data?.advocateApproval);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      this.showForm = false;
      this.selectedRow = [];
      this.$q.loading.hide();
      this.getData();
    },
    closePopUp() {
      this.getData();
      this.showForm = false;
    },
    showActionModal(type) {
      if (this.selectedRow.length > 0) {
        if (this.selectedRow.length == 1) {
          if (![0, 2].includes(this.selectedRow[0].status_approval) && type) {
            Notice.fail('This user already Approved');
          } else if (this.selectedRow[0].status_approval == 2 && !type) {
            Notice.fail('This user already Rejected');
          } else {
            this.actionType = type;
            this.showForm = true;
          }
        } else {
          this.actionType = type;
          this.showForm = true;
        }
      } else {
        Notice.fail('Please select one or more users');
      }
    },
    replaceStar(str) {
      return str?.replaceAll('*', '');
    },
    search(rows, terms, cols) {
      return this.data.filter((x) => {
        return this.getValuesOfNestedObject(x)
          .filter((value) => value != 'NULL' && value)
          .join(' ')
          .toLowerCase()
          .includes(terms.toLowerCase());
      });
    },
    getValuesOfNestedObject(data) {
      return data && typeof data === 'object'
        ? Object.values(data).map(this.getValuesOfNestedObject).flat()
        : [data];
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/advocate/${photoName}`;
      }
      return `${aws_s3_bucket_public}/advocate/no_image.png`;
    },
    async listDetail(event, row, index) {
      if (row.id != null) {
        this.$router.push({ path: `/main/users/hosts/approval/` + row.id });
      }
    },
    async onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      await this.getData(page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    gotoNew() {
      this.$router.push({ path: `/main/users/hosts/new` });
    },
    async filterByName(type) {
      if (type === 'clean') this.filter = undefined;
      await this.getData();
    }
  }
};
</script>
<style scoped>
@media (max-width: 990px) {
  .d_header .text-title {
    text-align: center;
  }
  .d_header .btn-add {
    flex: 10000 1 0%;
    width: auto;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
