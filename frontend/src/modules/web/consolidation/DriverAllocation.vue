<template>
  <q-form ref="form">
    <q-table
      class="q-mt-md tdots-table"
      :data="zones"
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
          name: 'zone',
          label: 'Zone',
          align: 'left',
          field: 'zone',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'points',
          label: 'Zone Points',
          align: 'left',
          field: 'points',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'items',
          label: 'Items',
          align: 'left',
          field: 'items',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'driver',
          label: 'Driver',
          align: 'left',
          field: 'driver',
          sortable: true
        }
      ]
    };
  },
  computed: {
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    date: {
      get() {
        return this.data.date;
      },
      set(v) {
        this.$set(this.data, 'date', v);
        this.getZones();
      }
    },
    mysqlDate() {
      return this.$dayjs(this.date).format('YYYY-MM-DD');
    },
    group_id() {
      return this.data.group_id;
    },
    tenant_id() {
      return this.data.tenant_id;
    },
    zones() {
      return this.data.zones;
    }
  },
  mounted() {
    this.date = this.date || this.$dayjs().format('YYYY/MM/DD');
    if (this.zones.length === 0) {
      this.getZones();
    }
    this.getDrivers();
  },
  methods: {
    async getZones() {
      const { data } = await Api.get(
        'v_consolidation_driver_allocation',
        `delivery_date = '${this.mysqlDate}' and group_id = ${this.group_id} and tenant_id=${this.tenant_id}`,
        null,
        'zone_id'
      );
      this.$set(this.data, 'zones', data);
    },
    async getDrivers() {
      try {
        const { data } = await Api.get('users', `user_type_id = 9`);
        this.drivers = data.map((v) => ({
          id: v.id,
          name: `${v.first_name} ${v.last_name}`
        }));
      } catch (error) {}
    }
  }
};
</script>
