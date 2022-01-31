import { mutationField, nonNull, arg } from 'nexus';

export const addSupplierDashboardAdmin = mutationField('addSupplierDashboardAdmin', {
  type: 'Tenant',
  args: {
    data: nonNull(
      arg({
        type: 'AddSupplierDashboardAdmin'
      })
    )
  },
  resolve: async (_parent, { data }, ctx) => {
    try {
      const {
        //customers
        id, //not use just save here for later
        name,
        alias_name,
        account_number,
        customer_type_id, // Tenant
        collection_type_id,
        hub,
        profile,
        halal_products,
        cod,
        credit_term,
        payment_type,
        delivery_instruction,
        delivery_charge,
        minimum_order,
        active,
        xero_id,
        voucherify_id,
        //tenants
        registration_number,
        tax_registration_number,
        tax_rate,
        email,
        first_name,
        last_name,
        email_notification,
        tenant_level,
        default_credit_card_term,
        logo,
        lead_days,
        commission_rate,
        base64,
        imageType
      } = data;

      //prepare new tenantcustomer data to create
      const insertCustomerData = {
        name: name,
        alias_name: alias_name,
        account_number: account_number,
        customer_type_id: customer_type_id,
        collection_type_id: collection_type_id,
        profile: profile,
        halal_products: halal_products,
        cod: cod,
        credit_term: credit_term,
        payment_type: payment_type,
        delivery_instruction: delivery_instruction,
        delivery_charge: delivery_charge,
        minimum_order: minimum_order,
        active: active,
        xero_id: xero_id,
        voucherify_id: voucherify_id
      };
      //insert new tenantcustomer data
      const insertCustomer = await ctx.prisma.customer.create({
        data: insertCustomerData
      });
      //take tenantcustomer id from last tenantcustomer has created
      const customerId = insertCustomer.id;

      //prepare new tenant data
      const insertTenantData = {
        registration_number: registration_number,
        tax_registration_number: tax_registration_number,
        tax_rate: tax_rate,
        email: email,
        first_name: first_name,
        last_name: last_name,
        email_notification: email_notification,
        class_id: tenant_level,
        default_credit_card_term: default_credit_card_term,
        logo: logo,
        commission_rate: commission_rate,
        lead_days: lead_days
      };

      //insert new tenant data
      const insertTenant = await ctx.prisma.tenant.create({
        data: insertTenantData
      });

      //take tenantid from last tenant has created
      const tenantId = insertTenant.id;

      //update tenantcustomer tenant_id
      await ctx.prisma.customer.update({
        data: { tenant_id: tenantId },
        where: { id: customerId }
      });

      return await ctx.prisma.tenant.findFirst({
        where: {
          id: tenantId
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
});
