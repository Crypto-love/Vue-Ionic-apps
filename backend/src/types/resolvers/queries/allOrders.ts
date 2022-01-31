import { booleanArg, intArg, queryField, list, nullable } from 'nexus';

export const allOrders = queryField((t) => {
  t.list.field('allOrders', {
    type: 'PreOrder',
    args: {
      active: booleanArg(),
      hub_id: nullable(intArg()),
      status_id: list(intArg()),
      user_id: intArg()
    },
    resolve: async (_, { active, hub_id, status_id, user_id }, context) => {
      const joinCondition = {
        order_item_status_id: { in: status_id },
        active: active || undefined
      };

      if (hub_id)
        joinCondition['hub'] = {
          id: hub_id
        };

      if (user_id != 2) joinCondition['user_id'] = user_id;

      const preOrder = await context.prisma.preOrder.findMany({
        where: {
          active: active || undefined
        },
        include: {
          pre_order_item: {
            where: joinCondition
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return preOrder.filter((o) => o.pre_order_item.length > 0);
    }
  });
});
