import { Api } from '../helper/services';

export async function VoucherCustomer(row) {
  return await Api.add('vcy', row);
}
