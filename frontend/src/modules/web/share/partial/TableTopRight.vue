<template>
  <!--
  <div class="row top-row" style="height:36px">
    <div class="q-gutter-xs btn-section">
      <slot name="additional-btn"></slot>
      <q-btn no-caps flat class="btn-add" style="border-radius:24px" @click="$emit('add-click')">Add</q-btn>
    </div>
    <div class="q-gutter-xs search-section">
      <search-input v-model="search" label="Search" />
    </div>
  </div>
  -->
  <div class="row row-right items-center">
    <slot name="additional-btn"></slot>
    <q-btn
      v-if="!hideAddBtn"
      no-caps
      flat
      class="btn-add"
      style="border-radius: 24px"
      @click="$emit('add-click')"
      >Add</q-btn
    >
    <search-input v-model="search" data-cy="search-bar" class="d_search" label="Search" />
  </div>
</template>

<script>
import SearchInput from './SearchInput';
export default {
  props: {
    value: {
      type: String,
      default: null
    },
    hideAddBtn: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SearchInput
  },
  computed: {
    search: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  }
};
</script>
<style scoped>
.row-right {
  justify-content: flex-end;
}
.row-right button {
  margin-bottom: 4px;
  margin-right: 0.35rem;
}
@media (max-width: 990px) {
  .row-right {
    justify-content: unset !important;
  }
  .row-right button {
    margin-bottom: 0.5rem;
    margin-right: 0.5rem;
  }
  .d_search {
    display: block;
    width: 98.9%;
  }
}
</style>
