import { calculateDiscountAmount } from './voucher';

export const isMov = async (spreeData, userId, context) => {
  // find all pre_order that have status = 11 (This user already hit to MOV condition)
  return !!(await context.prisma.preOrderItem.findFirst({
    where: {
      pre_order: {
        spree_id: spreeData.id
      },
      order_item_status_id: 11
    },
    select: {
      id: true
    }
  }));
};

export const updateMOV = async (spreeData, userId, context) => {
  const returnData = {
    isMov: false,
    preOrderIds: null,
    currentTotalAmount: 0,
    minimumAmount: 0
  };

  // find all pre_order that have status = -1 (fulfilled)
  const preOrderItems = await context.prisma.preOrderItem.findMany({
    where: {
      pre_order: {
        spree_id: spreeData.id
      },
      order_item_status_id: { in: [-1, 11] }
    },
    select: {
      id: true,
      total_price: true,
      tax: true,
      order_id: true,
      pre_order: {
        select: {
          paymentB2c: {
            select: {
              voucher_discount: true,
              voucher_discount_type: true
            }
          }
        }
      }
    }
  });

  // get currentTotalAmount
  for (let i = 0; i < preOrderItems.length; i++) {
    const preOrderItem = preOrderItems[i];
    const totalChargeAmount = Number(preOrderItem.total_price) + Number(preOrderItem.tax);
    if (preOrderItem.pre_order.paymentB2c && preOrderItem.pre_order.paymentB2c.voucher_discount) {
      returnData.currentTotalAmount +=
        totalChargeAmount -
        calculateDiscountAmount(
          preOrderItem.pre_order.paymentB2c.voucher_discount,
          preOrderItem.pre_order.paymentB2c.voucher_discount_type,
          totalChargeAmount
        );
    } else {
      returnData.currentTotalAmount += Number(totalChargeAmount);
    }
  }

  returnData.preOrderIds = preOrderItems.map((o) => o.order_id);

  // get minimum amount
  const supplier = await context.prisma.customer.findFirst({
    where: {
      customer_type_id: 3,
      active: true,
      tenant_id: spreeData.tenant_id
    },
    select: {
      minimum_order: true
    }
  });

  // process update pre_order and pre_order_item to 11
  if (returnData.currentTotalAmount >= Number(supplier.minimum_order)) {
    await context.prisma.preOrderItem.updateMany({
      data: { order_item_status_id: 11 },
      where: {
        pre_order: {
          spree_id: spreeData.id
        },
        order_item_status_id: { in: [-1] }
      }
    });
    await context.prisma.preOrder.updateMany({
      data: { order_status_id: 11 },
      where: {
        id: { in: returnData.preOrderIds }
      }
    });
  }

  return;
};
