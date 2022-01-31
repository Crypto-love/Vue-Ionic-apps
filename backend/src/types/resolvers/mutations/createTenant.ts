import { UserInputError } from 'apollo-server-express';
import { mutationField, nonNull, arg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Return tenant
 * @params properties of tenant
 * @return tenant
 * */

export const createTenant = mutationField('createTenant', {
  type: 'Tenant',
  args: {
    item: nonNull(
      arg({
        type: 'TenantInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const {
      name,
      alias_name,
      account_number,
      customer_type_id,
      collection_type_id,
      profile,
      halal_products,
      cod,
      credit_term,
      payment_type,
      delivery_instruction,
      delivery_charge,
      minimum_order,
      hub,
      active,
      xero_id,
      voucherify_id,
      registration_number,
      tax_registration_number,
      tax_rate,
      email,
      first_name,
      last_name,
      email_notification,
      class_id,
      default_credit_card_term
    } = item;

    const tenant = await ctx.prisma.tenant.create({
      data: {
        registration_number,
        tax_registration_number,
        tax_rate,
        email,
        first_name,
        last_name,
        email_notification,
        class_id,
        default_credit_card_term,
        customer: {
          create: {
            name,
            alias_name,
            account_number,
            customer_type_id,
            collection_type_id,
            profile,
            halal_products,
            cod,
            credit_term,
            payment_type,
            delivery_instruction,
            delivery_charge,
            minimum_order,
            hub,
            active,
            xero_id,
            voucherify_id
          }
        }
      }
    });
    if (!tenant) throw new UserInputError('Cannot create tenant');
    return tenant;
  }
});
