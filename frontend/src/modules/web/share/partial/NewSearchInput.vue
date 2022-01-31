<template>
  <div class="section-search-filter">
    <div class="sec-search">
      <q-input
        color="grey-3"
        borderless
        v-model="filter"
        placeholder="Search for the product name, code, etc"
        style="height: 32px; background: #f4f6f8; padding: 0 0.5rem; border-radius: 4px"
      >
        <template v-slot:append>
          <q-icon class="icon-color" v-if="filter === ''" name="search" />
          <q-icon v-else name="clear" class="cursor-pointer icon-color" @click="filter = ''" />
        </template>
      </q-input>
    </div>
  </div>
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
    filter: {
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
.section-search-filter {
  position: relative;
}
.section-search-filter .sec-search {
  position: relative;
  width: 350px;
}
.section-search-filter .sec-filter {
  width: 285px;
}
.icon-color {
  color: #03222f;
}
@media (max-width: 576px) {
  .section-search-filter {
    display: block !important;
  }
  .section-search-filter .sec-search {
    margin-bottom: 0.5rem;
    width: 92vw;
    align-items: center;
  }
  .section-search-filter .sec-filter {
    width: 100% !important;
    max-width: unset;
  }
}
@media (max-width: 991px) {
  .section-search-filter .sec-separator {
    display: none;
  }
}
</style>
