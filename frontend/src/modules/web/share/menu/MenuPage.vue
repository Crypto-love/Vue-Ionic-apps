<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Menus</div>
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
      <!-- <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <p>{{ props.row.active }}</p>
        </q-td>
      </template>-->
    </q-table>
    <q-dialog v-model="showForm" persistent>
      <my-form :item="selectedItem" @add-complete="onAddComplete" @edit-complete="onEditComplete" />
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
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: (row) => row.name,
          sortable: true
        },
        {
          name: 'label',
          required: true,
          label: 'Label',
          align: 'left',
          field: (row) => row.label,
          sortable: true
        },
        {
          name: 'icon',
          required: true,
          label: 'Icon',
          align: 'left',
          field: (row) => row.icon || '-',
          sortable: true
        },
        {
          name: 'to',
          required: true,
          label: 'To',
          align: 'left',
          field: (row) => row._to || '-',
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
          name: 'parent',
          required: true,
          label: 'Parent',
          align: 'left',
          field: (row) => {
            if (row.parent) {
              return row.parent.label;
            }
            return '-';
          },
          sortable: true
        },
        {
          name: 'actions',
          required: true,
          label: 'Actions',
          align: 'left',
          sortable: false
        }
        // {
        //   name: "active",
        //   required: true,
        //   label: "Active",
        //   align: "left",
        //   sortable: false
        // }
      ],
      data: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData(id = null) {
      const res = await this.$api.get('v_menus', id ? `id = ${id}` : null);
      this.$api.set(this.data, res.data);
    },
    async onAddComplete(newData) {
      const res = await this.$api.add('menus', newData);
      this.getData();
      this.showForm = false;
    },
    async onEditComplete(newData) {
      const res = await this.$api.update('menus', newData, newData.id);
      this.getData();
      this.showForm = false;
    }
  }
};
</script>
