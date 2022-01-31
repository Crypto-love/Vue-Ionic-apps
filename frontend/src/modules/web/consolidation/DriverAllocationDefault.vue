<template>
  <form-dialog title="Delivery Drivers" id="FormMaster" class="form-master modal-sm">
    <q-table
      :data="data"
      :columns="columns"
      virtual-scroll
      table-style="max-height: 600px"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-name="props">
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
            @input="updateZoneDriver(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <template v-slot:actions>
      <q-btn flat label="Close" class="btn-cancel q-mr-sm" v-close-popup />
    </template>
  </form-dialog>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';
import { Api, Notice } from 'services';
export default {
  components: {
    FormCard,
    FormDialog
  },
  data() {
    return {
      credential: this.$store.state,
      pagination: {
        rowsPerPage: 10
      },
      drivers: [],
      columns: [
        {
          name: 'id',
          label: 'Zone',
          align: 'left',
          field: 'id',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'name',
          label: 'Driver',
          align: 'left',
          field: 'name',
          sortable: true
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getZoneDriver();
    this.getDrivers();
  },
  methods: {
    async getZoneDriver() {
      const res = await Api.get('v_zone_drivers', `tenant_id=${this.credential.tenant_id}`, null, 'id');
      this.data = res.data;
    },
    async getDrivers() {
      const res = await Api.get('users', `user_type_id = 9`, "id,concat(first_name,' ',last_name) as name");
      this.drivers = res.data;
    },
    async updateZoneDriver(data) {
      const res = data.name
        ? /* update if name is not null */
          await Api.update('zone_drivers', { user_id: data.user_id }, data.id)
        : /* insert if name is null */
          await Api.add('zone_drivers', { id: data.id, user_id: data.user_id });

      if (res.status) {
        Notice.ok('zone drivers updated');
      }
    }
  }
};
</script>
