<template>
  <q-form ref="form">
    <q-table
      class="q-mt-md"
      :data="data"
      :columns="columns"
      virtual-scroll
      table-style="max-height: 400px"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-driver="props">
        <q-td :props="props">
          <q-select
            v-model="props.row.user_id"
            clearable
            dense
            outlined
            :options="drivers"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            label="Select Driver"
            lazy-rules
            :rules="[(val) => !!val || 'Please choose driver']"
          />
        </q-td>
      </template>
    </q-table>
  </q-form>
</template>

<script>
import { Api, Notice, disableYesterdayDates } from 'services';
export default {
  props: {
    value: {
      type: Array,
      required: true
    },
    driverAllocation: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 0
      },
      drivers: [],
      columns: [
        {
          name: 'seller',
          label: 'Supplier',
          align: 'left',
          field: 'seller',
          sortable: true
        },
        {
          name: 'collection',
          label: 'Collection Types',
          align: 'left',
          field: 'collection',
          sortable: true
        },
        {
          name: 'driver',
          label: 'Select Driver',
          align: 'left',
          field: 'user_id',
          sortable: true
        }
      ]
    };
  },
  computed: {
    data: {
      get(v) {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    zones() {
      return this.driverAllocation.zones.filter((v) => v.user_id !== null);
    },
    deliveryDate() {
      return this.driverAllocation.date;
    },
    group_id() {
      return this.driverAllocation.group_id;
    },
    tenant_id() {
      return this.driverAllocation.tenant_id;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      if (this.data.length === 0) {
        this.data = await this.getCollectionTypes();
      }
      this.drivers = await this.getDrivers();
    },
    getCollectionTypes() {
      return Api.get(
        'v_consolidation_collections',
        `delivery_date = '${this.deliveryDate}' and group_id = ${this.group_id} and tenant_id=${this.tenant_id}`,
        null,
        'seller_id ASC'
      ).then((res) => {
        return res.data.map((v) => ({
          ...v
        }));
      });
    },
    getDrivers() {
      return Api.get('users', `user_type_id = 9`).then((res) => {
        return res.data.map((v) => ({
          id: v.id,
          name: `${v.first_name} ${v.last_name}`
        }));
      });
    }
  }
};
</script>
