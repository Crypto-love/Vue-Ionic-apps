<template>
  <div class="sec-filter">
    <div class="text-right">
      <q-btn-dropdown unelevated icon="eva-funnel" class="btn-filter q-mr-sm" label="Filter">
        <div class="filter-box no-wrap q-pa-md" style="width: 275px">
          <div
            class="filter-head"
            style="padding: 0 0 5px 0; margin-bottom: 0.5rem; border-bottom: 1px solid #dedede"
          >
            <div class="row">
              <div class="col">
                <div class="title" style="font-weight: 500; padding: 3px 0 0 0">Filter Based</div>
              </div>
              <div class="col text-right">
                <q-btn
                  flat
                  padding="none sm"
                  color="teal-10"
                  size="md"
                  label="Reset"
                  style="text-transform: none"
                />
              </div>
            </div>
          </div>
          <div class="filter-body">
            <div class="row">
              <div class="col" style="border-right: 1px solid #dedede">
                <div class="filter-subtitle">Category Item</div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter1" class="checkbox" label="Meats" color="teal" />
                </div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter2" class="checkbox" label="Seafoods" color="teal" />
                </div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter3" class="checkbox" label="Snacks" color="teal" />
                </div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter4" class="checkbox" label="Fruits" color="teal" />
                </div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter5" class="checkbox" label="Vegetables" color="teal" />
                </div>
                <div class="q-pb-xs">
                  <q-checkbox dense v-model="filter6" class="checkbox" label="Others" color="teal" />
                </div>
              </div>
              <div class="col">
                <div class="q-pl-md">
                  <div class="filter-subtitle">Halal Type</div>
                  <div class="q-pb-xs">
                    <q-checkbox dense v-model="filter7" class="checkbox" label="Halal" color="teal" />
                  </div>
                  <div class="q-pb-xs">
                    <q-checkbox dense v-model="filter8" class="checkbox" label="Non Halal" color="teal" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-btn-dropdown>
      <q-btn-dropdown
        flat
        push
        no-caps
        style="background: #f4f6f8; color: #03222f; height: 32px; text-transform: none"
      >
        <template v-slot:label>
          <div class="row items-center no-wrap">
            <div class="text-center">Sort</div>
          </div>
        </template>
        <q-list>
          <q-item clickable>
            <q-item-section>Product Name (A-Z)</q-item-section>
          </q-item>
          <q-item clickable>
            <q-item-section>Product Name (Z-A)</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tab: 'all',
      filter: '',
      filter1: false,
      filter2: false,
      filter3: false,
      filter4: false,
      filter5: false,
      filter6: false,
      filter7: false,
      filter8: false
    };
  },
  computed: {}
};
</script>
<style scoped>
.btn-filter {
  background: #f4f6f8;
  color: #03222f;
  height: 32px;
  text-transform: none;
}
.filter-body .filter-subtitle {
  text-transform: uppercase;
  color: #a2acb5;
  font-size: 0.625rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
.filter-body .checkbox {
  font-size: 0.72rem;
}
</style>
