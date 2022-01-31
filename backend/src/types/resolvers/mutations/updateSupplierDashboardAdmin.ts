import { mutationField, nonNull, arg } from 'nexus';
import { UserInputError } from 'apollo-server-errors';
import { uploadImage } from '../../services/aws/index';

export const updateSupplierDashboardAdmin = mutationField('updateSupplierDashboardAdmin', {
  type: 'Tenant',
  args: {
    data: nonNull(
      arg({
        type: 'AddSupplierDashboardAdmin'
      })
    )
  },
  resolve: async (_parent, { data }, ctx) => {
    const {
      //customers
      id,
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
      tenant_id,
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
      //new field for logo/image properties
      base64,
      imageType
    } = data;

    //prepare tenantcustomer data to update
    const updateCustomerData = {
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
    //update tenantcustomer data
    const updateCustomer = await ctx.prisma.customer.update({
      data: updateCustomerData,
      where: { id: id }
    });

    //prepare update tenant data
    const updateTenantData = {
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

    //update tenant data
    await ctx.prisma.tenant.update({
      data: updateTenantData,
      where: { id: updateCustomer.tenant_id }
    });

    if (imageType) {
      const imageUrl = await uploadImage(`${name}.${imageType.split('/')[1]}`, base64, imageType, 'supplier');

      if (!imageUrl) throw new UserInputError('failed to update image, category name not found');

      //update url to logo field
      await ctx.prisma.tenant.update({
        data: { logo: imageUrl },
        where: { id: tenant_id }
      });
    }

    return await ctx.prisma.tenant.findFirst({
      where: {
        id: tenant_id
      }
    });
  }
});
