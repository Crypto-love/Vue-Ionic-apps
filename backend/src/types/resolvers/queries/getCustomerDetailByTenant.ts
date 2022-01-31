import { queryField, intArg, nonNull } from 'nexus';

export const getCustomerDetailByTenant = queryField((t) => {
  t.field('getCustomerDetailByTenant', {
    type: 'Customer',
    args: {
      customer_id: nonNull(intArg()),
      tenant_id: nonNull(intArg())
    },
    resolve: async (_, { customer_id, tenant_id }, { prisma }) => {
      const customer = await prisma.customer.findUnique({
        where: { id: customer_id },
        include: {
          CustomerTenant: {
            where: { tenant_id: tenant_id }
          },
          addresses: {
            where: {
              address_type_id: { not: 3 }
            }
          },
          persons: true
        }
      });

      const customerTenant = customer.CustomerTenant.length ? customer.CustomerTenant[0] : null;

      return {
        ...customer,
        cod: customerTenant !== null ? customerTenant.cod : customer.cod,
        credit_term: customerTenant !== null ? customerTenant.credit_term : customer.credit_term,
        payment_type: customerTenant !== null ? customerTenant.payment_type : customer.payment_type,
        delivery_instruction:
          customerTenant !== null ? customerTenant.delivery_instruction : customer.delivery_instruction,
        delivery_charge: customerTenant !== null ? customerTenant.delivery_charge : customer.delivery_charge,
        minimum_order: customerTenant !== null ? customerTenant.minimum_order : customer.minimum_order,
        xero_id: customerTenant !== null ? customerTenant.xero_customer_id : customer.xero_id
      };
    }
  });
});
