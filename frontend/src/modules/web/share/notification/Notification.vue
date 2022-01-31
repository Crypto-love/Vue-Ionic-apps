<template>
  <q-layout view="hHh lpR lFf">
    <q-header class="bg-white" style="overflow: hidden">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" class="text-black" size="12px" @click="back" />
        <div class="row q-px-sm text-h6 items-center text-black full-width" style="height: 56px">
          <div class="col q-mr-md">Notification</div>
        </div>
      </q-toolbar>

      <q-tabs v-model="activeTab" class="text-grey" align="justify" active-color="primary" dense no-caps>
        <q-route-tab
          name="transaction"
          label="Transaction"
          class="no-long-tap"
          replace
          to="/notification/transactions"
        />
        <q-route-tab
          name="quotation"
          label="Quotation"
          class="no-long-tap"
          replace
          to="/notification/quotations"
        />
      </q-tabs>
      <q-separator color="grey-2" />
    </q-header>

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
      activeTab: 'transaction' // `transaction` & `quotation`
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
