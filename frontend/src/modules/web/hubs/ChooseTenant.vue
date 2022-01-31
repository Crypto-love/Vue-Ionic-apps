<template>
  <div class="q-pa-sm">
    <q-table
      :data="data"
      :columns="columns"
      card-class="no-shadow"
      :filter="filter"
      :visible-columns="['tenant_name']"
      dense
      separator="none"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
        <div class="text-primary text-body1">Choose Tenant</div>
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
            <div class="text-grey-8 text-bold text-left">{{ props.row.pic }}</div>
            <div class="text-grey-8 text-left">{{ props.row.email }}</div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import { Api } from 'services';
import { getAllTenantHubs } from 'treeGQL';

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
  computed: {
    isAdmin() {
      return (
        this.$store.state.user_type_id == 1 ||
        this.$store.state.user_type_id == 2 ||
        this.$store.state.user_type_id == 4
      );
    },
    isAdvocate() {
      return this.$store.state.user_type_id == 11;
    }
  },
  data() {
    return {
      credential: this.$store.state,
      customers: [],
      tenants: [],
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
          name: 'tenant_name',
          label: 'Tenant Name',
          align: 'left',
          field: 'tenant_name',
          sortable: true
        },
        {
          name: 'pic',
          label: 'In Charge',
          align: 'left',
          field: 'pic',
          sortable: true
        },
        {
          name: 'email',
          label: 'Contact',
          align: 'left',
          field: 'email',
          sortable: true
        }
      ]
    };
  },
  created() {
    this.customers = this.credential.customers.filter((x) => x.customer_type == 'buyer');
    this.tenants = this.credential.customers.filter((x) => x.customer_type == 'tenant');
    this.user_type = this.credential.user_type;
    this.getData();
  },
  methods: {
    async getData() {
      try {
        let obj = {};
        if (this.isAdmin) {
          obj.tenantIdList = [this.credential.tenant_id];
        }
        if (this.isAdvocate) {
          obj.hubIdList = this.customers.map((x) => x.id);
        }

        const getTenantHubs = await this.getTenantHubs(obj);
        for (const tenantHub of getTenantHubs.data.getTenantHubs.sort((a, b) => a.tenant_id - b.tenant_id)) {
          if (this.data.filter((x) => x.id === tenantHub.tenant_id).length === 0) {
            this.data.push({
              id: tenantHub.tenant_id,
              tenant_name: tenantHub.tenant.tenant.name,
              delivery_day: tenantHub.tenant.tenant.DeliveryDay?.sort((a, b) => a.day_id - b.day_id).map(
                (x) => x.day.description
              ),
              pic: tenantHub.tenant.first_name.concat(' ', tenantHub.tenant.last_name),
              lead_time: tenantHub.tenant.lead_days,
              email: tenantHub.tenant.email
            });
          }
        }
      } catch (error) {}
    },
    async getTenantHubs(obj) {
      try {
        return await this.$apollo
          .query({
            query: getAllTenantHubs,
            variables: {
              tenantId: obj.tenantIdList,
              hubId: obj.hubIdList,
              active: true
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
    setValue(v) {
      this.$emit('input', v);
      this.$emit('set-tenants', v);
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
