import { Context } from 'context';
import helper from '../helper';

export const processPreOrderBySupplier = async (context: Context, payload: any) => {
  const items = payload.customerCart.items;

  // init data
  const nonPoolingItems = {
    totalAmountToCharge: 0,
    items: []
  };
  const poolingItems: { totalAmountToCharge: number; items: Array<any> }[] = [];

  items.forEach(async (item: any) => {
    item.user_id = payload.userId;
    item.hub_id = payload.hubId;
    item.tenant_id = payload.tenantId;
    item.delivery_date = payload.spreeData.delivery_date;
    item.order_status_id = -2;
    item.total_price = Number((item.order_quantity * item.sku.b2c_unit_price).toFixed(4));
    item.total_market_price = Number((item.order_quantity * item.sku.b2c_market_unit_price).toFixed(4));
    item.discounted = Number(((1 - item.total_price / item.total_market_price) * 100).toFixed(2));
    // calculate total tax
    item.origin_tax = helper.getTaxRateBySku(item);
    item.tax = item.total_price * item.origin_tax;
    if (item.sku.is_b2c_pooling) {
      item.order_item_status_id = -2;
      item.order_status_id = -2;
      poolingItems.push({
        totalAmountToCharge: item.total_price + item.tax,
        items: [item]
      });
    } else {
      item.order_item_status_id = -1;
      item.order_status_id = -1;
      nonPoolingItems.totalAmountToCharge += item.total_price + item.tax;
      nonPoolingItems.items.push(item);
    }
  });

  // build returning data
  const returningData = {
    totalAmountToCharge: 0,
    preOrderItems: [],
    preOrders: [],
    completedPool: []
  };

  // check isMOV function
  const isMovdata = await helper.isMov(payload.spreeData, payload.userId, context);

  if (nonPoolingItems.items.length > 0) {
    returningData.totalAmountToCharge += nonPoolingItems.totalAmountToCharge;

    helper.trackEvent('Click Checkout', context, {
      items: nonPoolingItems.items,
      spreeData: payload.spreeData,
      totalAmountToCharge: nonPoolingItems.totalAmountToCharge,
      currency: payload.currency,
      userId: payload.userId
    });

    // create pre_order data and pre_order_item data
    const preOrderData = await helper.setPreOrderData(
      nonPoolingItems.items,
      payload.spreeData,
      nonPoolingItems.totalAmountToCharge,
      false,
      isMovdata,
      payload.description,
      context
    );

    if (preOrderData)
      helper.trackEvent('Order Submitted', context, {
        items: nonPoolingItems.items,
        spreeData: payload.spreeData,
        totalAmountToCharge: nonPoolingItems.totalAmountToCharge,
        currency: payload.currency,
        userId: payload.userId
      });

    // set cart item for event tracking
    preOrderData.preOrders.forEach((preOrder) => {
      returningData.preOrderItems = returningData.preOrderItems.concat(preOrder.preOrderItems);
    });

    // push new preorder into preorder list
    returningData.preOrders = returningData.preOrders.concat(preOrderData.preOrders);
  }
  if (poolingItems.length > 0) {
    for (let i = 0; i < poolingItems.length; i++) {
      const poolingItem = poolingItems[i];
      returningData.totalAmountToCharge += poolingItem.totalAmountToCharge;

      helper.trackEvent('Click Checkout', context, {
        items: poolingItem.items,
        spreeData: payload.spreeData,
        totalAmountToCharge: poolingItem.totalAmountToCharge,
        currency: payload.currency,
        userId: payload.userId
      });

      // create pre_order data and pre_order_item data
      const preOrderData = await helper.setPreOrderData(
        poolingItem.items,
        payload.spreeData,
        poolingItem.totalAmountToCharge,
        true,
        isMovdata,
        payload.description,
        context
      );
      if (preOrderData)
        helper.trackEvent('Order Submitted', context, {
          items: poolingItem.items,
          spreeData: payload.spreeData,
          totalAmountToCharge: poolingItem.totalAmountToCharge,
          currency: payload.currency,
          userId: payload.userId
        });

      // set cart item for event tracking
      preOrderData.preOrders.forEach((preOrder) => {
        returningData.preOrderItems = returningData.preOrderItems.concat(preOrder.preOrderItems);

        // add completed pool
        returningData.completedPool = returningData.completedPool.concat(preOrder.completedPool);
      });

      // push new preorder into preorder list
      returningData.preOrders = returningData.preOrders.concat(preOrderData.preOrders);
    }
  }

  if (!isMovdata) {
    await helper.updateMOV(payload.spreeData, payload.userId, context);
  }

  return returningData;
};
