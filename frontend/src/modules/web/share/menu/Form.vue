<template>
  <form-card
    :title="item ? 'Edit Data' : 'Add Data'"
    style="width: 600px !important; height: 580px !important; min-width: unset !important; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-toggle v-model="setAsChild" color="primary" left-label label="Set As Child" />
          <q-input
            v-model="formData.name"
            label="Name *"
            class="form-group"
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
            dense
          />
          <q-input
            v-model="formData.label"
            label="Label *"
            class="form-group"
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
            dense
          />
          <q-input v-model="formData.icon" label="Icon" class="form-group" :disable="setAsChild" dense />
          <q-input v-model="formData._to" label="To *" class="form-group" lazy-rules dense />
          <q-input
            v-model="formData.description"
            label="Description"
            class="form-group"
            type="textarea"
            style="max-height: 80px"
            dense
          />
          <q-select
            v-model="formData.menu_id"
            :options="parents"
            label="Parents *"
            class="form-group"
            option-label="label"
            option-value="id"
            map-options
            emit-value
            :disable="!setAsChild"
            :rules="parentRules"
            dense
          />
          <q-toggle v-model="formData.active" color="primary" label="Active" />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn flat label="Save" class="btn-save" type="submit" form="myForm" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import { Api, isNumeric } from 'services';

export default {
  components: {
    FormCard
  },
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      formData: {
        name: null,
        label: null,
        icon: null,
        _to: null,
        description: null,
        menu_id: null,
        active: true
      },
      setAsChild: false,
      parents: []
    };
  },
  computed: {
    isEditMode() {
      return this.item !== null;
    },
    parentRules() {
      return [
        (val) => {
          if (this.setAsChild && val === null) {
            return 'Please Choose Something';
          }
          return true;
        }
      ];
    }
  },
  mounted() {
    this.getParents();
    if (this.isEditMode) {
      this.formData = {
        name: this.item.name,
        label: this.item.label,
        icon: this.item.icon,
        _to: this.item._to,
        description: this.item.description,
        menu_id: this.item.menu_id,
        active: this.item.active === 1
      };
      if (this.item.menu_id !== null) {
        this.setAsChild = true;
      }
    }
  },
  methods: {
    async getParents() {
      const res = await Api.get('menus', 'menu_id IS NULL');
      Api.set(this.parents, res.data);
    },
    onSubmit() {
      this.submitLoading = true;
      const payload = { ...this.formData };
      if (this.item) {
        payload.id = this.item.id;
        this.$emit('edit-complete', payload);
      } else {
        this.$emit('add-complete', payload);
      }
    }
  },
  watch: {
    setAsChild(val) {
      if (!val) {
        this.formData.menu_id = null;
      } else {
        this.formData.icon = null;
      }
    }
  }
};
</script>
<style scoped>
.form-group {
  margin-bottom: 0.85rem;
}
</style>
