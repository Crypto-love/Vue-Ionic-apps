<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">{{ title }}</div>
          <div class="text-caption">You can edit data by clicking on corresponding column value</div>
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
      :data="data"
      :columns="columns"
      row-key="id"
      :filter="filter"
      :pagination.sync="pagination"
      class="tdots-table"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
            <q-popup-edit
              v-model="props.row.name"
              buttons
              label-set="Save"
              label-cancel="Close"
              :validate="nameValidation"
              @hide="nameValidation"
              @save="edit(props.row)"
            >
              <q-input
                v-model="props.row.name"
                dense
                autofocus
                :error="errorName"
                :error-message="errorMessageName"
              />
            </q-popup-edit>
          </q-td>
          <q-td key="description" :props="props">
            {{
              props.row.description
                ? props.row.description.length > 50
                  ? props.row.description.substring(0, 50) + '...'
                  : props.row.description
                : '-'
            }}
            <q-popup-edit
              v-model="props.row.description"
              @save="edit(props.row)"
              buttons
              label-set="Save"
              label-cancel="Close"
            >
              <q-input v-model="props.row.description" type="textarea" dense autofocus />
            </q-popup-edit>
          </q-td>
          <q-td key="active" :props="props">
            <q-toggle
              :value="props.row.active === 1"
              checked-icon="check"
              color="primary"
              unchecked-icon="clear"
              @input="onToggleClick(props.row)"
            />
          </q-td>
        </q-tr>
      </template>
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
    MyForm,
    TableTopRight
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
          name: 'id',
          required: true,
          label: 'Id',
          align: 'left',
          field: (row) => row.id,
          sortable: true
        },
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: (row) => row.name,
          sortable: true
        },
        {
          name: 'description',
          required: true,
          label: 'Description',
          align: 'left',
          field: (row) => row.description,
          sortable: true
        },
        {
          name: 'active',
          required: true,
          label: 'Active',
          align: 'left',
          field: (row) => row.active,
          sortable: true
        }
      ],
      data: []
    };
  },
  computed: {
    title() {
      let result = this.$route.params.page
        .split('_')
        .map((v) => this.capitalize(v))
        .join(' ');
      return this.capitalize(result);
    }
  },
  created() {
    this.checkTable();
    this.getData();
  },
  watch: {
    // call again the method if the route changes
    $route(to, from) {
      this.data = [];
      this.getData();
    }
  },
  methods: {
    async checkTable() {
      const res = await this.$api.exec('p_info', [`${this.$route.params.page}`], 'read');
      if (res.data.length <= 0) {
        this.$router.replace('/404');
      }
    },
    async getData() {
      const res = await this.$api.get(this.$route.params.page);
      this.$api.set(this.data, res.data);
    },
    capitalize(sentence) {
      return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    },
    async onAddComplete(newData) {
      const res = await this.$api.add(this.$route.params.page, newData);
      this.$api.set(this.data, res.data);
      this.showForm = false;
    },
    onEditComplete(newData) {
      this.edit(newData);
      this.showForm = false;
    },
    onToggleClick(row) {
      const newActive = row.active ? 0 : 1;
      this.edit({ ...row, active: newActive });
    },
    async edit(payload) {
      const res = await this.$api.update(this.$route.params.page, payload, payload.id);
      this.$api.set(this.data, res.data);
    },
    nameValidation(val) {
      if (val === '') {
        this.errorName = true;
        this.errorMessageName = 'Please input some value';
        return false;
      }
      this.errorName = false;
      this.errorMessageName = '';
      return true;
    }
  }
};
</script>
