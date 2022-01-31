import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg } from 'nexus';

export const updateItemReceived = mutationField('updateItemReceived', {
  type: 'SuccessResponse',
  args: {
    id: nonNull(intArg())
  },
  resolve: async (_parent, { id }, ctx) => {
    let preOrderItem = await ctx.prisma.preOrderItem.findFirst({
      where: {
        id: id
      }
    });
    if (!preOrderItem) throw new UserInputError('Order item not found');

    preOrderItem = await ctx.prisma.preOrderItem.update({
      data: {
        order_item_status_id: 14
      },
      where: { id }
    });

    return { success: true };
  }
});
