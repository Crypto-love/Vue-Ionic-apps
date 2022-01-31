import { getNewDate } from '../../../../utils/dateTime';
import { sendPushNotification } from './sendPushNotification';
import helper from '../helper';

export async function setPoolData(orderItem, spreeData, isMov, context) {
  const prismaCtx = context.prisma;
  const dataToReturn = [];

  const splitOrderItem = (item, qty) => {
    item.total_price = Number((qty * item.sku.b2c_unit_price).toFixed(4));
    item.total_market_price = Number((qty * item.sku.b2c_market_unit_price).toFixed(4));
    item.discounted = Number(((1 - item.total_price / item.total_market_price) * 100).toFixed(2));
    // calculate total tax
    item.origin_tax = helper.getTaxRateBySku(item);
    item.tax = item.total_price * item.origin_tax;

    // update order_item
    item.order_quantity = qty;
  };

  let getPoolData = await prismaCtx.pool.findFirst({
    where: {
      sku_id: orderItem.sku_id,
      hub_id: spreeData.hub_id,
      close_date: spreeData.end_date,
      is_fullfilled: false
    },
    orderBy: {
      id: 'desc'
    }
  });

  if (!getPoolData) {
    getPoolData = await prismaCtx.pool.create({
      data: {
        sku: {
          connect: {
            id: orderItem.sku_id
          }
        },
        spree_id: spreeData.id,
        pool_qty: orderItem.sku.b2c_pooling_qty,
        is_fullfilled: false,
        remaining_qty: orderItem.sku.b2c_pooling_qty,
        hub_id: spreeData.hub_id,
        close_date: spreeData.end_date,
        close_date_updated_at: undefined,
        created_at: getNewDate(),
        updated_at: undefined
      }
    });
  }

  const orderQty = orderItem.order_quantity;
  let remainOrderQty = orderQty;

  if (orderQty < getPoolData.remaining_qty) {
    await prismaCtx.pool.update({
      data: {
        remaining_qty: getPoolData.remaining_qty - orderQty,
        updated_at: getNewDate()
      },
      where: {
        id: getPoolData.id
      }
    });

    orderItem.pooldata = {
      poolId: getPoolData.id,
      qty: orderQty,
      user_id: orderItem.user_id
    };
    dataToReturn.push(orderItem);
  } else {
    await prismaCtx.pool.update({
      data: {
        is_fullfilled: true,
        remaining_qty: 0,
        hub_id: spreeData.hub_id,
        close_date: spreeData.end_date,
        close_date_updated_at: undefined,
        updated_at: getNewDate()
      },
      where: {
        id: getPoolData.id
      }
    });
    remainOrderQty -= getPoolData.remaining_qty;

    // split order item based on the quantity of item
    const newOrderItem = {
      pooldata: {
        poolId: getPoolData.id,
        qty: getPoolData.remaining_qty,
        user_id: orderItem.user_id
      }
    };
    Object.assign(newOrderItem, orderItem);
    newOrderItem['order_item_status_id'] = isMov ? 11 : -1;
    splitOrderItem(newOrderItem, getPoolData.remaining_qty);
    dataToReturn.push(newOrderItem);

    // get all previous pre_order_item
    const previousPreOrderItems = await context.prisma.preOrderItem.findMany({
      where: {
        pool_item: {
          some: {
            pool_id: getPoolData.id
          }
        }
      },
      select: {
        id: true,
        pre_order: {
          select: {
            id: true
          }
        }
      }
    });

    // update status of prerious order item
    await context.prisma.preOrderItem.updateMany({
      where: {
        id: { in: previousPreOrderItems.map((o) => o.id) }
      },
      data: { order_item_status_id: isMov ? 11 : -1 }
    });

    // update status of prerious order
    await context.prisma.preOrder.updateMany({
      where: {
        id: { in: previousPreOrderItems.map((o) => o.pre_order.id) }
      },
      data: { order_status_id: isMov ? 11 : -1 }
    });

    await sendPushNotification(context, getPoolData.id);

    while (remainOrderQty > 0) {
      const fulfilledImmediately = remainOrderQty >= orderItem.sku.b2c_pooling_qty;
      const poolNewDataInsert = await prismaCtx.pool.create({
        data: {
          sku_id: orderItem.sku_id,
          pool_qty: orderItem.sku.b2c_pooling_qty,
          is_fullfilled: fulfilledImmediately,
          remaining_qty: fulfilledImmediately ? 0 : orderItem.sku.b2c_pooling_qty - remainOrderQty,
          spree_id: spreeData.id,
          hub_id: spreeData.hub_id,
          close_date: spreeData.end_date,
          close_date_updated_at: undefined,
          created_at: getNewDate(),
          updated_at: undefined
        }
      });
      const poolQty = fulfilledImmediately ? orderItem.sku.b2c_pooling_qty : remainOrderQty;

      const newOrderItem = {
        order_item_status_id: -2,
        pooldata: {
          poolId: poolNewDataInsert.id,
          qty: poolQty,
          user_id: orderItem.user_id,
          isFulfilled: fulfilledImmediately
        }
      };

      if (fulfilledImmediately) {
        // split order item based on the quantity of item
        Object.assign(newOrderItem, orderItem);
        newOrderItem.order_item_status_id = isMov ? 11 : -1;
        splitOrderItem(newOrderItem, poolQty);
        dataToReturn.push(newOrderItem);
      } else {
        // split order item based on the quantity of item
        Object.assign(newOrderItem, orderItem);
        splitOrderItem(newOrderItem, poolQty);
        dataToReturn.push(newOrderItem);
      }
      if (fulfilledImmediately) await sendPushNotification(context, getPoolData.id);

      remainOrderQty = fulfilledImmediately ? remainOrderQty - orderItem.sku.b2c_pooling_qty : 0;
    }
  }
  return {
    isPreOrderFulfilled: remainOrderQty === 0,
    preOrderItems: dataToReturn
  };
}
