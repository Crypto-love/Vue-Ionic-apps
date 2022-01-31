import { mutationField, nonNull, arg, booleanArg } from 'nexus';
import { UserInputError } from 'apollo-server-express';
import { TenantsIntegrationXero } from '@treedots/prisma';
import xeroApi from '@treedots/xero';
import { generateAccountNumber } from '../../utils/helper';

export const addCustomer = mutationField('addCustomer', {
  type: 'Customer',
  args: {
    customer: nonNull(
      arg({
        type: 'AddCustomerInput'
      })
    ),
    is_parent: nonNull(booleanArg())
  },
  resolve: async (_, { customer, is_parent }, { prisma }) => {
    const {
      name,
      alias_name,
      profile,
      halal_products,
      beef_products,
      cod,
      credit_term,
      payment_type,
      delivery_instruction,
      delivery_charge,
      minimum_order,
      hub,
      active,
      direction,
      hub_delivery_fee,
      hub_can_delivery,
      whatsapp_link,
      tenant_id
    } = customer;

    let xeroTenant: TenantsIntegrationXero;
    if (is_parent)
      xeroTenant = await prisma.tenantsIntegrationXero.findFirst({
        where: { tenant_id: tenant_id }
      });

    const accountNumber = await generateAccountNumber(prisma, 2); // 2 = customer
    let xeroCustomerId = null;

    if (xeroTenant) {
      const xeroContactsPayload = {
        contacts: [
          {
            accountNumber,
            contactStatus: 'ACTIVE',
            name: name,
            isCustomer: true,
            paymentTerms: {
              sales: {
                day: credit_term || 0,
                type: credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
              }
            }
          }
        ]
      };

      try {
        const xeroResponse = await xeroApi.fetch({
          xeroTenantId: xeroTenant.xero_tenant_id,
          methodName: 'createContacts',
          methodParams: [xeroContactsPayload]
        });

        const xeroContacts: Array<any> = xeroResponse['contacts'] || [];

        if (xeroContacts.length) xeroCustomerId = xeroContacts[0]['contactID'];
      } catch (error) {
        throw new UserInputError(error.message);
      }
    }

    return await prisma.customer.create({
      data: {
        name,
        alias_name,
        account_number: accountNumber,
        customer_type_id: 2,
        profile,
        halal_products,
        beef_products,
        cod,
        credit_term,
        payment_type,
        delivery_instruction,
        delivery_charge,
        minimum_order,
        hub,
        active,
        direction,
        hub_delivery_fee,
        hub_can_delivery,
        whatsapp_link,
        xero_id: xeroCustomerId,
        CustomerTenant: {
          create: {
            tenant_id,
            active: true,
            xero_customer_id: xeroCustomerId,
            alias_name,
            cod,
            credit_term,
            payment_type,
            delivery_instruction,
            delivery_charge,
            minimum_order,
            auto_create_spree: false
          }
        }
      },
      include: { addresses: true, persons: true }
    });
  }
});
