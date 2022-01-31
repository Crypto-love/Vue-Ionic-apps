<template>
  <q-page padding>
    <div class="data-header">
      <div class="header-left">
        <div class="top-header">
          <div class="text-title text-h6">Request New Products Admin</div>
          <div class="text-caption d-none">You can edit data by clicking on corresponding column value</div>
        </div>
      </div>
      <div class="header-right">
        <div class="row top-row" style="height: 36px">
          <div class="search-section">
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
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            size="sm"
            class="cursor-pointer"
            @click="
              selectedItem = props.row;
              showProductForm = true;
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
            :false-value="2"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="showProductForm" persistent full-height>
      <product-form :item="selectedItem" @add-complete="onAddComplete" @edit-complete="onEditComplete" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Api, Notice } from 'services';
import SearchInput from 'web/share/partial/SearchInput.vue';
import ConfirmMessage from 'web/share/partial/ConfirmMessage.vue';
import ProductForm from './products/ProductForm.vue';

export default {
  components: {
    SearchInput,
    ProductForm
  },
  data() {
    return {
      showProductForm: false,
      selectedItem: null,
      filter: null,
      selected: [],
      isLoading: false,
      unapprove: null,
      columns: [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name',
          sortable: true
        },
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
          name: 'tenant_name',
          align: 'left',
          label: 'Tenant',
          field: 'tenant_name',
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
        const res = await Api.get('v_products_new', 'active = 2', null, 'id desc');
        this.data = [...res.data];
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async onAddComplete(newData) {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      const res = await Api.add('products', newData);
      if (res.status) {
        Notice.ok('Add products');
        this.getData();
      } else {
        Notice.fail('Add products');
      }
      this.$q.loading.hide();
      this.showProductForm = false;
      this.selectedItem = null;
    },
    async onEditComplete(newData) {
      this.$q.loading.show({
        message: 'Please wait...'
      });
      const res = await Api.update('products', newData, newData.id);
      if (res.status) {
        Notice.ok('Update products');
        this.getData();
      } else {
        Notice.fail('Update products');
      }
      this.$q.loading.hide();
      this.showProductForm = false;
      this.selectedItem = null;
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 2 : 1;
      try {
        const res = await Api.update('products', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
<style scoped>
.top-right-inline {
  display: flex;
}
.top-right-inline .act-btn {
  margin-left: 0.5rem;
  border-radius: 0.35rem;
  margin-bottom: 0.5rem;
}
.td-table thead th {
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #dedede !important;
}
.td-table tbody td {
  position: relative;
  height: auto;
  padding: 0.15rem 1rem;
}
@media (max-width: 480px) {
  .top-right-inline {
    display: block;
  }
  .top-right-inline .top-actions {
    display: block;
    width: 100%;
    text-align: center;
  }
  .top-right-inline .act-search {
    display: block;
    width: 100%;
    margin-left: 0;
  }
  .q-table__control {
    display: block !important;
    width: 100%;
  }
}
</style>
