import { UserInputError } from 'apollo-server-errors';
import { intArg, queryField, nonNull } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getCartByCustomerId = queryField('getCartByCustomerId', {
  type: 'Cart',
  args: {
    customer_id: nonNull(intArg())
  },
  resolve: async (_parent, { customer_id }, ctx) => {
    const credential = getUserCredentials(ctx);

    /** Get cart */
    let cart = await ctx.prisma.cart.findFirst({
      where: {
        user_id: credential.userId,
        customer_id: customer_id
      }
    });

    /** If cart doesn't exist, create a new one */
    if (!cart) {
      const customer = await ctx.prisma.customer.findFirst({
        where: {
          id: customer_id,
          customer_type_id: 2 // Customer
        }
      });

      if (!customer) throw new UserInputError(credential.buyerType === 2 ? 'Invalid Hub' : 'Invalid Company');

      cart = await ctx.prisma.cart.create({
        data: {
          user_id: credential.userId,
          customer_id: customer_id
        }
      });
    }

    return cart;
  }
});
