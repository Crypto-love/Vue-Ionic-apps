<template>
  <q-input
    dense
    rounded
    borderless
    v-model="search"
    input-class="text-left"
    class="bg-grey-2 search-input"
    :label="label"
    debounce="500"
  >
    <template v-slot:prepend>
      <q-icon v-if="search === null || search == ''" name="eva-search" class="search-icon" />
      <q-icon v-else name="eva-close" class="cursor-pointer search-icon" @click="search = null" />
    </template>
  </q-input>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    }
  },
  data() {
    return {};
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
.search-input {
  border: 1px solid #f5f5f5;
  padding-left: 0.85rem;
  padding-right: 0.85rem;
  border-radius: 24px;
}
.search-input:focus,
.search-input:hover {
  border: 1px solid #f0f0f0;
}
.search-icon {
  color: #04565a;
}
</style>
