<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <div class="row no-wrap">
        <q-toolbar class="bg-white">
          <q-btn
            flat
            dense
            round
            @click="leftDrawerOpen = !leftDrawerOpen"
            icon="menu"
            aria-label="Menu"
            color="grey"
          />

          <q-img
            id="logo"
            class="q-ma-xs q-ml-sm"
            src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/main-logo.png"
            style="max-width: 142px"
          />
          <q-toolbar-title></q-toolbar-title>

          <search-input
            v-model="search"
            label="Search"
            rounded
            outline
            style="width: 50%"
            v-show="$route.path === '/main'"
            v-if="isSuperAdmin || isAdmin"
          />
          <q-toolbar-title></q-toolbar-title>
          <q-separator dark vertical />
          <q-btn
            stretch
            flat
            :label="selectedCompanyName"
            color="black"
            icon-right="eva-settings-2-outline"
            @click="onClickTenant"
            v-if="isSuperAdmin || isAdmin"
          />
          <q-separator dark vertical />

          <q-btn
            alert="primary"
            icon="eva-bell"
            flat
            round
            text-color="grey"
            v-if="isSuperAdmin || isAdmin"
          />
          <!-- <q-btn
            flat
            dense
            round
            @click="rightDrawerOpen = !rightDrawerOpen"
            icon="eva-activity"
            aria-label="Menu"
            text-color="grey"
            v-if="isSuperAdmin || isAdmin"
          /> -->
        </q-toolbar>
      </div>
      <!-- showing red dot on no connection -->
      <server-state v-if="serverStatus === false" />
    </q-header>
    <menu-drawer v-model="leftDrawerOpen" />
    <!-- <right-drawer v-model="rightDrawerOpen" v-if="isSuperAdmin || isAdmin" /> -->
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="showSelectTenantDialog" persistent>
      <select-tenant-dialog @on-submit="onSelectTenant" />
    </q-dialog>
  </q-layout>
</template>

<script>
import MenuDrawer from '../share/partial/MenuDrawer.vue';
// import RightDrawer from '../share/partial/RightDrawer.vue';
import SearchInput from '../share/partial/SearchInput.vue';
import ServerState from '../share/partial/ServerState.vue';
import SelectTenantDialog from '../share/partial/SelectTenantDialog.vue';
import AlertMessage from '../share/partial/AlertMessage.vue';
import { getUserCustomerDetails } from 'treeGQL';

export default {
  name: 'MyLayout',
  components: {
    MenuDrawer,
    // RightDrawer,
    SearchInput,
    ServerState,
    SelectTenantDialog
  },

  data() {
    return {
      credential: this.$store.state,
      leftDrawerOpen: false,
      // rightDrawerOpen: false,
      search: '',
      serverStatus: true,
      showSelectTenantDialog: false
    };
  },

  computed: {
    selectedCompanyName() {
      return this.credential.tenant ? this.credential.tenant : '';
    },
    isSuperAdmin() {
      return this.credential.user_type_id == 1;
    },
    isAdmin() {
      return this.credential.user_type_id == 2;
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      /* attach to socket events */
      this.$s.setEvents('serverstatus', this.onServerStateChange);

      if (!this.selectedCompanyName && this.isSuperAdmin) {
        if (this.$router.currentRoute.path != '/main') this.$router.replace('/main');

        this.showSelectTenantDialog = true;
      }
      this.loadUserCustomerData();
    },
    async loadUserCustomerData() {
      //store user customer data when login not admin
      const user_customers = await this.getUserCustomerDetails();
      this.$store.state.customers = user_customers?.data?.getUserCustomers?.customer;

      // if (this.$store.state.user_type_id == 11 && this.$store.state.customers.length < 2) {
      //   this.$store.commit('clearStore');
      //   throw 'Please link this advocate with some hubs first!';
      // }
    },
    onServerStateChange(status) {
      this.serverStatus = status;
    },
    onClickTenant() {
      if (this.isSuperAdmin) this.showSelectTenantDialog = true;
      else this.$router.replace('/main/b2b/tenant_settings');
    },
    onSelectTenant(selectedTenant) {
      this.showSelectTenantDialog = false;

      //check if selected tenant already have address
      if (selectedTenant.country == null) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: `Tenant Info`,
          message: `Please update tenant address. This tenant dont have address info, so cant load country and currency`
        });

        this.$router.replace('/main/b2b/tenant_settings');
        return;
      }

      this.credential = {
        ...this.$store.state,
        ...selectedTenant
      };

      this.$store.commit('setUser', this.credential);

      location.reload();
    },
    async getUserCustomerDetails() {
      this.isLoading = true;
      try {
        return await this.$apollo
          .query({
            query: getUserCustomerDetails
          })
          .catch((err) => {
            this.isLoading = false;
            this.$q.loading.hide();
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.isLoading = false;
        this.$q.loading.hide();
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    }
  }
};
</script>
<style scoped>
.toolbar-left {
  width: 288px;
  background-color: #f8f8f8;
}
.toolbar-right {
  width: calc(100% - 288px);
}

@media only screen and (max-width: 425px) {
  #logo {
    display: none;
  }
  .toolbar-left {
    background-color: white;
    width: 40px;
  }
  .toolbar-right {
    width: calc(100% - 40px);
  }
}
</style>
