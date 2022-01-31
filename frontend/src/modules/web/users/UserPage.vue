<template>
  <q-page padding>
    <div class="d_header q-mb-md q-mt-lg">
      <div class="row">
        <div class="col-xs-12 col-md-12">
          <div class="text-title text-subtitle2 text-weight-bold text-uppercase">Internal Users</div>
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
      @request="onRequest"
      v-model="selectedRow"
    >
      <template v-slot:top-left>
        <q-btn label="⋮" flat size="md" class="q-mr-sm" color="grey-5">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="tableAction(1)" :class="selectedRow.length > 0 ? '' : 'text-grey-5'"
                  >Top Up E-Wallet</q-item-section
                >
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="tableAction(2)" :class="selectedRow.length > 0 ? '' : 'text-grey-5'"
                  >Make Active</q-item-section
                >
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="tableAction(3)" :class="selectedRow.length > 0 ? '' : 'text-grey-5'"
                  >Make Inactive</q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn icon="las la-filter" size="sm" flat class="q-mr-sm" color="grey-5">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item clickable>
                <q-checkbox v-model="filterOptions.all" label="All" @input="getData()" />
              </q-item>
              <div class="text-grey-5 q-px-md">Status</div>
              <q-item clickable>
                <q-checkbox v-model="filterOptions.active" label="Active" @input="getData()" />
              </q-item>
              <q-item clickable>
                <q-checkbox v-model="filterOptions.inactive" label="Inactive" @input="getData()" />
              </q-item>
              <div class="text-grey-5 q-px-md">Country</div>
              <q-item clickable>
                <q-checkbox v-model="filterOptions.singapore" label="Singapore" @input="getData()" />
              </q-item>
              <q-item clickable>
                <q-checkbox v-model="filterOptions.malaysia" label="Malaysia" @input="getData()" />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn
          class="q-ml-xs q-px-md"
          color="primary"
          outline
          rounded
          label="Add Internal User"
          @click="gotoNew"
        />
      </template>
      <template v-slot:top-right>
        <q-input
          bottom-slots
          v-model="filter"
          label="Search Users"
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
      <template v-slot:body-cell-photoProfile="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            <q-avatar class="q-my-sm">
              <img :src="photoProfile(props.row.image)" />
            </q-avatar>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            {{ $helper.truncateText(props.row.full_name, 20) }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-email="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            <span>{{ $helper.truncateText(replaceStar(props.row.email), 30) }}</span>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-mobile="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            <span>{{ phoneNumberFormat(replaceStar(props.row.mobile)) }}</span>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-country="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            <span>{{ props.row.country ? props.row.country.description : '' }}</span>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-userType="props">
        <q-td :props="props">
          <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
            <span>{{ props.row.userType.name }}</span>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="true"
            :false-value="false"
            :label="props.row.active === true ? 'Yes' : 'No'"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            size="sm"
            class="cursor-pointer q-mr-xs"
            color="grey-5"
            @click="gotoEdit(props.row)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-icon>
          <q-icon
            name="far fa-trash-alt"
            size="sm"
            color="red"
            class="cursor-pointer"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          >
            <q-tooltip>Delete</q-tooltip>
          </q-icon>
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
      <supplier-delete-confirm :user="selectedItem" @close="onFormClosed" @delete="deleteUser" />
    </q-dialog>
    <q-dialog v-model="showTopUp">
      <top-up-ewallet-dialog :userLists="selectedRow" @close="onTopUpClosed" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import PersonCard from 'web/share/partial/PersonCard.vue';
import SupplierDeleteConfirm from './users/SupplierDeleteConfirm.vue';
import TopUpEwalletDialog from './users/TopUpEwalletDialog.vue';
import SearchTopRight from 'web/share/partial/SearchTopRight.vue';
import {
  getSupplierUsers,
  updateSupplierUser,
  updateMultipleSupplierActive,
  deleteSupplierUsers
} from 'treeGQL';
import { aws_s3_bucket_public } from 'src/config';
export default {
  components: {
    PersonCard,
    SearchTopRight,
    SupplierDeleteConfirm,
    TopUpEwalletDialog
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      rowsPerPageArray: [10, 20, 50],
      pagination: {
        rowsPerPage: 10,
        rowsNumber: 10,
        page: 1
      },
      actionType: null,
      selectedRow: [],
      showTopUp: false,
      filterOptions: {
        all: true,
        active: false,
        inactive: false,
        singapore: false,
        malaysia: false
      },
      data: []
    };
  },
  computed: {
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
          field: 'full_name',
          sortable: false
        },
        {
          name: 'email',
          align: 'left',
          label: 'Email',
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
          field: 'country.description',
          sortable: false
        },
        {
          name: 'userType',
          align: 'left',
          label: 'User Type',
          field: 'userType.name',
          sortable: false
        },
        {
          name: 'active',
          align: 'left',
          label: 'Active',
          field: 'active',
          sortable: false
        },
        {
          name: 'actions',
          align: 'right',
          label: '',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    }
  },
  mounted() {
    this.getData();
  },
  watch: {
    'filterOptions.all': function (val) {
      if (val) {
        this.filterOptions.active = false;
        this.filterOptions.inactive = false;
        this.filterOptions.singapore = false;
        this.filterOptions.malaysia = false;
      }
    },
    'filterOptions.active': function (val) {
      if (val) {
        this.filterOptions.all = false;
      }
    },
    'filterOptions.inactive': function (val) {
      if (val) {
        this.filterOptions.all = false;
      }
    },
    'filterOptions.singapore': function (val) {
      if (val) {
        this.filterOptions.all = false;
      }
    },
    'filterOptions.malaysia': function (val) {
      if (val) {
        this.filterOptions.all = false;
      }
    }
  },
  methods: {
    async getData(
      page = this.pagination.page,
      perPage = this.pagination.rowsPerPage,
      keyword = this.filter ? this.filter : undefined
    ) {
      try {
        this.data = [];
        this.isLoading = true;
        const response = await this.$apollo
          .query({
            query: getSupplierUsers,
            variables: {
              userType: 1,
              page: page,
              perPage: perPage,
              keyword: keyword,
              active:
                this.filterOptions.active ^ this.filterOptions.inactive
                  ? this.filterOptions.active
                    ? true
                    : false
                  : undefined,
              country:
                this.filterOptions.singapore ^ this.filterOptions.malaysia
                  ? this.filterOptions.singapore
                    ? 'Singapore'
                    : 'Malaysia'
                  : undefined
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        this.isLoading = false;
        this.data = response?.data?.getSupplierUsers?.supplier_users || [];
        this.pagination.rowsNumber = response?.data?.getSupplierUsers?.total_rows;
      } catch (error) {}
    },
    onFormClosed() {
      this.showForm = false;
      this.selectedItem = null;
    },
    gotoDetail(row) {
      if (row.id != null) {
        this.$router.push({ path: `/main/users/supplier_user/` + row.id + `/3` });
      }
    },
    gotoEdit(row) {
      if (row.id != null) {
        this.$router.push({ path: `/main/users/supplier_user/` + row.id + '/3/edit' });
      }
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
    phoneNumberFormat(number) {
      return this.$helper.getPhoneString(number);
    },
    async onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      await this.getData(page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    async deleteUser() {
      if (this.selectedItem) {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const resDelete = await new Promise((resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: deleteSupplierUsers,
              variables: {
                userIdList: [this.selectedItem.id]
              }
            })
            .then((res) => {
              return resolve(res?.data?.deleteSupplierUsers);
            })
            .catch((err) => {
              this.$q.dialog({
                parent: this,
                component: AlertMessage,
                title: 'failed',
                message: 'Unable to delete due to user transactions',
                buttonText: 'close'
              });
              this.$q.loading.hide();
              this.showForm = false;
              return reject(err?.message);
            });
        });
        if (resDelete) {
          Notice.ok('Successfully deleted!');
          this.getData();
        } else {
          Notice.fail('Failed to delete!');
        }
        this.$q.loading.hide();
        this.showForm = false;
        this.selectedItem = null;
      }
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/profile-pictures/${photoName}`;
      }
      return `${aws_s3_bucket_public}/profile-pictures/no_image.png`;
    },
    async toggleActive(row) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierUser,
            variables: {
              jsonData: JSON.stringify({
                id: row.id,
                active: !row.active
              })
            }
          })
          .then(() => {
            Notice.ok('Successfully updated!');
            this.getData();
          });
      } catch (error) {
        Notice.fail('Failed to update!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async tableAction(type) {
      if (this.selectedRow.length === 0) {
        return;
      }
      if (type === 1) {
        //topup ewallet
        this.showTopUp = true;
      } else if (type === 2) {
        //active
        this.updateActive(true);
      } else if (type === 3) {
        //inactive
        this.updateActive(false);
      }
    },
    async updateActive(type) {
      if (this.selectedRow.length > 0) {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        const idList = [];
        this.selectedRow.map((x) => idList.push(x.id));
        const updateUserActive = await new Promise((resolve, reject) => {
          return this.$apollo
            .mutate({
              mutation: updateMultipleSupplierActive,
              variables: {
                userIdList: idList,
                active: type
              }
            })
            .then((res) => {
              return resolve(res?.data?.updateMultipleSupplierActive);
            })
            .catch((err) => {
              return reject(err?.message);
            });
        });
        this.$q.loading.hide();
        if (updateUserActive) {
          Notice.ok('Successfully updated!');
          this.getData();
          this.selectedRow = [];
        } else {
          Notice.fail('Failed to updated!');
        }
      }
    },
    onTopUpClosed() {
      this.showTopUp = false;
      this.selectedRow = [];
    },
    gotoNew() {
      this.$router.push({ path: `/main/users/new/3` });
    },
    replaceStar(str) {
      return str?.replaceAll('*', '');
    },
    async filterByName(type) {
      if (type === 'clean') this.filter = undefined;
      await this.getData();
    }
  }
};
</script>
