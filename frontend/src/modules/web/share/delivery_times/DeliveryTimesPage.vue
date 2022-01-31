<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Delivery Times</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
      <div class="header-right">
        <table-top-right
          v-model="filter"
          @add-click="
            selectedItem = null;
            showForm = true;
          "
        />
      </div>
    </div>
    <q-table
      class="tdots-table"
      :data="data"
      :columns="columns"
      row-key="id"
      :filter="filter"
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-icon="props">
        <q-td :props="props">
          <div v-if="!props.row.icon">-</div>
          <div v-else>
            {{ props.row.icon }}
            (
            <q-icon size="xs" :name="props.row.icon" />)
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.active ? 'blue' : 'grey'"
            text-color="white"
            :label="props.row.active ? 'Active' : 'Inactive'"
          />

          <q-badge
            v-if="props.row.default"
            class="q-ml-sm"
            color="green"
            text-color="white"
            label="Default"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            class="cursor-pointer"
            size="sm"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          />
          <q-tooltip :offset="[10, 10]">Edit</q-tooltip>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showForm" persistent>
      <my-form :item="selectedItem" :existingTimes="data" @edit-complete="onEditComplete" />
    </q-dialog>
  </q-page>
</template>

<script>
import TableTopRight from 'web/share/partial/TableTopRight.vue';
import MyForm from './Form.vue';
export default {
  components: {
    TableTopRight,
    MyForm
  },
  data() {
    return {
      filter: null,
      showForm: false,
      selectedItem: null,
      errorName: false,
      errorMessageName: '',
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'start',
          required: true,
          label: 'Start',
          align: 'left',
          field: (row) => row.start.slice(0, 5),
          sortable: true
        },
        {
          name: 'end',
          required: true,
          label: 'End',
          align: 'left',
          field: (row) => row.end.slice(0, 5),
          sortable: true
        },
        {
          name: 'description',
          required: true,
          label: 'Description',
          align: 'left',
          field: (row) => row.description || '-',
          sortable: true
        },
        {
          name: 'status',
          required: true,
          label: 'Status',
          align: 'left',
          sortable: false
        },
        {
          name: 'actions',
          required: true,
          label: 'Actions',
          align: 'left',
          sortable: false
        }
      ],
      data: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData(id = null) {
      const res = await this.$api.get(
        'delivery_times',
        id ? `id = ${id}` : null,
        'id, start, end, `default`, description, active',
        'start'
      );
      this.$api.set(this.data, res.data);
    },
    async onEditComplete(newData) {
      // if newData contain id, then it will update the existing data.
      // if newData doesn't contain id, it will added as new data
      const res = await this.$api.exec('p_add_delivery_time', [JSON.stringify(newData).replace(/'/g, '`')]);
      this.getData();
      this.showForm = false;
    }
  }
};
</script>
