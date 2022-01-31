import { TenantsIntegrationXero, Prisma, PrismaClient } from '@treedots/prisma';
import xeroApi from '@treedots/xero';
import { UserInputError } from 'apollo-server-express';

export const generateAccountNumber = async (
  prisma: PrismaClient,
  customerTypeId: number
): Promise<string> => {
  if (![1, 2].includes(customerTypeId)) throw new UserInputError('Invalid customer type id');

  const result = await prisma.customer.findFirst({
    where: {
      NOT: [{ account_number: null }],
      customer_type_id: customerTypeId
    },
    orderBy: {
      account_number: 'desc'
    }
  });

  let accountNumber = result && result.account_number ? result.account_number.toString() : null;

  if (accountNumber && customerTypeId === 1) {
    accountNumber = (parseInt(accountNumber.padStart(4, '0')) + 1).toString();
  } else {
    accountNumber = accountNumber ? accountNumber.toLowerCase().replace('b', '') : null;
    accountNumber =
      accountNumber && parseInt(accountNumber) ? `B${parseInt(accountNumber.padStart(4, '0')) + 1}` : null;
  }

  return accountNumber;
};

export const getXeroCustomerId = async (
  isParent: any,
  tenantId: any,
  xeroContactData: any,
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation>
): Promise<string> => {
  let xeroTenant: TenantsIntegrationXero;
  if (isParent)
    xeroTenant = await prisma.tenantsIntegrationXero.findFirst({
      where: { tenant_id: tenantId }
    });

  let xeroCustomerId = null;

  if (xeroTenant) {
    const xeroContactsPayload = {
      contacts: [xeroContactData]
    };

    try {
      const xeroResponse = await xeroApi.fetch({
        xeroTenantId: xeroTenant.xero_tenant_id,
        methodName: 'createContacts',
        methodParams: [xeroContactsPayload]
      });

      const xeroContacts: Array<any> = xeroResponse['contacts'] || [];

      if (xeroContacts.length) xeroCustomerId = xeroContacts[0]['contactID'];

      return xeroCustomerId;
    } catch (error) {
      console.log('error', error.message);
      // throw new UserInputError(error.message);
    }
  }
};
