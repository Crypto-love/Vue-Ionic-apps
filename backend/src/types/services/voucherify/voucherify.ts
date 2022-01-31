import client from 'voucherify';

interface VoucherifyConfig {
  apiUrl: string;
  applicationId: string;
  clientSecretKey: string;
}

export class Voucherify {
  private clientVoucherify: any;

  constructor(config: VoucherifyConfig) {
    this.clientVoucherify = client({
      apiUrl: config.apiUrl,
      applicationId: config.applicationId,
      clientSecretKey: config.clientSecretKey
    });
  }

  getVoucher = (vouchercode) =>
    this.clientVoucherify.vouchers
      .get(vouchercode)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error('VoucherifyError: %s', error.message);
      });

  validationVoucher = (payload) =>
    this.clientVoucherify.validations
      .validateVoucher(payload.vouchercode, payload.row)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error('VoucherifyError: %s', error.message);
      });

  addRedemtionVoucher = (payload) =>
    this.clientVoucherify.redemptions
      .redeem(payload.vouchercode, payload.row)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.error('VoucherifyError: %s', error.message);
      });
}
