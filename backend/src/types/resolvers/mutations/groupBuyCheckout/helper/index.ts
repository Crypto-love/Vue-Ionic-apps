import { getTaxRateBySku } from './getTaxRateBySKU';
import { setPreOrderData } from './setPreOrderData';
import { trackEvent } from './trackEvent';
import { processPreOrderBySupplier } from './processPreOrderBySupplier';
import {
  sendEmailOrderDeliveryDateConfirmed,
  sendEmailOrderConfirmation,
  sendEmailCompletedPool
} from './sendEmailNotification';
import { setPoolItemData } from './setPoolItemData';
import { isMov, updateMOV } from './checkMOVData';
import { calculateDiscountAmount, redeemVoucher } from './voucher';
import { reduceInventory } from './reduceInventory';
import { getHubDetail } from './getHubDetail';

const helper = {
  getTaxRateBySku,
  setPreOrderData,
  trackEvent,
  processPreOrderBySupplier,
  sendEmailOrderDeliveryDateConfirmed,
  sendEmailOrderConfirmation,
  sendEmailCompletedPool,
  setPoolItemData,
  isMov,
  updateMOV,
  calculateDiscountAmount,
  redeemVoucher,
  reduceInventory,
  getHubDetail
};

export default helper;
