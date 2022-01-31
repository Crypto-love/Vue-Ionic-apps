import { allCountries } from './allCountries';
import { allMenus } from './allMenus';
import { allUoms } from './allUoms';
import { allUsers } from './allUsers';
import { allUserTypes } from './allUserTypes';
import { allOrders } from './allOrders';
import { categories } from './categories';
import { getAllCartByUserId } from './getAllCartByUserId';
import { getCartByCustomerId } from './getCartByCustomerId';
import { getHotDiscountProductsB2C } from './getHotDiscountProductsB2C';
import { products } from './products';
import { getProductDetailB2c } from './getProductDetailB2c';
import { getGroupBuyProducts } from './getGroupBuyProducts';
import { getSelectedHub } from './getSelectedHub';
import { getAllSprees } from './getAllSprees';
import { getSkuDeals } from './getSkuDeals';
import { autoCloseAllPastSpree } from './autoClosePastSpree';
import { getAllPoolings } from './getAllPoolings';
import { getAllSuppliers } from './getAllSuppliers';
import { getAllProducts } from './getAllProducts';
import { checkUser } from './checkUser';
import { getPopularProducts } from './getPopularProducts';
import { getAvailableCollectionPoints } from './getAvailableCollectionPoints';
import { searchProducts } from './searchProducts';
import { checkOldPassword } from './checkOldPassword';
import { getUserByMobile } from './getUserByMobile';
import { getUsersByTypeId } from './getUsersByTypeId';
import { getAllSupplierDashboardAdmin } from './getAllSupplierDashboardAdmin';
import { getB2COrders } from './getB2cOrder';
import { getAvailableSprees } from './getAvailableSprees';
import { getB2COrderList } from './getB2cOrderList';
import { getTenantHubs } from './getTenantHubs';
import { getB2COrderdetails } from './getDashboardB2cOrderDetails';
import { getAvailableCollectionPointByTenant } from './getAvailableCollectionPointByTenant';
import { getB2cUserByTenant } from './getB2cUserByTenant';
import { getOrderItemStatuses } from './getOrderItemStatuses';
import { getB2cSkus } from './getB2cSkus';
import { getAllCustomers, getAllCustomerByBusinessUserId } from './getAllCustomers';
import { getCustomerDetailByTenant } from './getCustomerDetailByTenant';
import { getUserCustomers } from './getUserCustomers';
import { getConsolidationInvoices } from './getConsolidationInvoices';
import { getCollectionPointStatus } from './getCollectionPointStatus';
import { getAddress } from './getAddress';
import { getHours } from './getHours';
import { getCollectionTypes } from './getCollectionTypes';
import { getCustomerTypes } from './getCustomerTypes';
import { getGroups } from './getGroups';
import { getPersons } from './getPersons';
import { getVersions } from './getVersions';
import { getDays } from './getDays';
import { getDeliveryDays } from './getDeliveryDays';
import { allStates } from './allStates';
import { getSupplierStates, getSupplierStatesPagination } from './getSupplierStates';
import { getAllAdvocates, getAdvocateNewRequestCount } from './getAllAdvocates';
import { getCollectionPointByUserId } from './getCollectionPointByUserId';
import { getBankListByUserId } from './getBankListByUserId';
import { getEwalletBalance } from './getEwalletBalance';
import { getSupplierUsers, getSupplierUserDetails, getAllCampaigns } from './supplierUsers';
import { getAllBanks } from './getAllBanks';
import { getAllSupplierByCPId } from './getAllSupplierByCollectionPointId';
import { getAllSupplierFrequencyTypes } from './getAllSupplierFrequencyTypes';
import {
  getSupplierBasicInfo,
  getSupplierStatementAccount,
  getSupplierPostPaymentMethod
} from './getSupplierDetails';

export const queries = {
  allCountries,
  allMenus,
  allUoms,
  allUsers,
  allUserTypes,
  categories,
  getAllCartByUserId,
  getCartByCustomerId,
  getGroupBuyProducts,
  getHotDiscountProductsB2C,
  getAllSprees,
  products,
  getProductDetailB2c,
  getSelectedHub,
  getSkuDeals,
  autoCloseAllPastSpree,
  getAllPoolings,
  getAllSuppliers,
  allOrders,
  getAllProducts,
  checkUser,
  getPopularProducts,
  getAvailableCollectionPoints,
  searchProducts,
  checkOldPassword,
  getUserByMobile,
  getUsersByTypeId,
  getAllSupplierDashboardAdmin,
  getB2COrders,
  getAvailableSprees,
  getB2COrderList,
  getTenantHubs,
  getB2COrderdetails,
  getAvailableCollectionPointByTenant,
  getB2cUserByTenant,
  getOrderItemStatuses,
  getB2cSkus,
  getAllCustomers,
  getCustomerDetailByTenant,
  getUserCustomers,
  getConsolidationInvoices,
  getCollectionPointStatus,
  getAddress,
  getHours,
  getCollectionTypes,
  getCustomerTypes,
  getGroups,
  getPersons,
  getVersions,
  getDays,
  getDeliveryDays,
  allStates,
  getSupplierStates,
  getAllAdvocates,
  getCollectionPointByUserId,
  getBankListByUserId,
  getEwalletBalance,
  getSupplierUsers,
  getSupplierUserDetails,
  getAdvocateNewRequestCount,
  getAllCampaigns,
  getAllBanks,
  getAllSupplierByCPId,
  getAllCustomerByBusinessUserId,
  getSupplierStatesPagination,
  getAllSupplierFrequencyTypes,
  getSupplierBasicInfo,
  getSupplierStatementAccount,
  getSupplierPostPaymentMethod
};
