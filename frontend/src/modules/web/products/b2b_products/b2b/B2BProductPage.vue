<template>
  <q-layout class="q-pa-md" view="hHh lpR lFf">
    <div class="container">
      <div class="top-head">
        <div class="row">
          <div class="col">
            <q-tabs
              v-model="activeTab"
              dense
              align="left"
              class="text-grey"
              active-color="teal-10"
              indicator-color="teal-10"
              style="position: relative; border-bottom: 1px solid #e1e4e6"
            >
              <q-route-tab
                name="all"
                label="All Products"
                class="tab"
                style="padding-bottom: 0.5rem"
                to="/main/b2b/b2b_products"
                exact
              />

              <q-route-tab
                name="available"
                label="Available"
                class="tab"
                style="padding-bottom: 0.5rem"
                to="/main/b2b/b2b_products/b2b_available_products"
                exact
              />

              <q-route-tab
                name="out"
                label="Out Of Stock"
                class="tab"
                style="padding-bottom: 0.5rem"
                to="/main/b2b/b2b_products/b2b_out_of_stock"
                exact
              />
            </q-tabs>
          </div>
          <div class="col top-head-right">
            <!-- <div class="new-product-box">
              <q-btn class="btn-new" unelevated>
                <q-icon name="eva-plus-outline" size="16px"></q-icon>
                <span class="btn-new-label">Add New Product</span>
              </q-btn>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Content Data -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script>
export default {
  data() {
    return {
      credentials: this.$store.state,
      activeTab: 'all'
    };
  },
  mounted() {
    document.addEventListener('backbutton', this.back, false);
  },

  destroyed() {
    document.removeEventListener('backbutton', this.back, false);
  },

  methods: {
    back() {
      window.history.back();
    }
  }
};
</script>
<style scoped>
.top-head {
  background: #ffffff;
  position: relative;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  z-index: 2;
  padding: 0.35rem 0;
}
.top-head-right {
  max-width: 170px;
  text-align: right;
  border-bottom: 1px solid #e1e4e6;
}
.content {
  z-index: 2;
}
.tab {
  text-transform: none !important;
}
.btn-new {
  background: #f29727;
  color: #ffffff;
  text-transform: none;
  font-size: 0.825rem !important;
}
.oos-badge {
  right: -25px;
  top: 0.4rem;
}
@media (max-width: 991px) {
  .top-head-right {
    max-width: 55px !important;
  }
  .btn-new-label {
    display: none;
  }
}
</style>
