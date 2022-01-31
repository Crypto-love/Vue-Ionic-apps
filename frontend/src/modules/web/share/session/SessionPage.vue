<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Sessions</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :pagination.sync="pagination"
      :rows-per-page-options="[100, 200, 300, 0]"
      class="tdots-table"
    >
      <template v-slot:body-cell-user_type="props">
        <q-td :props="props">
          <div class="text-weight-bold">{{ props.row.user_type }}</div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import PersonCard from '../partial/PersonCard.vue';
import TableTopRight from '../partial/TableTopRight.vue';
import ConfirmMessage from '../partial/ConfirmMessage.vue';
export default {
  components: {
    PersonCard,
    TableTopRight
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      pagination: {
        rowsPerPage: 100
      },
      columns: [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'fullname',
          sortable: true
        },
        {
          name: 'in_time',
          align: 'left',
          label: 'Login Time',
          field: 'in_time',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: true
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      let { data } = await Api.get('v_sessions');
      this.data = [...data];
    }
  }
};
</script>
