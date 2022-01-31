import { isLogged } from 'services';

const routes = [
  {
    path: '/',
    meta: { auth: true },
    component: () => import(`web/share/Main.vue`),
    beforeEnter: (to, from, next) => {
      if (isLogged()) {
        next('/main');
      } else next();
    }
  },
  {
    path: '/login',
    meta: { auth: false },
    component: () => import(`web/share/login/LoginPage.vue`),
    beforeEnter: (to, from, next) => {
      if (isLogged()) {
        next(`/main`);
      } else next();
    }
  },
  {
    path: '/main',
    meta: { auth: true },
    component: () => import(`web/share/Main.vue`),
    children: [
      {
        path: '/main/users/internal_users',
        meta: { auth: true },
        component: () => import(`web/users/UserPage.vue`)
      },
      {
        path: '/main/users/groupbuy_users',
        meta: { auth: true },
        component: () => import(`web/users/GroupBuyUser.vue`),
        props: true
      },
      {
        path: '/main/users/business_users',
        meta: { auth: true },
        component: () => import(`web/users/BusinessUser.vue`),
        props: true
      },
      {
        path: '/main/users/hosts/approval',
        meta: { auth: true },
        component: () => import(`web/advocates/AdvocatesPage.vue`)
      },
      {
        path: '/main/users/hosts/new',
        meta: { auth: true },
        component: () => import(`web/advocates/AdvocateNew.vue`)
      },
      {
        path: '/main/users/hosts/approval/:id',
        meta: { auth: true },
        component: () => import(`web/advocates/AdvocateDetailPage.vue`),
        props: true
      },
      {
        path: '/main/users/supplier_user/:id/:type',
        meta: { auth: true },
        component: () => import(`web/users/TenantUserDetail.vue`),
        props: true
      },
      {
        path: '/main/users/supplier_user/:id/:type/edit',
        meta: { auth: true },
        component: () => import(`web/users/TenantUserEdit.vue`),
        props: true
      },
      {
        path: '/main/users/new/:type',
        meta: { auth: true },
        component: () => import(`web/users/TenantNewUser.vue`),
        props: true
      },
      {
        path: '/main/supplier/all_supplier',
        meta: { auth: true },
        component: () => import(`web/customers/TenantsPage.vue`)
      },
      {
        path: '/main/supplier/supplier/:supplierId',
        meta: { auth: true },
        component: () => import(`web/customers/TenantsStatesPage.vue`),
        props: (route) => {
          const supplierId = Number.parseInt(route.params.supplierId);
          if (Number.isNaN(supplierId)) {
            return 0;
          }
          return { supplierId };
        }
      },
      {
        path: '/main/supplier/new',
        meta: { auth: true },
        component: () => import(`web/customers/TenantNewPage.vue`),
        props: true
      },
      {
        path: '/main/supplier/supplier/edit/:id',
        meta: { auth: true },
        component: () => import(`web/customers/TenantEditPage.vue`),
        props: true
      },
      {
        path: '/main/supplier/supplier/:id/edit',
        meta: { auth: true },
        component: () => import(`web/customers/TenantsStatesEditPage.vue`),
        props: true
      },
      {
        path: '/main/supplier/connects',
        meta: { auth: true },
        component: () => import(`web/customers/ConnectTenantsPage.vue`)
      },
      {
        path: '/main/supplier/connects/tagstenantcustomers',
        meta: { auth: true },
        component: () => import('web/customers/tenants/TagsTenantCustomers.vue')
      },
      {
        path: '/main/customers',
        meta: { auth: true },
        component: () => import(`web/customers/CustomersPage.vue`)
      },
      {
        path: '/main/hubs/all_hubs',
        meta: { auth: true },
        component: () => import(`web/customers/HubsPage.vue`)
      },
      {
        path: '/main/hubs/all_sprees',
        meta: { auth: true },
        component: () => import(`web/hubs/HubSpreePage.vue`)
      },
      {
        path: '/main/products/b2b_products',
        meta: { auth: true },
        component: () => import(`web/products/b2b_products/ProductPage.vue`)
      },
      {
        path: '/main/products/b2c_products',
        meta: { auth: true },
        component: () => import(`web/products/b2c_products/ProductPage.vue`)
      },
      {
        path: '/main/products/inventories',
        meta: { auth: true },
        component: () => import(`web/products/b2b_products/InventoryPage.vue`)
      },
      {
        path: '/main/products/master_products',
        meta: { auth: true },
        component: () => import(`web/products/b2b_products/MasterProductPage.vue`)
      },
      {
        path: '/main/products/approval_admin',
        meta: { auth: true },
        component: () => import(`web/products/b2b_products/RequestNewProductsAdmin.vue`)
      },
      {
        path: '/main/products/approval_tenant',
        meta: { auth: true },
        component: () => import(`web/products/b2b_products/RequestNewProductsTenant.vue`)
      },
      {
        path: '/main/products/legacy_stock_location',
        meta: { auth: true },
        component: () => import(`web/products/legacyStockLocation.vue`)
      },
      {
        path: '/main/orders/merchant_orders',
        meta: { auth: true },
        component: () => import(`web/orders/b2b_orders/OrdersPage.vue`)
      },
      {
        path: '/main/orders/groupbuy_orders',
        meta: { auth: true },
        component: () => import(`web/orders/b2c_orders/OrderHubsPage.vue`)
      },
      {
        path: '/main/logistics/consolidations',
        meta: { auth: true },
        component: () => import(`web/consolidation/ConsolidationPage.vue`)
      },
      {
        path: '/main/logistics/geofencing/zones',
        meta: { auth: true },
        component: () => import('web/share/settings/geofencing/GeofencingPage.vue')
      },
      {
        path: '/main/internal_approval',
        meta: { auth: true },
        component: () => import(`web/products/quotations/QuotationsPage.vue`)
      },
      {
        path: '/main/customer_request',
        meta: { auth: true },
        component: () => import(`web/products/quotations/QuotationRequestPage.vue`)
      },
      {
        path: '/main/coming-soon',
        meta: { auth: true },
        component: () => import(`web/share/partial/ComingSoonFlat.vue`)
      },
      //setting
      {
        path: '/main/masters/:page',
        meta: { auth: true },
        component: () => import('web/share/master/MasterData.vue')
      }
    ]
  },
  {
    path: '/faq',
    beforeEnter() {
      location.href = 'https://blog.thetreedots.com/frequently-asked-questions/';
    }
  },
  {
    path: '/storage/*',
    component: () => import(`web/share/ViewFile.vue`)
  },
  /** Not working */
  // {
  //   path: "/api/xero/login",
  //   beforeEnter() {
  //     window.location.reload(true);
  //   },
  //   component: null,
  // },
  {
    path: '/404',
    meta: { auth: true },
    component: () => import(`web/share/partial/Error404.vue`)
  },
  {
    path: '/be-treedots-family',
    meta: { auth: false },
    component: () => import('web/share/signup/BuyerRegisterPage.vue')
  },
  {
    path: '/join-as-supplier',
    meta: { auth: false },
    component: () => import('web/share/signup/SupplierRegisterPage.vue')
  },
  {
    path: '/confirmation-order',
    meta: { auth: false },
    component: () => import('web/orders/b2b_orders/ConfirmationOrderPage.vue')
  }
];
// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import(`web/share/partial/Error404.vue`)
  });
}

export default routes;
