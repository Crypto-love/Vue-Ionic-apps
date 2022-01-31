import { Context } from 'context';

export const sendPushNotification = async (context: Context, poolId: number): Promise<boolean> => {
  const poolItems = await context.prisma.poolItems.findMany({
    where: {
      pool_id: poolId
    },
    include: {
      PreOrderItem: {
        include: {
          sku: {
            select: { name: true }
          },
          user: {
            select: { email: true, first_name: true }
          }
        }
      }
    }
  });

  const events = [];
  for (const poolItem of poolItems) {
    events.push({
      identity: `${poolItem.PreOrderItem.user.email}`,
      name: 'ORDER_POOLED',
      data: {
        'user first name': poolItem.PreOrderItem.user.first_name,
        'order id': poolItem.PreOrderItem.order_id,
        'product sku name': poolItem.PreOrderItem.sku.name,
        qty: poolItem.qty
      }
    });
  }

  // Send event to Clevertap
  const { clevertap } = context;
  await clevertap.uploadEvents(events);

  return true;
};
