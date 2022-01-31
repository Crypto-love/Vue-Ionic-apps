import { booleanArg, queryField, list, intArg } from 'nexus';

export const getOrderItemStatuses = queryField((t) => {
  t.list.field('getOrderItemStatuses', {
    type: 'OrderItemStatus',
    args: {
      ids: list(intArg()),
      active: booleanArg()
    },
    resolve: (_, { ids, active }, context) => {
      return context.prisma.orderItemStatus.findMany({
        where: {
          active: active || undefined,
          id: { in: ids }
        }
      });
    }
  });
});
