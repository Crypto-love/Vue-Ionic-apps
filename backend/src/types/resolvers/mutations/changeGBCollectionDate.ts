import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, stringArg } from 'nexus';
import { sendEmail } from '../../services';
import dayjs from 'dayjs';
import { HubSpreeData, Pool, PreOrderItem, PrismaClient } from '@treedots/prisma';
import { getNewDate } from '../../utils/dateTime';

export const changeGBCollectionDate = mutationField('changeGBCollectionDate', {
  type: 'PreOrder',
  args: {
    newCollectionDate: nonNull(stringArg()),
    orderId: nonNull(intArg()),
    appMode: nonNull(stringArg())
  },
  resolve: async (_parent, { newCollectionDate, orderId, appMode }, { prisma, firebase }) => {
    const order = await prisma.preOrder.findUnique({
      where: { id: orderId },
      include: {
        pre_order_item: {
          where: { active: true },
          include: { sku: true }
        },
        user: true,
        order_status: true
      }
    });
    if (!order) throw new UserInputError('Order not found');

    /* Validate the spree */
    const oldSpree = await prisma.hubSpreeData.findUnique({
      where: { id: order.spree_id }
    });

    const newSpree = await prisma.hubSpreeData.findFirst({
      where: {
        Status: 0,
        active: true,
        tenant_id: oldSpree.tenant_id,
        hub_id: oldSpree.hub_id,
        delivery_date: newCollectionDate
      },
      include: {
        hub: {
          include: {
            addresses: {
              where: { active: true, address_type_id: 1 },
              include: {
                country: true
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    if (!newSpree) throw new UserInputError('Spree is not available');

    if (oldSpree.id == newSpree.id) throw new UserInputError('Cannot replace same collection date');

    if (oldSpree.tenant_id != newSpree.tenant_id)
      throw new UserInputError('Tenant of old spree and new spree is different');

    const queries = [];
    const poolingPreOrderItems: Array<PreOrderItem> = [];
    const oldPools: Array<Pool> = [];
    const oldPooledIds: Array<number> = []; // Ids of old pool that fulfilled

    // Update Pre Order Item & Its pool (if pooling item)
    for (const item of order.pre_order_item) {
      if (item.sku.is_b2c_pooling) {
        poolingPreOrderItems.push(item);

        const poolItems = await prisma.poolItems.findMany({
          where: { pre_order_item_id: item.id },
          include: { pool: true }
        });

        poolItems.forEach((poolItem) => {
          // Update pool by increase remaining_qty and set isFulfilled to false
          queries.push(
            prisma.pool.update({
              data: {
                remaining_qty: { increment: poolItem.qty },
                is_fullfilled: false
              },
              where: { id: poolItem.pool_id }
            })
          );
          oldPools.push(poolItem.pool);

          if (poolItem.pool.is_fullfilled) oldPooledIds.push(poolItem.pool_id);

          // Delete `pool_items` record
          queries.push(
            prisma.poolItems.delete({
              where: { id: poolItem.id }
            })
          );
        });
      }
    }

    // Update Pre Order
    queries.push(
      prisma.preOrder.update({
        where: { id: orderId },
        data: {
          delivery_date: newSpree.delivery_date,
          close_date: newSpree.end_date,
          spree_id: newSpree.id
        }
      })
    );

    // Delete old pool if there is no pool item
    oldPools.forEach((pool) => {
      queries.push(
        prisma.pool.deleteMany({
          where: {
            id: pool.id,
            is_fullfilled: false,
            remaining_qty: pool.pool_qty
          }
        })
      );
    });

    // If old pool was fulfilled, update status of all orders and order items to 'Processing in Hub'
    if (oldPooledIds.length) {
      const poolItems = await prisma.poolItems.findMany({
        where: { pool_id: { in: oldPooledIds } },
        include: { PreOrderItem: true }
      });
      const preOrderItemIds: Array<number> = [];
      const preOrderIds: Array<number> = [];
      poolItems.forEach((item) => {
        preOrderItemIds.push(item.PreOrderItem.id);
        preOrderIds.push(item.PreOrderItem.order_id);
      });
      if (preOrderItemIds.length) {
        queries.push(
          prisma.preOrderItem.updateMany({
            where: {
              id: { in: preOrderItemIds },
              order_item_status_id: -1
            },
            data: { order_item_status_id: -2 }
          }),
          prisma.preOrder.updateMany({
            where: {
              id: { in: preOrderIds },
              order_status_id: -1
            },
            data: { order_status_id: -2 }
          })
        );
      }
    }

    // Execute above queries
    await prisma.$transaction(queries);

    // Set new Pool based on new spree
    for (const item of poolingPreOrderItems) {
      await setPoolData(prisma, newSpree, item);
    }

    const updatedPreOrder = await prisma.preOrder.findUnique({
      where: { id: orderId },
      include: {
        pre_order_item: true,
        user: true,
        order_status: true
      }
    });

    await sendEmailNotification(prisma, updatedPreOrder, newSpree, firebase, appMode);

    return updatedPreOrder;
  }
});

/**
 * This function is copied `setPoolData` from groupBuyCheckout mutation
 * @param prisma PrismaClient
 * @param spree Spree of new collection point
 * @param preOrderItem Pooling pre order item
 */
async function setPoolData(prisma: PrismaClient, spree: HubSpreeData, preOrderItem) {
  let poolData = await prisma.pool.findFirst({
    where: {
      sku_id: preOrderItem.sku_id,
      spree_id: spree.id,
      is_fullfilled: false,
      remaining_qty: { gte: preOrderItem.total_qty }
    },
    orderBy: {
      id: 'asc'
    }
  });

  if (!poolData) {
    poolData = await prisma.pool.create({
      data: {
        sku: {
          connect: {
            id: preOrderItem.sku_id
          }
        },
        // spree_id: spree.id,
        spree: {
          connect: {
            id: spree.id
          }
        },
        pool_qty: preOrderItem.sku.b2c_pooling_qty,
        is_fullfilled: false,
        remaining_qty: preOrderItem.sku.b2c_pooling_qty,
        // hub_id: spree.hub_id,
        hub: {
          connect: {
            id: spree.hub_id
          }
        },
        close_date: spree.end_date,
        close_date_updated_at: undefined,
        created_at: getNewDate(),
        updated_at: undefined
      }
    });
  }

  const isFulfilled = poolData.remaining_qty - preOrderItem.total_qty === 0 ? true : false;

  await prisma.pool.update({
    data: {
      remaining_qty: { decrement: preOrderItem.total_qty },
      is_fullfilled: isFulfilled,
      updated_at: getNewDate()
    },
    where: {
      id: poolData.id
    }
  });

  await prisma.poolItems.create({
    data: {
      pool: {
        connect: {
          id: poolData.id
        }
      },
      PreOrderItem: {
        connect: {
          id: preOrderItem.id
        }
      },
      qty: preOrderItem.total_qty,
      // user_id: preOrderItem.user_id
      user: {
        connect: {
          id: preOrderItem.user_id
        }
      }
    }
  });

  // If pool is fulfilled, Update status of pre_orders and pre_order_items to 'Processed in Hub'
  if (isFulfilled) {
    const poolItems = await prisma.poolItems.findMany({
      where: { pool_id: poolData.id },
      include: { PreOrderItem: true }
    });
    const preOrderItemIds: Array<number> = [];
    const preOrderIds: Array<number> = [];
    poolItems.forEach((item) => {
      preOrderItemIds.push(item.PreOrderItem.id);
      preOrderIds.push(item.PreOrderItem.order_id);
    });
    if (preOrderItemIds.length) {
      await prisma.preOrderItem.updateMany({
        where: {
          id: { in: preOrderItemIds },
          order_item_status_id: -2
        },
        data: { order_item_status_id: -1 }
      });
      await prisma.preOrder.updateMany({
        where: {
          id: { in: preOrderIds },
          order_status_id: -2
        },
        data: { order_status_id: -1 }
      });
    }
  }
}

async function sendEmailNotification(
  ctxPrisma: PrismaClient,
  orderData: any,
  newSpreeData: any,
  firebase: any,
  appMode: string
) {
  const orderItems = await ctxPrisma.preOrderItem.findMany({
    where: {
      order_id: orderData.id
    },
    include: {
      sku: {
        include: {
          product: true
        }
      },
      user: true,
      hub: true
    }
  });

  const hubData = getAddress(newSpreeData.hub.addresses);
  const tenantData = await getTenantByTenantId(ctxPrisma, newSpreeData.tenant_id);
  const items: any = [];

  for (const item of orderItems) {
    items.push({
      imgUrl: getImageUrl(item.sku.image),
      itemName: item.sku.name,
      price: hubData.currencySimbol.concat((Number(item.total_price) + Number(item.tax)).toFixed(2)),
      quantity: item.total_qty
    });
  }

  // sendgrid email nofitication
  await sendEmail({
    to: orderData.user.email,
    dynamic_template_data: {
      name: `${orderData.user?.first_name || ''} ${orderData.user?.last_name || ''}`.trim(),
      orderId: orderData.payment_b2c_id,
      newCollectionPoint: newSpreeData.hub.alias_name,
      newCollectionPointAddress: hubData.address, //"Block 123, Street 02",
      country: hubData.country,
      postalCode: hubData.postalCode,
      newCollectionDate: dayjs(newSpreeData.delivery_date).format('DD MMMM YYYY'), //11 June 2021
      supplier: tenantData.name,
      packageNo: orderData.id,
      orderItems: items
    },
    template_id:
      orderData.order_status.name === 'B2C Processed'
        ? 'd-9a221da11e5a429b8c5e3a7cb0779363'
        : 'd-ce518606c5fd4a499d21e937ccb61784'
  });

  //prepare data to send notification using firebase
  const message: any = {
    sender_user_id: 2, //mean admin do the collection point change
    target_user_id: orderData.user.id,
    topic: `${orderData.user.id}-${appMode}`,
    title: `📅❗Collection date changed for your order ${orderData.payment_b2c_id}.`,
    message:
      orderData.order_status.name === 'B2C Processed'
        ? `The new collection date for your order is confirmed on ${dayjs(newSpreeData.delivery_date).format(
            'DD MMMM YYYY'
          )}. Please reach out to your Collection Point via our app if you did not request for this change or think you received this by mistake. 💬`
        : `The new estimated collection date for your order is ${dayjs(newSpreeData.delivery_date).format(
            'DD MMMM YYYY'
          )}. Please reach out to your Collection Point via our app if you did not request for this change or think you received this by mistake. 💬`,
    payload: JSON.stringify({ payment_b2c_id: orderData.payment_b2c_id })
  };

  // -- Send notification message
  await firebase.sendNotification(message);
}

function getAddress(addressData) {
  if (!addressData)
    return { country: 'Singapore', postalCode: 'nodata', address: 'nodata', currencySimbol: '$' };
  return {
    country: addressData[0].country.description,
    postalCode: addressData[0].postal_code,
    currencySimbol: addressData[0].country.currency_symbol,
    address: addressData[0].road || ''.concat(', ', addressData[0].street_number || '')
  };
}

function getImageUrl(filename: string, size = 'large') {
  const noImage = 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png';
  if (!filename) return noImage;
  return `https://production.thetreedots.com/storage/${size}/${filename}.png`;
}

async function getTenantByTenantId(ctxPrisma, tenantId) {
  return await ctxPrisma.customer.findFirst({
    where: {
      tenant_id: tenantId,
      customer_type_id: 3,
      active: true
    }
  });
}
