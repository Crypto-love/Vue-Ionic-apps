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
            <q-item dense clickable @click="isEditMode ? chooseHubSpree(props.row) : setValue(props.row)">{{
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
          <q-td v-if="props.row.persons.length" colspan="100%">
            <div class="text-grey-8 text-bold text-left">
              {{ props.row.persons[0].first_name }} {{ props.row.persons[0].last_name }}
            </div>
            <div class="text-grey-8 text-left">
              {{ props.row.persons[0].phone }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import { getAvailableSprees, getAvailableCollectionPointByTenant } from 'treeGQL';

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
    },
    isEditMode: {
      type: Boolean,
      required: true
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
    tenant_id() {
      return this.$store.state.user_type_id == 2
        ? this.$store.state.tenant_id
        : this.$store.state.user_type_id == 4
        ? this.$store.state.tenant_id
        : this.$store.state.user_type_id == 1
        ? this.$store.state.tenant_id
        : this.selectedTenant.tenant_id;
    }
  },
  created() {
    this.customers = this.credential.customers;
    this.user_type = this.credential.user_type;
    if (!this.tenant_id) return;
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.data = [];
        const response = await this.$apollo
          .query({
            query: getAvailableCollectionPointByTenant,
            variables: {
              tenantId: this.tenant_id
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        this.data = response?.data?.getAvailableCollectionPointByTenant || [];
      } catch (error) {}
    },
    async chooseHubSpree(hub) {
      const sprees = await this.getAvailableSpree(hub.id);
      if (!sprees) return;
      const items = sprees.map((v) => {
        const start = this.$dayjs(this.$helper.getDateFromISODate(v.start_date)).format('DD MMM YYYY');
        const end = this.$dayjs(this.$helper.getDateFromISODate(v.end_date)).format('DD MMM YYYY');
        const delivery = this.$dayjs(this.$helper.getDateFromISODate(v.delivery_date)).format('DD MMM YYYY');
        return { label: `${start} - ${end}. Delivery: ${delivery}`, value: v.id };
      });
      this.$q
        .dialog({
          title: `Choose Spree`,
          message: `Please choose available spree for <strong>${hub.name}</strong>`,
          html: true,
          options: {
            type: 'radio',
            model: items[0].value,
            items: items
          },
          cancel: true,
          persistent: true
        })
        .onOk((data) => {
          this.$emit('change-collection-point', data);
        });
    },
    async getAvailableSpree(hubId) {
      try {
        this.$q.loading.show({ message: 'Get available spree' });
        const response = await this.$apollo
          .query({
            query: getAvailableSprees,
            variables: {
              hub_id: hubId,
              tenant_id: this.tenant_id
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        const sprees = response?.data?.getAvailableSprees;
        if (!sprees) throw 'Cannot get spree for choosen hub';
        if (sprees.length === 0) throw 'There is no open spree for choosen hub';
        return sprees;
      } catch (error) {
        this.$notice.fail(error.message || error);
        return null;
      } finally {
        this.$q.loading.hide();
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
