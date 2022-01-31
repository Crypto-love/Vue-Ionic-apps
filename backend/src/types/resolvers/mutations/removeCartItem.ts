import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, stringArg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Return true or error
 * @params id
 * @return true or error
 * */
export const removeCartItem = mutationField('removeCartItem', {
  type: 'Boolean',
  args: {
    id: nonNull(stringArg())
  },
  resolve: async (_parent, { id }, ctx) => {
    const currentItem = await ctx.prisma.cartItem.findUnique({
      where: {
        id: id
      }
    });

    if (!currentItem) throw new UserInputError('Item not found');

    await ctx.prisma.cartItem.delete({
      where: { id: currentItem.id }
    });

    return true;
  }
});
