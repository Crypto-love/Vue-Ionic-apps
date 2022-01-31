<template>
  <div class="q-pa-sm">
    <q-table
      :data="data"
      :columns="columns"
      card-class="no-shadow"
      :filter="filter"
      :visible-columns="['full_name', 'mobile']"
      dense
      separator="none"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
        <div class="text-primary text-body1">{{ 'Choose User' }}</div>
        <q-space />
        <search-input v-model="filter" label="Search By Name Or Contact" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <q-item dense clickable @click="setValue(props.row)">{{ col.value }}</q-item>
          </q-td>
          <q-td v-for="col in props.cols" :key="col.mobile" :props="props">
            <q-item dense clickable>{{ props.row.mobile }}</q-item>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import SearchInput from 'web/share/partial/SearchInput.vue';
import { getB2cUserByTenant } from 'treeGQL';

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
    selectedHub: {
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
          name: 'full_name',
          label: 'Name',
          align: 'left',
          field: 'full_name',
          sortable: true
        },
        {
          name: 'mobile',
          label: 'Contact',
          align: 'left',
          field: 'mobile',
          sortable: true
        }
      ]
    };
  },
  created() {
    this.customers = this.credential.customers;
    this.user_type = this.credential.user_type;
    this.getData();
  },
  methods: {
    async getData() {
      try {
        this.data = [];
        const response = await this.$apollo
          .query({
            query: getB2cUserByTenant,
            variables: {
              tenantId: this.credential.tenant_id
            }
          })
          .then(async (res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
        this.data = response?.data?.getB2cUserByTenant || [];
      } catch (error) {}
    },
    setValue(v) {
      this.$emit('input', v);
      this.$emit('set-user', v);
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
