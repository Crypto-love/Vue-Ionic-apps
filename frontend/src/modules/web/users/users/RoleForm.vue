<template>
  <form-card :title="item ? 'Edit Role' : 'Add Role'" class="form-card" scroll-area-height="380">
    <q-form @submit.prevent="onSubmit" id="roleForm">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12">
          <q-select
            v-model="selectedMenu"
            :options="filteredMenus"
            label="Menus *"
            stack-label
            lazy-rules
            :rules="[(val) => !!val || 'Please choose something']"
            option-label="label"
            option-value="id"
            map-options
            use-input
            input-debounce
            @filter="filterMenu"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-xs-12">
          <div class="text-weight-bold">Choose Role:</div>
          <div class="row q-mt-sm justify-between">
            <div class="col-xs-12 col-sm-7">
              <q-option-group v-model="selectedRole" :options="roles" color="green" type="checkbox" inline />
            </div>
            <div class="col-xs-12 col-sm-3">
              <q-toggle v-model="formData.active" label="Activate" :true-value="1" :false-value="0" />
            </div>
          </div>
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" color="red" v-close-popup />
        <q-btn flat label="Save" color="primary" type="submit" form="roleForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import RoleTable from './RoleTable.vue';
import { isEmailValid, isNumeric } from 'services';
export default {
  components: {
    FormCard,
    RoleTable
  },
  props: {
    userId: {
      type: Number,
      default: null
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      menus: [],
      filteredMenus: [],
      selectedMenu: null,
      roles: [
        {
          label: 'View',
          value: '_view'
        },
        {
          label: 'Add',
          value: '_add'
        },
        {
          label: 'Edit',
          value: '_edit'
        },
        {
          label: 'Delete',
          value: '_delete'
        }
      ],
      selectedRole: ['_view', '_add', '_edit', '_delete'],
      formData: {
        id: null,
        user_id: null,
        menu_id: null,
        _view: 1,
        _add: 1,
        _edit: 1,
        _delete: 1,
        active: 1
      }
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },
  watch: {
    selectedMenu(v) {
      this.formData.menu_id = v ? v.id : null;
    },
    selectedRole(v) {
      // Reset checkbox data
      this.formData = {
        ...this.formData,
        _view: 0,
        _add: 0,
        _edit: 0,
        _delete: 0
      };
      v.forEach((vv) => {
        this.formData[vv] = 1;
      });
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.formData.user_id = this.userId;

      await this.getMenus();
      if (this.isEditMode) {
        this.setUpEditData();
      }
    },
    setUpEditData() {
      const { menu, roles, ...selectedFormData } = this.item;
      // Setup Form Data
      this.formData = { ...selectedFormData };

      // Setup Selected Menu
      this.selectedMenu = this.menus.find((v) => v.id === selectedFormData.menu_id);

      // Setup selected Role
      this.selectedRole = [];
      if (selectedFormData['_view'] === 1) this.selectedRole.push('_view');
      if (selectedFormData['_add'] === 1) this.selectedRole.push('_add');
      if (selectedFormData['_edit'] === 1) this.selectedRole.push('_edit');
      if (selectedFormData['_delete'] === 1) this.selectedRole.push('_delete');
    },
    async getMenus() {
      const res = await this.$api.get('menus');
      this.menus = [...res.data];
    },
    onSubmit() {
      if (this.isEditMode) {
        this.$emit('edit-complete', this.formData);
      } else {
        const { id, ...insertPayload } = this.formData;
        this.$emit('add-complete', insertPayload);
      }
    },
    filterMenu(val, update, abort) {
      if (val === '') {
        update(() => {
          this.filteredMenus = this.menus;
        });
        return;
      }
      this.selectedMenu = null;
      update(() => {
        const needle = val.toLowerCase();
        this.filteredMenus = this.menus.filter((v) => v.label.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>

<style scoped>
.form-card {
  width: 480px !important;
  height: 340px !important;
  min-width: unset !important;
}

@media only screen and (max-width: 400px) {
  .form-card {
    height: 390px !important;
  }
}
</style>
