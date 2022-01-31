import { UserInputError } from 'apollo-server-errors';
import { OrderStatus } from '../../constants';
import { mutationField, nonNull, arg, intArg, list } from 'nexus';

/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns status canel order by Id. If success return true, else return false
 * @param orderId - The first parameter input
 * @param restockInput - The second parameter input.
 * @return status success (true or false)
 * */
export const cancelOrderById = mutationField('cancelOrderById', {
  type: 'SuccessResponse',
  args: {
    orderId: nonNull(intArg()),
    restockInput: arg({
      type: list('CancelOrderRestockInput')
    })
  },
  resolve: async (_parent, { orderId, restockInput }, ctx) => {
    /** Get Order */
    const order = await ctx.prisma.order.findUnique({
      where: {
        id: orderId
      }
    });

    if (!order) {
      throw new UserInputError('Order not found');
    }

    if (order.order_status_id === OrderStatus.CANCEL) {
      throw new UserInputError('Order already cancelled');
    }

    if (restockInput && restockInput.length > 0) {
      // const orderItem = await ctx.prisma.OrderItem.findUnique({
      //   where:
      // });
      const updates = [];
      await Promise.all(
        restockInput.map(async (r) => {
          if (r.restockQty <= 0) {
            throw new UserInputError(`Restock qty for item id ${r.orderItemId} cannot be negative or null`);
          }
          const orderItem = await ctx.prisma.orderItem.findFirst({
            where: {
              id: r.orderItemId,
              order_id: orderId
            }
          });

          if (
            !orderItem ||
            !orderItem.sku_id ||
            !orderItem.customer_seller_id ||
            !orderItem.product_type_id
          ) {
            throw new UserInputError(`Can not found order item for item id : ${r.orderItemId}`);
          }

          if (!orderItem.active) {
            throw new UserInputError(`item id ', ${r.orderItemId}, ' is not active`);
          }

          if (orderItem.total_qty < r.restockQty) {
            throw new UserInputError(
              `restock qty for item id ', $${r.orderItemId}, ' cannot be greater than current qty (', ${orderItem.total_qty}, ')'`
            );
          }

          updates.push({
            data: {
              quantity: {
                increment: r.restockQty
              }
            },
            where: {
              sku_id: orderItem.sku_id,
              customer_id: orderItem.customer_seller_id,
              product_type_id: orderItem.product_type_id,
              quantity: { gte: 0 }
            }
          });
        })
      );

      await Promise.all(
        updates.map(async (updateQuantity) => {
          await ctx.prisma.orderItem.updateMany(updateQuantity);
        })
      );
    } else {
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          order_id: orderId,
          active: true,
          order_item_status_id: { in: [-3, 10] }
        }
      });
      if (orderItems && orderItems.length > 0) {
        await Promise.all(
          orderItems.map(async (oi) => {
            return await ctx.prisma.inventory.updateMany({
              data: {
                quantity: {
                  increment: oi.total_qty
                }
              },
              where: {
                quantity: {
                  gte: 0
                },
                sku_id: oi.sku_id,
                customer_id: oi.customer_seller_id,
                product_type_id: oi.product_type_id
              }
            });
          })
        );
      }

      await ctx.prisma.order.updateMany({
        data: {
          order_status_id: OrderStatus.CANCEL
        },
        where: {
          id: orderId
        }
      });
      await ctx.prisma.orderItem.updateMany({
        data: {
          order_item_status_id: OrderStatus.CANCEL,
          active: false
        },
        where: {
          order_id: orderId
        }
      });
    }

    return { success: true };
  }
});
