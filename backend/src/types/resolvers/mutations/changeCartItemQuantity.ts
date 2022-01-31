import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, stringArg, intArg, floatArg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Return cart item
 * @param id
 * @param order_quantity
 * @param order_weight
 * @return cart item
 * */
export const changeCartItemQuantity = mutationField('changeCartItemQuantity', {
  type: 'CartItem',
  args: {
    id: nonNull(stringArg()),
    order_quantity: nonNull(intArg()),
    order_weight: nonNull(floatArg())
  },
  resolve: async (_parent, { id, order_quantity, order_weight }, ctx) => {
    let currentItem = await ctx.prisma.cartItem.findUnique({
      where: {
        id: id
      }
    });

    if (!currentItem) throw new UserInputError('Item not found');

    currentItem = await ctx.prisma.cartItem.update({
      data: {
        order_quantity: order_quantity,
        order_weight: Number(order_weight)
      },
      where: {
        id: currentItem.id
      }
    });

    return currentItem;
  }
});
