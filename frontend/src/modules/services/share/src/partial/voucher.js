import { Api } from '../helper/services';

/** Api voucher voucherify and redemptions */
async function getVoucher(row) {
  return await Api.get(`vcy_vouchers/${row}`);
  /** fetcher('get',`vouchers/row`) */
}

async function addRedemtion(voucher_code, row) {
  return await Api.add(`vcy_vouchers/${voucher_code}/redemption`, row);
}

async function validationVoucher(voucher_code, row) {
  return await Api.add(`vcy_vouchers/${voucher_code}/validate`, row);
}

/** Api customer voucherify */
async function addCustomer(row) {
  return await Api.add('vcy_customers', row);
}

async function getCustomerById(voucherify_id) {
  return await Api.get(`vcy_customers/${voucherify_id}`);
  T;
}

async function updateCustomer(voucherify_id, row) {
  return await Api.update(`vcy_customers/${voucherify_id}`, row);
}

/** Api product voucherify */
async function addProduct(row) {
  return await Api.add('vcy_products', row);
}

async function updateProduct(voucherify_id, row) {
  return await Api.update(`vcy_products/${voucherify_id}`, row);
}

/** Api sku voucherify */
async function addSku(product_id, row) {
  return await Api.add(`vcy_products/${product_id}/skus`, row);
}

async function updateSku(product_id, row, sku_id) {
  return await Api.add(`vcy_products/${product_id}/skus/${sku_id}`, row);
}

export const Voucher = {
  getVoucher,
  addCustomer,
  updateCustomer,
  addProduct,
  updateProduct,
  addSku,
  updateSku,
  addRedemtion,
  validationVoucher
};
