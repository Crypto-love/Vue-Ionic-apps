import { addCustomer } from './addCustomer';
import { addItemToCart } from './addItemToCart';
import { changeCartItemQuantity } from './changeCartItemQuantity';
import { createTenant } from './createTenant';
import { customerConnectedGroupChat } from './customerConnectedGroupChat';
import { deleteInvoicePayment } from './deleteInvoicePayment';
import { deliveryDaysAdd } from './deliveryDaysAdd';
import { addFavouriteKus } from './addFavouriteKus';
import { approveQuotation } from './approveQuotation';
import { addUser } from './addUser';
import { addInvoicePayment } from './addInvoicePayment';
import { changeOrderStatus } from './changeOrderStatus';
import { cancelOrderById } from './cancelOrderById';
import { checkVoucher, voucherValidation, voucherRedemption } from './voucher';
import { cancelB2cOrder } from './cancelB2cOrder';
import { cancelB2cOrderItem } from './cancelB2cOrderItem';
import { addPerson } from './addPerson';
import { approveCustomerJoinTenantRequest } from './approveCustomerJoinTenantRequest';
import { addUserAndPerson } from './addUserAndPerson';
import { groupBuyCheckout } from './groupBuyCheckout';
import { joinHub } from './joinHub';
import { me } from './me';
import { removeCartItem } from './removeCartItem';
import { requestJWT } from './requestJWT';
import { signIn } from './signIn';
import { signInWithOTP } from './signInWithOTP';
import { updatePreOrderItemB2CDashboard } from './updatePreOrderItemB2CDashboard';
import { updateItemReceived } from './updateItemReceived';
import { updatePassword } from './updatePassword';
import { addSupplierDashboardAdmin } from './addSupplierDashboardAdmin';
import { updateSupplierDashboardAdmin } from './updateSupplierDashboardAdmin';
import { updateUserStatus } from './updateUserStatus';
import { changeGBCollectionPoint } from './changeGBCollectionPoint';
import { changeGBCollectionDate } from './changeGBCollectionDate';
import { updateSpreeData } from './updateSpreeData';
import { addCustomerTenant } from './addCustomerTenant';
import { updateCustomerTenant } from './updateCustomerTenant';
import { updateProductImages } from './updateProductImages';
import { updateCustomer } from './updateCustomer';
import { uploadInvoicesToXero } from './uploadInvoicesToXero';
import { updateMyCustomerAddress } from './updateMyCustomerAddress';
import { updateHours } from './updateHours';
import { updatePerson } from './updatePersons';
import { addDeliveryDays, deleteDeliveryDays } from './DeliveryDays';
import { createSupplierStates } from './createSupplierStates';
import { deleteSupplierState } from './deleteSupplierState';
import {
  advocateApproval,
  updateAdvocateDetails,
  updateCollectionPointDetails,
  verifyBankAccount,
  updateBankAccountDetails,
  verifyCollectionPoint,
  addNewAdvocate,
  addNewCollectionPoint,
  addNewBankAccount,
  linkCollectionPointSupplier,
  unLinkCollectionPointSupplier
} from './advocateSignUp';
import { topUpUserBalanceDonation } from './topUpUserBalanceDonation';
import {
  updateSupplierUser,
  updateMultipleSupplierActive,
  createNewSupplierUserPassword,
  deleteSupplierUsers
} from './supplierUsers';
import { tagBusinessCustomer, untagBusinessCustomer } from './businessCustomer';
import {
  addSupplierBasicInformations,
  addGroupBuySettings,
  addBusinessSettings,
  addDefaultSettings
} from './addSupplier';
import {
  updateSupplierBasicInfo,
  updateSupplierDeliveryHours,
  updateSupplierOpeningHours,
  updateSupplierBusinessSettings,
  updateSupplierDefaultSettings
} from './updateSupplier';

export const mutations = {
  addCustomer,
  addFavouriteKus,
  addInvoicePayment,
  addItemToCart,
  addUser,
  addUserAndPerson,
  approveCustomerJoinTenantRequest,
  approveQuotation,
  cancelB2cOrder,
  cancelB2cOrderItem,
  cancelOrderById,
  changeCartItemQuantity,
  changeOrderStatus,
  createTenant,
  customerConnectedGroupChat,
  deleteInvoicePayment,
  deliveryDaysAdd,
  addPerson,
  checkVoucher,
  voucherValidation,
  voucherRedemption,
  joinHub,
  me,
  removeCartItem,
  requestJWT,
  signIn,
  signInWithOTP,
  updatePreOrderItemB2CDashboard,
  updateItemReceived,
  groupBuyCheckout,
  updatePassword,
  addSupplierDashboardAdmin,
  updateSupplierDashboardAdmin,
  updateUserStatus,
  changeGBCollectionPoint,
  changeGBCollectionDate,
  updateSpreeData,
  addCustomerTenant,
  updateCustomerTenant,
  updateProductImages,
  updateCustomer,
  uploadInvoicesToXero,
  updateMyCustomerAddress,
  updateHours,
  updatePerson,
  addDeliveryDays,
  deleteDeliveryDays,
  createSupplierStates,
  deleteSupplierState,
  advocateApproval,
  updateAdvocateDetails,
  updateCollectionPointDetails,
  verifyBankAccount,
  updateBankAccountDetails,
  verifyCollectionPoint,
  topUpUserBalanceDonation,
  updateSupplierUser,
  updateMultipleSupplierActive,
  createNewSupplierUserPassword,
  deleteSupplierUsers,
  addNewAdvocate,
  addNewCollectionPoint,
  addNewBankAccount,
  linkCollectionPointSupplier,
  unLinkCollectionPointSupplier,
  tagBusinessCustomer,
  untagBusinessCustomer,
  addSupplierBasicInformations,
  addGroupBuySettings,
  addBusinessSettings,
  addDefaultSettings,
  updateSupplierBasicInfo,
  updateSupplierDeliveryHours,
  updateSupplierOpeningHours,
  updateSupplierBusinessSettings,
  updateSupplierDefaultSettings
};
