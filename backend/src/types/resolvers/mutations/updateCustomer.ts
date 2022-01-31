import { mutationField, nonNull, arg } from 'nexus';
import { UserInputError } from 'apollo-server-express';
import xeroApi from '@treedots/xero';

export const updateCustomer = mutationField('updateCustomer', {
  type: 'Customer',
  args: {
    customer: nonNull(
      arg({
        type: 'UpdateCustomerInput'
      })
    )
  },
  resolve: async (_, { customer }, { prisma }) => {
    const {
      id,
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

    const customerTenant = await prisma.customerTenant.findFirst({
      where: { customer_id: id, tenant_id: tenant_id }
    });
    const xeroTenant = await prisma.tenantsIntegrationXero.findFirst({
      where: { tenant_id: tenant_id }
    });

    if (customerTenant && customerTenant.xero_customer_id && xeroTenant) {
      const newName = name !== null ? name : undefined;
      const newCreditTerm = credit_term !== null ? credit_term : undefined;

      // Update xero contact if new name or credit term is not null
      if (newName || newCreditTerm) {
        const xeroContactsPayload = {
          contacts: [
            {
              contactID: customerTenant.xero_customer_id,
              name: newName,
              paymentTerms: newCreditTerm
                ? {
                    sales: {
                      day: credit_term,
                      type: credit_term === 30 ? 'OFFOLLOWINGMONTH' : 'DAYSAFTERBILLDATE'
                    }
                  }
                : undefined
            }
          ]
        };
        try {
          await xeroApi.fetch({
            xeroTenantId: xeroTenant.xero_tenant_id,
            methodName: 'updateContact',
            methodParams: [customerTenant.xero_customer_id, xeroContactsPayload]
          });
        } catch (error) {
          throw new UserInputError(error.message);
        }
      }
    }

    await prisma.customerTenant.update({
      where: { id: customerTenant.id },
      data: {
        alias_name,
        cod: cod !== null ? cod : undefined,
        credit_term: credit_term !== null ? credit_term : undefined,
        payment_type: payment_type !== null ? payment_type : undefined,
        delivery_instruction,
        delivery_charge: delivery_charge !== null ? delivery_charge : undefined,
        minimum_order: minimum_order !== null ? minimum_order : undefined
      }
    });

    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
        name: name || undefined,
        alias_name, // Nullable
        profile: profile || undefined,
        halal_products: halal_products !== null ? halal_products : undefined,
        beef_products: beef_products !== null ? beef_products : undefined,
        hub: hub !== null ? hub : undefined,
        active: active !== null ? active : undefined,
        direction, // Nullable
        hub_delivery_fee: hub_delivery_fee !== null ? hub_delivery_fee : undefined,
        hub_can_delivery, // Nullable
        whatsapp_link // Nullable
      },
      include: { addresses: true, persons: true }
    });

    return updatedCustomer;
  }
});
