<template>
  <form-card
    :title="item ? 'Edit Category' : 'Add Category'"
    class="category-form"
    style="width: 350px !important; height: 250px !important; min-width: unset !important; overflow: hidden"
  >
    <q-form>
      <div class="row">
        <div class="col-12 q-pb-md">
          <q-select
            outlined
            v-model="main_id"
            :options="filteredMain"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            use-input
            clearable
            label="Main Category *`"
            dense="dense"
            @filter="filterMain"
          />
        </div>
        <div class="col-12 q-pb-md">
          <q-select
            outlined
            v-model="sub_id"
            :options="filteredSub"
            option-label="name"
            option-value="id"
            map-options
            emit-value
            use-input
            clearable
            label="Sub Category *"
            dense="dense"
            @filter="filterSub"
          />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel" v-close-popup />
        <q-btn flat label="Save" class="btn-save" @click="onSubmit" />
      </template>
    </template>
  </form-card>
</template>

<script>
import FormCard from 'web/share/partial/FormCard.vue';
import { Api, Notice } from 'services';
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
      main_id: null,
      sub_id: null,
      mainCategory: [],
      subCategory: [],
      filteredMain: [],
      filteredSub: []
    };
  },
  mounted() {
    this.getMainCategory();
    this.getSubCategory();
    if (this.item) {
      this.main_id = this.item.main_category_id;
      this.sub_id = this.item.sub_category_id;
    }
  },
  destroyed() {
    this.$emit('destroy');
  },
  methods: {
    filterMain(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.filteredMain = this.mainCategory;
        } else if (needle.length >= 2) {
          this.filteredMain = this.mainCategory.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    filterSub(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === '') {
          this.filteredSub = this.subCategory;
        } else if (needle.length >= 2) {
          this.filteredSub = this.subCategory.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
        }
      });
    },
    async onSubmit() {
      if (this.item) {
        const payload = {
          id: this.item.id,
          main_category_id: this.main_id,
          sub_category_id: this.sub_id
        };
        this.$emit('edit-complete', payload);
      } else {
        const payload = {
          main_category_id: this.main_id,
          sub_category_id: this.sub_id
        };
        this.$emit('add-complete', payload);
      }
    },
    async getMainCategory() {
      try {
        const res = await Api.get('main_categories');
        this.mainCategory = res.data;
        this.filteredMain = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    },
    async getSubCategory() {
      try {
        const res = await Api.get('sub_categories');
        this.subCategory = res.data;
        this.filteredSub = res.data;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
