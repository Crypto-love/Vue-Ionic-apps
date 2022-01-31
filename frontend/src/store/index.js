import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import SecureLS from 'secure-ls';
const ls = new SecureLS({
  encodingType: 'aes',
  encryptionSecret: `tr33d0ts`
});

Vue.use(Vuex);

const keyStore = '_T_';
let currentValue = ls.get(keyStore);
let objValue = currentValue.length > 0 ? JSON.parse(currentValue) : null;

const Store = new Vuex.Store({
  state: {
    carts: objValue && objValue.carts ? objValue.carts : {},
    customer: objValue && objValue.customer ? objValue.customer : null,
    introOpened: objValue && objValue.introOpened ? objValue.introOpened : false,
    tutorialOpened: objValue && objValue.tutorialOpened ? objValue.tutorialOpened : false,
    version: objValue && objValue.version ? objValue.version : null,
    showHub: objValue && objValue.showHub ? objValue.showHub : false,
    selectedCompany: objValue && objValue.selectedCompany ? objValue.selectedCompany : null,
    previouslySelectedHub: objValue && objValue.previouslySelectedHub ? objValue.previouslySelectedHub : null,
    selectedHub: objValue && objValue.selectedHub ? objValue.selectedHub : null,
    selectedProducts: objValue && objValue.selectedProducts ? objValue.selectedProducts : [],
    totalProducts: objValue && objValue.totalProducts ? objValue.totalProducts : 0,
    token: objValue && objValue.token ? objValue.token : null,
    tokenJWT: objValue && objValue.tokenJWT ? objValue.tokenJWT : null,
    app: objValue && objValue.app ? objValue.app : null,
    ip: objValue && objValue.ip ? objValue.ip : null,
    lang: objValue && objValue.lang ? objValue.lang : 'en-us',
    id: objValue && objValue.id ? objValue.id : 0,
    first_name: objValue && objValue.first_name ? objValue.first_name : '',
    last_name: objValue && objValue.last_name ? objValue.last_name : '',
    email: objValue && objValue.email ? objValue.email : '',
    username: objValue && objValue.username ? objValue.username : '',
    mobile: objValue && objValue.mobile ? objValue.mobile : '',
    gender: objValue && objValue.gender ? objValue.gender : '',
    birth_date: objValue && objValue.birth_date ? objValue.birth_date : '',
    image: objValue && objValue.image ? objValue.image : null,
    user_type_id: objValue && objValue.user_type_id ? objValue.user_type_id : 0,
    user_type: objValue && objValue.user_type ? objValue.user_type : '',
    buyer_type: objValue && objValue.buyer_type ? objValue.buyer_type : 0,
    stripe_customer_id: objValue && objValue.stripe_customer_id ? objValue.stripe_customer_id : null,
    stripe_card_id: objValue && objValue.stripe_card_id ? objValue.stripe_card_id : null,
    customers: objValue && objValue.customers ? objValue.customers : [],
    menus: objValue && objValue.menus ? objValue.menus : [],
    address: objValue && objValue.address ? objValue.address : '',
    unreadNotification: objValue && objValue.unreadNotification ? objValue.unreadNotification : 0,
    tenant: objValue && objValue.tenant ? objValue.tenant : null,
    tenant_id: objValue && objValue.tenant_id ? objValue.tenant_id : null,
    tenant_customer_id: objValue && objValue.tenant_customer_id ? objValue.tenant_customer_id : null,
    xero_tenant_id: objValue && objValue.xero_tenant_id ? objValue.xero_tenant_id : null,
    list_items_select_in_cart:
      objValue && objValue.list_items_select_in_cart ? objValue.list_items_select_in_cart : [],
    list_items_in_cart: objValue && objValue.list_items_in_cart ? objValue.list_items_in_carts : [],
    selected_category: objValue && objValue.selected_category ? objValue.selected_category : null,
    selectedSupplier: objValue && objValue.selectedSupplier ? objValue.selectedSupplier : null,
    selected_card: objValue && objValue.selected_card ? objValue.selected_cards : null,
    chat_unread: objValue && objValue.chat_unread ? objValue.chat_unread : { msg: 0, newHub: 0 },
    chat_handler_id: objValue && objValue.chat_handler_id ? objValue.chat_handler_id : null,
    chat_list: objValue && objValue.chat_list ? objValue.chat_list : [],
    chat_new_msg: objValue && objValue.chat_new_msg ? objValue.chat_new_msg : [],
    selected_voucher: objValue && objValue.selected_voucher ? objValue.selected_voucher : null,
    is_back_from_checkout: objValue && objValue.is_back_from_checkout ? objValue.is_back_from_checkout : null,
    active_sprees: objValue && objValue.active_sprees ? objValue.active_sprees : null,
    isPrevious: objValue && objValue.isPrevious ? true : false,
    listHubFilter: objValue && objValue.listHubFilter ? objValue.listHubFilter : null,
    activeAllProduct: objValue && objValue.activeAllProduct ? objValue.activeAllProduct : false,
    statusBrowse: objValue && objValue.statusBrowse ? objValue.statusBrowse : null,
    tenantData: objValue && objValue.tenantData ? objValue.tenantData : [],
    statesData: objValue && objValue.statesData ? objValue.statesData : []
  },
  plugins: [
    createPersistedState({
      key: keyStore,
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key)
      }
    })
  ],
  mutations: {
    clearStore: (state) => {
      state.carts = {};
      state.customer = null;
      state.selectedCompany = null;
      state.selectedHub = null;
      state.selectedProducts = [];
      state.showHub = false;
      state.tutorialOpened = false;
      state.totalProducts = 0;
      state.token = null;
      state.tokenJWT = null;
      state.app = null;
      state.ip = null;
      state.id = 0;
      state.first_name = '';
      state.last_name = '';
      state.email = '';
      state.username = '';
      state.mobile = '';
      state.gender = '';
      state.birth_date = '';
      state.image = null;
      state.user_type_id = 0;
      state.user_type = '';
      state.buyer_type = 0;
      state.stripe_customer_id = null;
      state.stripe_card_id = null;
      state.customers = [];
      state.menus = [];
      state.address = '';
      state.unreadNotification = 0;
      state.tenant = null;
      state.tenant_id = null;
      state.tenant_customer_id = null;
      state.xero_tenant_id = null;
      state.list_items_select_in_cart = [];
      state.list_items_in_cart = [];
      state.selected_category = null;
      state.selectedSupplier = null;
      state.chat_unread = { msg: 0, newHub: 0 };
      state.chat_handler_id = null;
      state.chat_list = [];
      state.chat_new_msg = [];
      state.selected_card = null;
      state.listHubFilter = null;
      state.activeAllProduct = false;
      state.statusBrowse = null;
      state.tenantData = [];
      state.statesData = [];
    },
    setUser: (state, value) => {
      state.token = value.token ? value.token : null;
      state.tokenJWT = value.tokenJWT ? value.tokenJWT : null;
      state.id = value.id ? value.id : 0;
      state.first_name = value.first_name ? value.first_name : '';
      state.last_name = value.last_name ? value.last_name : '';
      state.email = value.email ? value.email : '';
      state.username = value.username ? value.username : '';
      state.mobile = value.mobile ? value.mobile : '';
      state.gender = value.gender ? value.gender : '';
      state.birth_date = value.birth_date ? value.birth_date : '';
      state.image = value.image ? value.image : null;
      state.user_type_id = value.user_type_id ? value.user_type_id : 0;
      state.user_type = value.user_type ? value.user_type : '';
      state.buyer_type = value.buyer_type ? value.buyer_type : 0;
      state.stripe_customer_id = value.stripe_customer_id ? value.stripe_customer_id : null;
      state.stripe_card_id = value.stripe_card_id ? value.stripe_card_id : null;
      state.address = value.address ? value.address : '';
      state.unreadNotification = value.unreadNotification ? value.unreadNotification : '';
      state.tenant = value.tenant ? value.tenant : null;
      state.tenant_id = value.tenant_id ? value.tenant_id : null;
      state.tenant_customer_id = value.tenant_customer_id ? value.tenant_customer_id : null;
      state.xero_tenant_id = value.xero_tenant_id ? value.xero_tenant_id : null;
      state.customers = value.customers ? value.customers : null;
      state.country_id = value.country_id ? value.country_id : null;
      state.country_code = value.country_code ? value.country_code : null;
      state.country = value.country ? value.country : null;
      state.currency_code = value.currency_code ? value.currency_code : null;
      state.currency_symbol = value.currency_symbol ? value.currency_symbol : null;
    },
    setCustomers: (state, value) => {
      state.customers = value;
    },
    setMenus: (state, value) => {
      state.menus = value;
    },
    setCustomer: (state, value) => {
      state.customer = value;
    },
    setCompany: (state, value) => {
      state.selectedCompany = value;
    },
    setSelectedHub: (state, value) => {
      state.selectedHub = value;
    },
    setPreviousHub: (state, value) => {
      state.previouslySelectedHub = value;
    },
    setIntros: (state, value) => (state.introOpened = value),
    setTutorial: (state, value) => (state.tutorialOpened = value),
    setVersion: (state, value) => (state.version = value),
    setApp: (state, value) => (state.app = value),
    setIp: (state, value) => (state.ip = value),
    setLang: (state, value) => (state.lang = value),
    setHub: (state, value) => (state.showHub = value),
    setProducts: (state, value) => (state.selectedProducts = value),
    setTotalProducts: (state, value) => (state.totalProducts = value),
    setCart: (state, value) => (state.carts = value),
    setUnreadNotification: (state, value) => (state.unreadNotification = value),
    setXeroTenantId: (state, value) => (state.xero_tenant_id = value),
    setListItemsSelectInCart: (state, value) => (state.list_items_select_in_cart = value),
    setListItemsInCart: (state, value) => (state.list_items_in_cart = value),
    setSelectedCard: (state, value) => (state.selected_card = value),
    setSelectedCategory: (state, value) => {
      state.selected_category = value;
    },
    setSelectedSupplier: (state, value) => {
      state.selectedSupplier = value;
    },
    setChatUnread: (state, value) => (state.chat_unread = value),
    setChatHandlerId: (state, value) => (state.chat_handler_id = value),
    setChatList: (state, value) => (state.chat_list = value),
    setChatNewMsg: (state, value) => (state.chat_new_msg = value),
    setVoucher: (state, value) => {
      state.selected_voucher = value;
    },
    setCheckoutPage: (state, value) => {
      state.is_back_from_checkout = value;
    },
    setActiveSprees: (state, value) => {
      state.active_sprees = value;
    },
    setIsPrevious: (state, value) => {
      state.isPrevious = value;
    },
    setListHubFilter: (state, value) => {
      state.listHubFilter = value;
    },
    setActiveAllProduct: (state, value) => {
      state.activeAllProduct = value;
    },
    setStatusBrowse: (state, value) => {
      state.statusBrowse = value;
    },
    setTenantData: (state, value) => {
      state.tenantData = value;
    },
    setStatesData: (state, value) => {
      state.statesData = value;
    }
  }
});
export default Store;
