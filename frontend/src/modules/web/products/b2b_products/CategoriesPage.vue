<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">All Categories</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
      <div class="header-right">
        <div class="row top-row" style="height: 36px">
          <div class="q-gutter-xs btn-section">
            <q-btn
              flat
              no-caps
              style="border-radius: 24px"
              class="btn-add q-mr-sm"
              @click="
                selectedItem = null;
                showCategoryForm = true;
              "
              >Add</q-btn
            >
            <q-btn
              flat
              no-caps
              style="border-radius: 24px"
              class="btn-add"
              :to="{ path: 'master_products', exact: true }"
              >Master Product</q-btn
            >
          </div>

          <div class="q-gutter-xs search-section">
            <search-input v-model="filter" label="Search" />
          </div>
        </div>
      </div>
    </div>
    <q-table
      :data="data"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :loading="isLoading"
      class="tdots-table"
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            size="sm"
            class="cursor-pointer"
            @click="
              selectedItem = props.row;
              showCategoryForm = true;
            "
          />
          <q-tooltip :offset="[10, 10]">Edit</q-tooltip>
        </q-td>
      </template>

      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="1"
            :false-value="0"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showCategoryForm" persistent full-height>
      <category-form :item="selectedItem" @add-complete="onAddComplete" @edit-complete="onEditComplete" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import CategoryForm from './categories/CategoryForm.vue';

export default {
  components: {
    SearchInput,
    CategoryForm
  },
  data() {
    return {
      showCategoryForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      pagination: {
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'main_category',
          align: 'left',
          label: 'Main Category',
          field: 'main_category',
          sortable: true
        },
        {
          name: 'sub_category',
          align: 'left',
          label: 'Sub Category',
          field: 'sub_category',
          sortable: true
        },
        {
          name: 'actions',
          align: 'center',
          label: 'Actions',
          field: 'actions',
          sortable: false
        },
        {
          name: 'active',
          align: 'center',
          label: 'Active',
          field: 'active',
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
    async getData() {
      this.isLoading = true;
      try {
        const res = await Api.get('v_categories_all', null, null, 'id desc');
        this.data = res.data;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async onAddComplete(newData) {
      const res = await Api.add('categories', newData);
      if (res.status) {
        Notice.ok('Add categories');
        this.getData();
      } else {
        Notice.fail('Add categories');
      }
      this.showCategoryForm = false;
      this.selectedItem = null;
    },
    async onEditComplete(newData) {
      const res = await Api.update('categories', newData, newData.id);
      if (res.status) {
        Notice.ok('Update categories');
        this.getData();
      } else {
        Notice.fail('Update categories');
      }
      this.showCategoryForm = false;
      this.selectedItem = null;
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('categories', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
