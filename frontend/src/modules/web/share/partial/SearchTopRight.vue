<template>
  <q-input
    rounded
    borderless
    dense
    v-model="search"
    input-class="text-left"
    class="q-ml-md search-input"
    :label="label"
  >
    <!-- <template v-slot:prepend>
      <q-icon v-if="search === null || search == ''" name="search" class="search-icon" />
      <q-icon v-else name="clear" class="cursor-pointer search-icon" @click="search = null" />
    </template> -->
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
  background: #ffffff;
  border: 1px solid #f5f5f5;
  padding-left: 0.85rem;
  padding-right: 0.85rem;
  border-radius: 24px;
}
.search-icon {
  color: #04565a;
}
</style>
