import { setPoolData } from './setPoolData';
import { getNewDate } from '../../../../utils/dateTime';
import dayjs from 'dayjs';
import helper from '../helper';
import { getUserCredentials } from '../../../../utils/auth';

export const setPreOrderData = async (
  data,
  spreeData,
  totalAmountToCharge,
  isPooling,
  isMov,
  description,
  context
) => {
  const prismaCtx = context.prisma;
  const credential = getUserCredentials(context);

  const insertPreOrderItemsData = async (preOrderId, preOrderItems) => {
    const returnData = [];
    const completedPool = [];
    for (let index = 0; index < preOrderItems.length; index++) {
      const preOrderItem = preOrderItems[index];

      const insertData = {
        data: {
          pre_order: {
            connect: {
              id: preOrderId
            }
          },
          sku: {
            connect: {
              id: preOrderItem.sku_id
            }
          },
          product_type_id: preOrderItem.inventory.product_type_id,
          user: {
            connect: {
              id: preOrderItem.user_id
            }
          },
          driver_collect_user_id: null,
          driver_delivery_user_id: null,
          customer_seller_id: preOrderItem.inventory.customer_id,
          hub: {
            connect: {
              id: preOrderItem.hub_id
            }
          },
          group_id: null,
          invoice_id: null,
          amount_qty: Number(preOrderItem.inventory.unit_amount),
          total_qty: preOrderItem.order_quantity,
          origin_unit_price: preOrderItem.sku.b2c_unit_price,
          sale_unit_price: preOrderItem.sku.b2c_unit_price,
          total_price: preOrderItem.total_price,
          tax: preOrderItem.tax,
          discount: 0, //apply when total order qty of SKU met carton deals
          original_sale_unit_price: preOrderItem.sku.b2c_unit_price,
          original_total_price: preOrderItem.total_price,
          original_tax: preOrderItem.origin_tax,
          sku_deal_id: null, //apply when total order qty of SKU met carton deals
          cod: null,
          created_at: getNewDate(),
          updated_at: undefined,
          last_user_id: credential.userId,
          description: null,
          active: true,
          order_item_status: {
            connect: {
              id: isMov && data[0].order_item_status_id === -1 ? 11 : preOrderItem.order_item_status_id
            }
          },
          status_note: null,
          reservedStockB2c: {
            create: {
              quantity: preOrderItem.order_quantity,
              sku_id: preOrderItem.sku_id
            }
          }
        }
      };

      const preOrderItemReturn = await prismaCtx.preOrderItem.create(insertData);

      returnData.push(preOrderItemReturn);

      // create pool item
      if (preOrderItem.pooldata) {
        await helper.setPoolItemData(preOrderItem.pooldata, preOrderItemReturn.id, context);
        // send email notification pool item completed
        if ([-1, 11].indexOf(preOrderItem.order_item_status_id) > -1) {
          completedPool.push(preOrderItemReturn.id);
        }
      }
    }

    return {
      preOrderItems: returnData,
      completedPool
    };
  };

  const insertPreOrderData = async (totalAmountToCharge, orderStatusId) => {
    // create pre_order record
    return prismaCtx.preOrder.create({
      data: {
        po_number: '-',
        standalone: null,
        delivery_date: spreeData.delivery_date,
        delivery_time: null,
        charge_date: dayjs().add(7, 'day').format(), //charge date 7 days
        close_date: spreeData.end_date,
        payment_date: null, //change when payment status id change to 3 order payment get paid
        payment_status_id: null, //2: onhold. 3:charged
        user: {
          connect: {
            id: data[0].user_id
          }
        },
        description: description || '',
        active: true,
        token: null,
        created_at: getNewDate(),
        updated_at: undefined,
        pre_order_item: {},
        spree_id: spreeData.id,
        order_status: {
          connect: {
            id: orderStatusId
          }
        },
        total_charged: totalAmountToCharge // update total charged
      }
    });
  };

  const returnData = {
    preOrders: [],
    preOrderItems: []
  };

  if (!isPooling) {
    // create preOrder record
    const preOrderReturn = await insertPreOrderData(
      totalAmountToCharge,
      isMov && data[0].order_status_id === -1 ? 11 : data[0].order_status_id
    );

    // set cart item processing
    preOrderReturn.cartItems = data;

    // create preOrderItem
    const { preOrderItems } = await insertPreOrderItemsData(preOrderReturn.id, data);

    returnData.preOrders.push(
      Object.assign(preOrderReturn, {
        spreeData,
        preOrderItems
      })
    );
  } else {
    const poolReturnData = await setPoolData(data[0], spreeData, isMov, context);

    // split more preorder
    for (let i = 0; i < poolReturnData.preOrderItems.length; i++) {
      const item = poolReturnData.preOrderItems[i];
      // calculate amount per item
      const unitAmount = totalAmountToCharge / data[0].order_quantity;

      // create preOrder
      const preOrderReturn = await insertPreOrderData(
        unitAmount * item.pooldata.qty,
        item.order_item_status_id
      );

      // set cart item processing
      preOrderReturn.cartItems = [item];

      const { preOrderItems, completedPool } = await insertPreOrderItemsData(preOrderReturn.id, [item]);

      returnData.preOrders.push(
        Object.assign(preOrderReturn, {
          spreeData,
          preOrderItems,
          completedPool
        })
      );
    }
  }
  return returnData;
};
