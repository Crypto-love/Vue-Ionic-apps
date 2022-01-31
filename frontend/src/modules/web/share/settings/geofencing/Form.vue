<template>
  <form-dialog :title="item ? 'Edit Zone' : 'Add New Zone'" id="FormMaster" class="form-master modal-sm">
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row justify-between">
        <div class="col-9 q-mb-md">
          <label class="form-label">Name *</label>
          <q-input
            v-model="formData.name"
            lazy-rules
            :rules="[(val) => !!val || 'Please type something']"
            dense
            placeholder="Name "
          />
        </div>
        <div class="col-3 field-active">
          <label class="toggle-label">Active</label>
          <q-toggle v-model="formData.active" :false-value="0" :true-value="1" />
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <q-input
            v-model="formData.description"
            type="textarea"
            dense
            style="height: 70px; width: 100%"
            class="textarea"
            placeholder="Description"
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn flat label="Save" type="submit" class="btn-save" form="myForm" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import FormDialog from 'web/share/partial/FormDialog.vue';

export default {
  components: {
    FormCard,
    FormDialog
  },
  props: {
    item: {
      type: Object,
      default: null
    },
    polygonPaths: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      submitLoading: false,
      formData: {
        name: null,
        description: null,
        active: 1
      }
    };
  },
  computed: {
    isEditMode() {
      return this.item != null;
    }
  },
  mounted() {
    if (this.isEditMode) {
      this.formData = { ...this.item };
    }
  },
  methods: {
    onSubmit() {
      this.submitLoading = true;
      const payload = { ...this.formData, paths: JSON.stringify(this.polygonPaths) };
      if (this.item != null) {
        this.$emit('edit-complete', payload);
      } else {
        this.$emit('add-complete', payload);
      }
    }
  }
};
</script>

<style scoped>
.toggle-label {
  color: #131313;
  font-weight: 500;
  display: block;
  text-align: right;
  padding-right: 10px;
}

.field-active {
  text-align: right;
}

.form-label {
  font-weight: 500;
  color: #131313;
}

.q-placeholder::placeholder {
  color: inherit;
  opacity: 0.35 !important;
}
</style>
