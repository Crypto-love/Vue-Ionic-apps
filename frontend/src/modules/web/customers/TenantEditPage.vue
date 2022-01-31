<template>
  <q-page padding>
    <div class="d_header q-mb-md q-ml-md q-mt-lg">
      <div class="row">
        <div class="col-xs-12">
          <div class="text-title text-h7">
            <span class="text-primary text-weight-medium">
              <span
                @click="gotoRoute('/main/supplier/all_supplier')"
                class="link-btn text-weight-regular cursor-pointer"
                >All Suppliers</span
              >
              / Add Supplier
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="row q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="col-12">
        <div class="text-body1 text-weight-medium">{{ getTenantData.name }}</div>
        <div class="q-mt-lg row">
          <div class="col-2">Logo:</div>
          <div class="col-10 grid-style-transition justify-start">
            <q-img
              :src="logo(getTenantData.logo)"
              contain
              native-context-menu
              spinner-size="30px"
              height="100px"
              width="100px"
            />
          </div>
        </div>
        <div class="q-mt-lg row">
          <div class="col-2">Cities:</div>
          <div class="col-10">
            <q-table :data="states" :columns="statesColumns" row-key="id" class="tdots-table" hide-pagination>
              <template v-slot:header-cell-actions>
                <q-th>
                  <p
                    class="cursor-pointer link-btn text-right"
                    style="color: #04565a; text-decoration-line: underline; margin: 0"
                    @click="gotoRoute(`/main/supplier/supplier/` + id + `/edit`)"
                  >
                    Edit
                  </p>
                </q-th>
              </template>
              <template v-slot:no-data>
                <span>No States Available</span>
              </template>
            </q-table>
          </div>
        </div>
        <div class="q-mt-lg row">
          <!-- add internal supplier users here -->
          <div class="col-2">Internal Users:</div>
          <q-table
            :data="internalUsers"
            :columns="internalUserColumns"
            row-key="id"
            class="tdots-table col-10"
            hide-pagination
          >
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
                  {{ props.row.full_name }}
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-email="props">
              <q-td :props="props">
                <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
                  <span>{{ props.row.email }}</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-mobile="props">
              <q-td :props="props">
                <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
                  <span>{{ phoneNumberFormat(props.row.mobile) }}</span>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-country="props">
              <q-td :props="props">
                <div class="cursor-pointer fit items-center flex" @click="gotoDetail(props.row)">
                  <span>{{ props.row.country.description }}</span>
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
            <template v-slot:no-data>
              <span>No Internal Users Available</span>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { aws_s3_bucket_public } from 'src/config';
import { getSupplierStates, getSupplierUsers, updateSupplierUser } from 'treeGQL';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  components: {},
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      showEditModal: false,
      states: [],
      internalUsers: []
    };
  },
  computed: {
    statesColumns() {
      const res = [
        {
          name: 'state',
          align: 'left',
          label: 'State',
          field: 'state'
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
    },
    internalUserColumns() {
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
          label: 'Email',
          field: 'email',
          sortable: false
        },
        {
          name: 'mobile',
          align: 'left',
          label: 'Phone',
          field: 'mobile',
          sortable: false
        },
        {
          name: 'country',
          align: 'right',
          label: 'Country',
          field: 'country',
          sortable: false
        },
        {
          name: 'active',
          align: 'right',
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
    },
    getTenantData() {
      return this.$store.state.tenantData;
    }
  },
  async mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const result = await this.getStates();
      let temp = [];
      for (const state of result?.data?.getSupplierStates) {
        temp.push({
          id: state.state.id,
          state: state.state.name
        });
      }
      const internalUserData = await this.getInternalUsers();
      this.states = temp;
      this.internalUsers = internalUserData?.data?.getSupplierUsers?.supplier_users;
    },
    async getStates() {
      try {
        return await this.$apollo
          .query({
            query: getSupplierStates,
            variables: {
              customer_id: this.getTenantData.id
            }
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
    async getInternalUsers() {
      try {
        return await this.$apollo
          .query({
            query: getSupplierUsers,
            variables: {
              userType: 2,
              page: 1,
              perPage: 5,
              supplierId: this.getTenantData.id
            }
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
    logo(logoName) {
      if (logoName) {
        return typeof logoName === 'string' && logoName.startsWith('http')
          ? logoName
          : `${aws_s3_bucket_public}/supplier-logos/${logoName}`;
      }
      return `${aws_s3_bucket_public}/supplier-logos/no_image.png`;
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
      return `+${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6)}`;
    },
    async toggleActive(row) {
      try {
        row.active = !row.active;
        await this.$apollo
          .mutate({
            mutation: updateSupplierUser,
            variables: {
              jsonData: JSON.stringify({
                id: row.id,
                active: row.active
              })
            }
          })
          .then(() => {
            this.$q.notify('Successfully updated!');
          });
      } catch (error) {
        this.$q.notify('Failed to update!');
      }
    },
    gotoRoute(path) {
      this.$router.push(path);
    },
    gotoEdit(row) {
      this.$router.push({ path: `/main/users/supplier_user/` + row.id + '/4/edit' });
    },
    gotoDetail(row) {
      this.$router.push({
        path: `/main/users/supplier_user/` + row.id + `/4`
      });
    }
  }
};
</script>
<style scoped>
.link-btn {
  color: #a2acb5;
  text-decoration: none;
}
.link-btn:hover {
  color: var(--q-color-primary);
}
</style>
