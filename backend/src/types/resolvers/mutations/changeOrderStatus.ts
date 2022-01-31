import { mutationField, nonNull, intArg, arg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns the items updated.
 *
 * @param orderId - The object id needs to be updated
 * @param newOrderStatus - New status update
 * @returns item update
 *
 * @beta
 */

export const changeOrderStatus = mutationField('changeOrderStatus', {
  type: 'Order',
  args: {
    orderId: nonNull(intArg()),
    newOrderStatus: nonNull(intArg())
  },
  resolve: async (_root, { orderId, newOrderStatus }, ctx) => {
    /** Get Order */
    const order = await ctx.prisma.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (!order) {
      throw new Error('Order not found!');
    } else {
      await ctx.prisma.order.update({
        data: {
          order_status_id: newOrderStatus
        },
        where: {
          id: orderId
        }
      });
    }

    const listIdOrderStatus = await ctx.prisma.orderStatus.findMany({
      select: {
        id: true
      }
    });
    const existingOrderItemStatus = listIdOrderStatus.find((order) => order.id == newOrderStatus);

    if (existingOrderItemStatus) {
      let data;

      if (newOrderStatus == 10) {
        data = {
          order_item_status_id: newOrderStatus,
          active: false
        };
      } else {
        data = {
          order_item_status_id: newOrderStatus
        };
      }

      await ctx.prisma.orderItem.updateMany({
        where: {
          order_id: orderId,
          active: true,
          OR: [
            {
              NOT: {
                order_item_status_id: { in: [-3, 10, 15] }
              }
            },
            {
              NOT: {
                order_item_status_id: null
              }
            }
          ]
        },
        data: data
      });
    }
    return order;
  }
});
