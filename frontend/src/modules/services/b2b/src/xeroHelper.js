import { Api } from '../../share/index';

export const checkIfAccNoAlreadyExistOnXero = async (accountNo, xeroTenantId = null) => {
  const res = await Api.xero('getContacts', [null, `AccountNumber=="${accountNo}"`], xeroTenantId);
  if (!res.status) throw new Error(res.message);

  return res.data[0].contacts.length > 0;
};

export const getLatestAccountNumberOnXero = async (xeroTenantId = null) => {
  const res = await Api.xero('getContacts', [null, null, 'AccountNumber DESC', null, 1], xeroTenantId);
  if (!res.status) throw new Error(res.message);

  const accNoStr = res.data[0].contacts[0].accountNumber.substring(1);

  return parseInt(accNoStr);
};
