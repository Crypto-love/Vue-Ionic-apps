<template>
  <q-page padding>
    <div class="d_header q-mb-md q-mt-lg">
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <div class="text-title text-h6 text-uppercase">All Suppliers</div>
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
      rows-per-page-label="Page per row:"
      @request="onRequest"
    >
      <template v-slot:top>
        <q-btn
          class="btn-add"
          no-caps
          rounded
          outline
          color="primary"
          label="Add Supplier"
          @click="gotoNewTenant()"
        />
        <q-space />
        <!-- <search-top-right v-model="filter" label="Search Supplier name" /> -->
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
      <template v-slot:body-cell-logo="props">
        <q-td :props="props">
          <div class="full-width" @click="gotoTenant(props.row.tenant_id, false)">
            <q-img
              :src="logo(props.row.logo)"
              contain
              spinner-size="30px"
              style="height: 40px; margin-top: 5px; margin-bottom: 5px"
            >
            </q-img>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <p
            style="margin: 0; height: 100%; display: flex; align-items: center"
            @click="gotoTenant(props.row.tenant_id, false)"
          >
            {{ props.row.name }}
          </p>
        </q-td>
      </template>
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <p
            style="margin: 0; height: 100%; display: flex; align-items: center"
            @click="gotoTenant(props.row.tenant_id, false)"
          >
            {{ props.row.tenant_id }}
          </p>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-2-outline"
            class="cursor-pointer q-mr-xs"
            size="sm"
            @click="gotoTenant(props.row.tenant_id, true)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-icon>
          <q-toggle
            :value="props.row.active"
            :true-value="true"
            :false-value="false"
            @input="updateStatus(props.row)"
          >
            <q-tooltip>Active</q-tooltip>
          </q-toggle>
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
  </q-page>
</template>

<script>
import { Notice, ImportXlxs, dataToCSV } from 'services';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { getAllSupplierDashboardAdmin, updateNewSupplierDashboardAdmin } from 'treeGQL';
import SearchTopRight from 'web/share/partial/SearchTopRight.vue';
import { aws_s3_bucket_public } from 'src/config';

export default {
  components: {
    SearchTopRight
  },
  data() {
    return {
      credentials: this.$store.state,
      inception: false,
      File: null,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      rowsPerPageArray: [10],
      pagination: {
        rowsPerPage: 10,
        rowsNumber: 10,
        page: 1
      },
      data: []
    };
  },
  computed: {
    columns() {
      const res = [
        {
          name: 'logo',
          align: 'center',
          label: 'Logo',
          field: 'logo'
        },
        {
          name: 'name',
          align: 'left',
          label: 'Supplier Name',
          field: 'name'
        },
        {
          name: 'id',
          align: 'left',
          label: 'Tenant ID',
          field: 'id'
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
    'pagination.rowsPerPage'(v) {
      this.getData(1, v);
    }
  },
  methods: {
    async doImport() {
      await ImportXlxs(
        this.credentials,
        dataToCSV,
        this.File,
        'p_import_tenants',
        'supplier',
        'IMPORT_TENANT_RESULT',
        'TENANT,REGISTRATION,FIRST_NAME,REMARK',
        ['tenant', 'registration', 'first_name', 'remark']
      );
    },
    async getData(page = 1, perPage = 15, keyword = this.filter ? this.filter : undefined) {
      try {
        this.isLoading = true;
        let loggedTenant = 0;
        let res = [];
        if (this.$store.state.tenant_id != 1) {
          loggedTenant = this.$store.state.tenant_customer_id;
        }
        const allData = await this.getAllSuppliers(loggedTenant, page, perPage, keyword);
        for (const supplier of allData?.data?.getAllSupplierDashboardAdmin?.Customer) {
          res.push({
            id: supplier.id,
            addresses: supplier.address,
            persons: supplier.persons,
            name: supplier.name,
            account_number: supplier.account_number,
            alias_name: supplier.alias_name,
            customer_type_id: supplier.customer_type_id,
            tenant_id: supplier.tenant_id,
            class_id: supplier.tenant.class_id,
            tenant_level: supplier.tenant.class_id,
            delivery_charge: supplier.delivery_charge,
            delivery_instruction: supplier.delivery_instruction,
            minimum_order: supplier.minimum_order,
            profile: supplier.profile,
            class_name: supplier.tenant.tenant_class.name,
            registration_number: supplier.tenant.registration_number,
            tax_rate: supplier.tenant.tax_rate,
            building_name: supplier.tenant.building_name,
            street_name: supplier.tenant.street_name,
            unit_number: supplier.tenant.unit_number,
            first_name: supplier.tenant.first_name,
            last_name: supplier.tenant.last_name,
            email_notification: supplier.tenant.email_notification,
            email: supplier.tenant.email,
            default_credit_card_term: supplier.tenant.default_credit_card_term,
            logo: supplier.tenant.logo,
            lead_days: supplier.tenant.lead_days,
            commission_rate: supplier.tenant.commission_rate,
            credit_term: supplier.credit_term,
            payment_type: supplier.payment_type,
            active: supplier.active,
            halal_products: supplier.halal_products,
            cod: supplier.cod,
            mobile: supplier.tenant.key_person ? supplier.tenant.key_person.phone : '',
            country: supplier.address.length > 0 ? supplier.address[0].country.description : '',
            country_code: supplier.address.length > 0 ? supplier.address[0].country.name : '',
            country_id: supplier.address.length > 0 ? supplier.address[0].country.id : '',
            currency_code: supplier.address.length > 0 ? supplier.address[0].currency_code : '',
            currency_symbol: supplier.address.length > 0 ? supplier.address[0].currency_symbol : ''
          });
        }
        this.data = res.map((v) => ({
          ...v,
          branches: v.branches && JSON.parse(v.branches)
        }));
        this.pagination.rowsNumber = allData?.data?.getAllSupplierDashboardAdmin?.total_rows;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async getAllSuppliers(supplierId = 0, page = 1, perPage = 10, keyword = undefined) {
      try {
        return await this.$apollo
          .query({
            query: getAllSupplierDashboardAdmin,
            variables: {
              supplierId: supplierId,
              page: page,
              perPage: perPage,
              keyword: keyword //function search name
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
    async onRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      await this.getData(page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    logo(logoName) {
      if (logoName) {
        return typeof logoName === 'string' && logoName.startsWith('http')
          ? logoName
          : `${aws_s3_bucket_public}/supplier-logos/${logoName}`;
      }
      return `${aws_s3_bucket_public}/supplier-logos/no_image.png`;
    },
    async updateStatus(row) {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        return await this.$apollo
          .mutate({
            mutation: updateNewSupplierDashboardAdmin,
            variables: {
              data: { id: row.id, active: !row.active }
            }
          })
          .then(() => {
            this.$q.notify('Successfully updated!');
            this.getData(this.pagination.page);
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
      } finally {
        this.$q.loading.hide();
      }
    },
    gotoTenant(rowId, type = false) {
      const tenantData = this.data.filter((item) => item.tenant_id === rowId)[0];
      if (tenantData?.addresses?.length === 0) {
        this.$q
          .dialog({
            parent: this,
            component: AlertMessage,
            title: 'Tenant Validation',
            message: 'please add address first, to allow you add State data'
          })
          .onOk(() => {
            if (okCallBack) okCallBack();
          });
      } else {
        this.$store.commit('setTenantData', tenantData);
        if (type) {
          this.$router.push({ path: `/main/supplier/supplier/edit/` + rowId });
        } else {
          this.$router.push({ path: `/main/supplier/supplier/` + rowId });
        }
      }
    },
    gotoNewTenant() {
      this.$router.push({ path: `/main/supplier/new` });
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
