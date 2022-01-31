import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * approve customer join tenant request
 *
 * @remarks
 *
 * @param id - customer tenant join request id
 * @param updater_id - tenant id
 * @param customer_id - customer id
 * @returns customer tenant id
 *
 */
export const approveCustomerJoinTenantRequest = mutationField('approveCustomerJoinTenantRequest', {
  type: 'Int',
  args: {
    id: nonNull(intArg()),
    updater_id: nonNull(intArg()),
    customer_id: nonNull(intArg())
  },
  resolve: async (_parent, { id, customer_id, updater_id }, ctx) => {
    const customer = await ctx.prisma.customer.findFirst({
      where: {
        id: customer_id
      }
    });
    if (!customer) throw new UserInputError('Customer not found');

    const {
      alias_name,
      cod,
      credit_term,
      payment_type,
      delivery_instruction,
      delivery_charge,
      minimum_order
    } = customer;
    let customerTenantJoinRequests = await ctx.prisma.customerTenantJoinRequest.findFirst({
      where: { id }
    });
    if (!customerTenantJoinRequests) throw new UserInputError('Customer tennant join request not found');

    customerTenantJoinRequests = await ctx.prisma.customerTenantJoinRequest.update({
      data: {
        approved: true,
        active: false,
        updated_by: updater_id
      },
      where: { id }
    });

    const customerTenant = await ctx.prisma.customerTenant.create({
      data: {
        customer_id,
        tenant_id: updater_id,
        alias_name,
        cod,
        credit_term,
        payment_type,
        delivery_instruction,
        delivery_charge,
        minimum_order,
        active: true
      }
    });
    if (!customerTenant) throw new UserInputError('Can not create customer tenant');
    return customerTenant.id;
  }
});
