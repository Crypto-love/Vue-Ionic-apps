<template>
  <div class="q-pa-sm">
    <q-table
      :data="data"
      :columns="columns"
      card-class="no-shadow"
      :filter="filter"
      :visible-columns="['name']"
      dense
      separator="none"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
        <div class="text-primary text-body1">{{ 'Choose Tenant' }}</div>
        <q-space />
        <search-input v-model="filter" label="Search By Name" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <q-item dense clickable @click="setValue(props.row)">{{ col.value }}</q-item>
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
            <div class="text-grey-8 text-bold text-left">{{ props.row.in_charge }}</div>
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
      pagination: {
        rowsPerPage: 10
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
    tenantidlist() {
      let tenantid_list = [
        ...new Set(
          this.credential.customers.filter((x) => x.customer_type == 'tenant').map((x) => x.tenant_id)
        )
      ].join(',');
      // return this.$store.state.user_type_id == 11 ? ` and tenant_id in (${tenantid_list}) ` : '';
      return ` tenant_id in (${tenantid_list}) or tenant_id is null `;
    }
  },
  created() {
    this.customers = this.credential.customers;
    this.user_type = this.credential.user_type;
    this.getData();
  },
  methods: {
    async getData() {
      try {
        /** if hub, get only customer with minimum buyer and was tagged to logged user */
        const res = await Api.get('v_tenants', this.tenantidlist);

        this.data = res.data;
      } catch (error) {}
    },
    setValue(v) {
      this.$emit('input', v);
      this.$emit('set-tenant', v);
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
