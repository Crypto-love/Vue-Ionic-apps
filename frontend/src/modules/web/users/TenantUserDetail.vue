<template>
  <q-page padding>
    <div class="q-ma-md">
      <div class="row">
        <span class="text-title text-primary text-subtitle2 text-weight-medium">
          <span @click="gotoBack()" class="link-btn text-weight-medium cursor-pointer">{{
            type == 1
              ? 'Group Buy Users'
              : type == 2
              ? 'Business Users'
              : type == 3
              ? 'Internal Users'
              : 'Supplier Internal Users'
          }}</span>
          / {{ personalDetails.full_name }}
        </span>
      </div>
    </div>
    <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="row q-mb-lg full-width">
        <span class="text-title text-subtitle2 text-weight-bold"> User Details </span>
        <q-space />
        <span class="link-btn cursor-pointer" @click="gotoEdit()">Edit</span>
        <span>&nbsp;|&nbsp;</span>
        <span class="link-btn cursor-pointer" @click="showDeleteModal = true">Delete</span>
      </div>
      <div class="row">
        <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
          <div class="full-width justify-center flex q-mb-md">
            <q-avatar size="150px" style="height: auto">
              <img :src="photoProfile(personalDetails.image)" />
            </q-avatar>
          </div>
        </div>
        <div class="offset-md-1 col-md-8 col-sm-8 col-xs-12">
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Name:</div>
            <div class="col-sm-6 col-xs-6">{{ personalDetails.full_name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Phone Number:</div>
            <div class="col-sm-6 col-xs-6">{{ phoneNumberFormat(personalDetails.mobile) }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Email:</div>
            <div class="col-sm-6 col-xs-6">{{ personalDetails.email }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Password:</div>
            <div class="col-sm-6 col-xs-6">*********</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Country:</div>
            <div class="col-sm-6 col-xs-6">
              {{ personalDetails.country ? personalDetails.country.description : 'N/A' }}
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">User Type:</div>
            <div class="col-sm-6 col-xs-6">{{ personalDetails.userType.name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Gender:</div>
            <div class="col-sm-6 col-xs-6">{{ personalDetails.gender === 'm' ? `Male` : 'Female' }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Active:</div>
            <div class="col-sm-6 col-xs-6">
              <q-toggle
                :value="personalDetails.active"
                :true-value="true"
                :false-value="false"
                :label="personalDetails.active === true ? 'Yes' : 'No'"
                disable
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="type == 2 && !editCustomer">
      <q-table
        :data="customerList"
        :columns="columns"
        class="tdots-table q-ma-md"
        :pagination="pagination"
        v-if="type == 2 && !editCustomer"
      >
        <template v-slot:top-left>
          <div class="row">
            <span class="text-weight-bold">Customers</span>
          </div>
        </template>
        <template v-slot:top-right>
          <div class="row">
            <span class="right link-btn cursor-pointer" @click="editCustomer = true">Edit</span>
          </div>
        </template>
        <template v-slot:body-cell-name="props">
          <q-td>
            <span>{{ props.row.customer.name }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-address="props">
          <q-td>
            <span>{{
              props.row.customer.address.length ? getAddress(props.row.customer.address[0]) : ''
            }}</span>
          </q-td>
        </template>
        <template v-slot:bottom="props">
          <div class="row col-12 t-bottom">
            <div class="justify-center text-center items-center flex full-width">
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
                {{ Math.ceil(customerList.length / props.pagination.rowsPerPage) }}</span
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
    </template>
    <template v-if="type == 2 && editCustomer">
      <q-table
        :data="customerList"
        :columns="formColumns"
        class="tdots-table q-ma-md"
        :pagination="formPagination"
        :loading="isFormLoading"
        v-if="type == 2 && editCustomer"
      >
        <template v-slot:top-left>
          <div class="row q-mb-md">
            <span class="text-weight-bold">Customers</span>
          </div>
          <div class="row full-width">
            <q-select
              v-model="selectedCustomer"
              :options="customerOptions"
              stack-label
              ref="selectCustomer"
              dense
              outlined
              option-label="name"
              option-value="id"
              use-input
              input-debounce="500"
              behavior="menu"
              @input="addCustomer()"
              :loading="loadingCustomers"
              @keyup.enter.native="getAllCustomers"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </template>
        <template v-slot:body-cell-name="props">
          <q-td>
            <span>{{ props.row.customer.name }}</span>
          </q-td>
        </template>
        <template v-slot:body-cell-action="props">
          <q-td class="text-right">
            <q-icon
              name="far fa-trash-alt"
              size="sm"
              color="red"
              class="cursor-pointer"
              @click="deleteCustomer(props.row.customer.id)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-icon>
          </q-td>
        </template>
        <template v-slot:bottom="props">
          <div class="row col-12 t-bottom">
            <div class="justify-center text-center items-center flex full-width">
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
                {{ Math.ceil(customerList.length / props.pagination.rowsPerPage) }}</span
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
      <div class="q-mx-md row">
        <q-btn
          class="q-px-lg text-capitalize"
          text-color="grey-8"
          outline
          rounded
          label="Cancel"
          @click="editCustomer = false"
        />
      </div>
    </template>
    <q-dialog v-model="showDeleteModal">
      <supplier-delete-confirm :user="personalDetails" @close="onFormClosed" @delete="deleteUser" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import { aws_s3_bucket_public } from 'src/config';
import SupplierDeleteConfirm from './users/SupplierDeleteConfirm.vue';
import {
  getAllCustomers,
  getSupplierUserDetails,
  deleteSupplierUsers,
  tagBusinessCustomer,
  untagBusinessCustomer,
  getAllCustomerByBusinessUserId
} from 'treeGQL';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  components: {
    SupplierDeleteConfirm
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    },
    type: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      personalDetails: [],
      showDeleteModal: false,
      editCustomer: false,
      customerData: [],
      isFormLoading: false,
      selectedCustomer: null,
      loadingCustomers: false,
      customerOptions: [],
      pagination: {
        rowsPerPage: 5,
        page: 1
      },
      formPagination: {
        rowsPerPage: 5,
        page: 1
      },
      customerList: []
    };
  },
  computed: {
    columns() {
      const res = [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name'
        },
        {
          name: 'address',
          align: 'left',
          label: 'Address',
          field: 'address'
        }
      ];
      return res;
    },
    formColumns() {
      const res = [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name'
        },
        {
          name: 'action',
          align: 'right',
          label: '',
          field: 'action'
        }
      ];
      return res;
    }
  },
  async mounted() {
    await this.getData();
    if (this.type == 2) {
      await this.getCustomers();
    }
  },
  methods: {
    async getData() {
      this.personalDetails = await this.getPersonalDetailsById();
    },
    async getPersonalDetailsById() {
      try {
        return await this.$apollo
          .query({
            query: getSupplierUserDetails,
            variables: {
              userId: parseInt(this.id)
            }
          })
          .then((res) => {
            return res?.data?.getSupplierUserDetails;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: 'Unable to delete due to user transactions',
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
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/profile-pictures/${photoName}`;
      }
      return `${aws_s3_bucket_public}/profile-pictures/no_image.png`;
    },
    phoneNumberFormat(number) {
      return this.$helper.getPhoneString(number);
    },
    getAddress(address) {
      return this.$helper.getFormatedAddress(address);
    },
    gotoBack() {
      if (this.type == 1) {
        this.$router.push('/main/users/groupbuy_users');
      } else if (this.type == 2) {
        this.$router.push('/main/users/business_users');
      } else if (this.type == 3) {
        this.$router.push('/main/users/internal_users');
      } else if (this.type == 4) {
        this.$router.push(`/main/supplier/supplier/${parseInt(this.id)}`);
      }
    },
    gotoEdit() {
      this.$router.push({
        path: `/main/users/supplier_user/` + this.id + `/` + this.type + `/edit`
      });
    },
    onFormClosed() {
      this.showDeleteModal = false;
    },
    async deleteUser() {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      const resDelete = await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: deleteSupplierUsers,
            variables: {
              userIdList: [parseInt(this.id)]
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
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            this.$q.loading.hide();
            this.showDeleteModal = false;
            return reject(err?.message);
          });
      });
      this.$q.loading.hide();
      if (resDelete) {
        Notice.ok('Successfully deleted!');
        this.showDeleteModal = false;
        this.gotoBack();
      } else {
        Notice.ok('Failed to delete!');
      }
    },
    async getAllCustomers() {
      if (this.$refs.selectCustomer.inputValue.length < 3) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: 'Please type minimal 3 char and press enter',
          buttonText: 'close'
        });
        return;
      }
      this.loadingCustomers = true;
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              countryId: this.personalDetails.country.id,
              customer_type_id: 2,
              active: this.personalDetails.active,
              keyword: this.$refs.selectCustomer.inputValue
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomers);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.customerData = data;
      this.customerOptions = data;
      this.loadingCustomers = false;
      this.$refs.selectCustomer.showPopup();
    },
    async getCustomers() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomerByBusinessUserId,
            variables: {
              businessUserId: this.personalDetails.id
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomerByBusinessUserId);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.customerList = data;
    },
    async addCustomer() {
      this.isFormLoading = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: tagBusinessCustomer,
            variables: {
              userId: this.personalDetails.id,
              customerId: this.selectedCustomer.id
            }
          })
          .then((res) => {
            return resolve(res?.data?.tagBusinessCustomer);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getCustomers();
      this.selectedCustomer = null;
      this.customerOptions = [];
      this.isFormLoading = false;
    },
    async deleteCustomer(customerId) {
      this.isFormLoading = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: untagBusinessCustomer,
            variables: {
              userId: this.personalDetails.id,
              customerId: customerId
            }
          })
          .then((res) => {
            return resolve(res?.data?.untagBusinessCustomer);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getCustomers();
      this.isFormLoading = false;
    }
  }
};
</script>
<style scoped>
.link-btn {
  color: #a2acb5;
  text-decoration: underline;
}
.link-btn:hover {
  color: var(--q-color-primary);
}
</style>
