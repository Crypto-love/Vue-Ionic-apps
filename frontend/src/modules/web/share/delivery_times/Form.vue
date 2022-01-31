<template>
  <form-card
    :title="item ? 'Edit Data' : 'Add Data'"
    style="width: 400px !important; height: 380px !important; min-width: unset !important; overflow: hidden"
  >
    <q-form @submit.prevent="onSubmit" id="myForm">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <div class="row">
            <div class="col">
              <q-input
                v-model="formData.start"
                dense
                type="time"
                label="Start"
                :rules="[(val) => !!val || 'Field cannot be empty']"
              />
            </div>
            <div class="col-auto q-px-lg" />
            <div class="col">
              <q-input
                v-model="formData.end"
                dense
                type="time"
                label="End"
                :rules="[
                  (val) => !!val || 'Field cannot be empty',
                  (val) =>
                    (formData.start &&
                      parseInt(val.replace(':', '')) >= parseInt(formData.start.replace(':', ''))) ||
                    'End time must be higher than start time',
                  (val) => !isExist(val) || 'Times already exist'
                ]"
              />
            </div>
          </div>

          <q-input
            v-model="formData.description"
            label="Description"
            class="form-group q-mt-md"
            type="textarea"
            style="max-height: 100px"
            dense
          />
          <div class="row">
            <q-toggle
              v-model="formData.default"
              color="primary"
              label="Default"
              :true-value="1"
              :false-value="0"
              :disable="(isEditMode && item.default == 1) || !formData.active == 1"
            />
            <q-toggle
              v-model="formData.active"
              color="primary"
              label="Active"
              :true-value="1"
              :false-value="0"
              :disable="(isEditMode && item.default == 1) || formData.default == 1"
            />
          </div>
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
    existingTimes: {
      default: []
    },
    item: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      submitLoading: false,
      formData: {
        start: null,
        end: null,
        description: null,
        default: 0,
        active: 1
      },
      parents: []
    };
  },

  computed: {
    isEditMode() {
      return this.item !== null;
    }
  },

  created() {
    if (this.isEditMode) this.formData = { ...this.item };
  },

  methods: {
    isExist(val) {
      const time = this.existingTimes.find((time) => {
        if (this.item)
          return (
            this.item.id != time.id &&
            time.start.indexOf(this.formData.start) >= 0 &&
            time.end.indexOf(val) >= 0
          );
        else return time.start.indexOf(this.formData.start) >= 0 && time.end.indexOf(val) >= 0;
      });

      return time ? true : false;
    },

    onSubmit() {
      this.submitLoading = true;

      // if newData contain id, then it will update the existing data.
      // if newData doesn't contain id, it will added as new data
      const payload = { ...this.formData };

      this.$emit('edit-complete', payload);
    }
  }
};
</script>
<style scoped>
.form-group {
  margin-bottom: 0.85rem;
}
</style>
