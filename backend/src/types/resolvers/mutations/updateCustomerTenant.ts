import { mutationField, nonNull, arg } from 'nexus';

export const updateCustomerTenant = mutationField('updateCustomerTenant', {
  type: 'CustomerTenant',
  args: {
    data: nonNull(
      arg({
        type: 'CustomerTenantInput'
      })
    )
  },
  resolve: async (_parent, { data }, ctx) => {
    const {
      id,
      customer_id,
      tenant_id,
      active,
      xero_customer_id,
      alias_name,
      cod,
      credit_term,
      payment_type,
      delivery_instruction,
      delivery_charge,
      minimum_order,
      commission_rate,
      auto_create_spree
    } = data;

    //prepare new tenantcustomer data to create
    const updateCustomertenants = {
      active: active,
      xero_customer_id: xero_customer_id,
      alias_name: alias_name,
      cod: cod,
      credit_term: credit_term,
      payment_type: payment_type,
      delivery_instruction: delivery_instruction,
      delivery_charge: delivery_charge,
      minimum_order: minimum_order,
      commission_rate: commission_rate,
      auto_create_spree: auto_create_spree
    };

    const getTenantCustomerId = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: tenant_id,
        customer_type_id: 3
      }
    });

    await ctx.prisma.customer.update({
      data: { tenant_id: tenant_id },
      where: {
        id: getTenantCustomerId.id
      }
    });

    //insert new tenantcustomer data
    return ctx.prisma.customerTenant.update({
      data: updateCustomertenants,
      where: { id: id }
    });
  }
});
