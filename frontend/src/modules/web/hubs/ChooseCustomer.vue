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
        <div class="text-primary text-body1">{{ isHub ? 'Choose Hub' : 'Choose Customer' }}</div>
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
import { getAllTenantHubs } from 'treeGQL';
import AlertMessage from 'web/share/partial/AlertMessage.vue';

export default {
  components: {
    SearchInput
  },
  props: {
    value: {
      type: Object,
      default: {}
    },
    isHub: {
      type: Boolean,
      required: true
    },
    selectedTenant: {
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
        }
      ]
    };
  },
  computed: {
    isTenant() {
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
  mounted() {
    this.customers = this.credential.customers;
    this.user_type = this.credential.user_type;
    this.getData();
  },
  methods: {
    async getData() {
      try {
        let obj = {};
        if (this.isTenant) {
          obj.tenantIdList = [this.credential.tenant_id];
        }
        if (this.isAdvocate) {
          obj.tenantIdList = [this.selectedTenant.id];
          obj.hubIdList = this.customers
            .filter((x) => x.tenant_id === this.selectedTenant.id)
            .map((x) => x.id);
        }

        const getTenantHubs = await this.getTenantHubs(obj);
        for (const tenantHub of getTenantHubs.data.getTenantHubs) {
          if (this.data.filter((x) => x.id === tenantHub.customer_id).length === 0) {
            this.data.push({
              id: tenantHub.customer_id,
              name: tenantHub.customer.name,
              delivery_day: tenantHub.tenant.tenant.DeliveryDay?.sort((a, b) => a.day_id - b.day_id).map(
                (x) => x.day.description
              ),
              pic: tenantHub.tenant.first_name.concat(' ', tenantHub.tenant.last_name),
              lead_time: tenantHub.tenant.lead_days,
              email: tenantHub.tenant.email
            });
          }
        }
        this.data = [...this.data];
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
      this.$emit('set-customer', v);
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
