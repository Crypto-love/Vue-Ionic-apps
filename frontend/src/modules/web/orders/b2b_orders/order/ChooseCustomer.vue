<template>
  <div class="q-pa-sm">
    <q-table
      :data="data"
      :columns="columns"
      card-class="no-shadow"
      :filter="filter"
      :loading="loading"
      :visible-columns="['name']"
      dense
      separator="none"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      @request="getData"
    >
      <template v-slot:top>
        <div class="text-primary text-body1">Choose Customer</div>
        <q-space />
        <search-input v-model="filter" label="Search By Name" data-cy="search-customer-by-name" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <q-item dense clickable @click="setValue(props.row)" data-cy="customer-list">{{
              col.value
            }}</q-item>
          </q-td>
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'eva-close-outline' : 'eva-person-done-outline'"
            />
            <q-tooltip>People In Charge</q-tooltip>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="text-grey-8 text-bold text-left">
              {{ props.row.in_charge }}
            </div>
            <div class="text-grey-8 text-left">{{ props.row.contact }}</div>
            <div class="text-grey-8 text-left">{{ props.row.address }}</div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import { Api } from 'services';
export default {
  components: {
    SearchInput
  },
  props: {
    value: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      credential: this.$store.state,
      customers: [],
      user_type: null,
      loading: true,
      pagination: {
        rowsPerPage: 10,
        page: 1,
        rowsNumber: 0
      },
      filter: null,
      data: [],
      columns: [
        {
          name: 'id'
        },
        {
          name: 'name',
          label: 'Name',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'in_charge',
          label: 'In Charge',
          align: 'left',
          field: 'in_charge',
          sortable: true
        },
        {
          name: 'contact',
          label: 'Contact',
          align: 'left',
          field: 'contact',
          sortable: true
        },
        {
          name: 'address',
          label: 'Address',
          align: 'left',
          field: 'address',
          sortable: true
        }
      ]
    };
  },
  computed: {
    condition() {
      const nameCons = `AND LOWER(name) LIKE LOWER("%${this.filter || ''}%")`;
      return `customer_tenant_id = ${this.credential.tenant_id} and customer_type = "buyer" ${nameCons} AND active = 1`;
    }
  },
  created() {
    this.customers = this.credential.customers;
    this.user_type = this.credential.user_type;
    this.getData({
      pagination: this.pagination,
      filter: undefined
    });
  },
  methods: {
    async getTotalData() {
      const { status, message, data } = await Api.get('v_customers', this.condition, 'COUNT(id) as total');

      return data[0].total;
    },

    async getData(props) {
      this.loading = true;

      const { page, rowsPerPage } = props.pagination;

      if (page == 1) this.pagination.rowsNumber = await this.getTotalData();

      const limit = rowsPerPage === 0 ? this.pagination.rowsNumber : rowsPerPage;
      const offset = (page - 1) * rowsPerPage;

      const { status, message, data } = await Api.get(
        'v_customers',
        this.condition,
        null,
        null,
        limit,
        offset
      );

      this.data = data;
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;

      this.loading = false;
    },

    setValue(v) {
      const payload = {
        ...v,
        delivery_postal_code: v.default_postal_code
      };
      this.$emit('input', payload);
      this.$emit('set-customer', payload);
    }
  }
};
</script>
<style>
.no-scroll {
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>
