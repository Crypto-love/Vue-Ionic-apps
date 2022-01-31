import { HubSpreeData, Pool, PoolItems, PreOrderItem, PrismaClient } from '@treedots/prisma';
import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, stringArg } from 'nexus';
import { getNewDate } from '../../utils/dateTime';
import { sendEmail } from '../../services';
import dayjs from 'dayjs';

export const changeGBCollectionPoint = mutationField('changeGBCollectionPoint', {
  type: 'PreOrder',
  args: {
    orderId: nonNull(intArg()),
    newSpreeId: nonNull(intArg()),
    appMode: nonNull(stringArg())
  },
  resolve: async (_parent, { orderId, newSpreeId, appMode }, { prisma, firebase }) => {
    let order = await prisma.preOrder.findUnique({
      where: { id: orderId },
      include: {
        pre_order_item: {
          where: { active: true }
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
        id: newSpreeId,
        Status: 0,
        active: true,
        end_date: { gte: new Date() }
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
      }
    });
    if (!newSpree) throw new UserInputError('Spree is not available');

    if (oldSpree.id == newSpree.id) throw new UserInputError('Cannot replace same collection point');

    if (oldSpree.tenant_id != newSpree.tenant_id)
      throw new UserInputError('Tenant of old spree and new spree is different');

    const queries = [];
    const poolingPreOrderItems = [];

    /* Update Pre Order */
    queries.push(
      prisma.preOrder.update({
        where: {
          id: orderId
        },
        data: {
          delivery_date: newSpree.delivery_date,
          close_date: newSpree.end_date,
          spree_id: newSpreeId
        }
      })
    );

    /* Update Pre Order Item & Its pool (if pooling item) */
    for (const item of order.pre_order_item) {
      queries.push(
        prisma.preOrderItem.update({
          where: { id: item.id },
          data: {
            customer_buyer_id: newSpree.hub_id
          }
        })
      );

      const sku = await prisma.sku.findUnique({
        where: { id: item.sku_id },
        select: { is_b2c_pooling: true }
      });

      if (sku.is_b2c_pooling) {
        poolingPreOrderItems.push(item);

        const poolItems = await prisma.poolItems.findMany({
          where: { pre_order_item_id: item.id },
          include: { pool: true }
        });

        poolItems.forEach((poolItem) => {
          /* Update pool by increase remaining_qty and set isFulfilled to false */
          queries.push(
            prisma.pool.update({
              data: {
                remaining_qty: poolItem.pool.remaining_qty + poolItem.qty,
                is_fullfilled: false
              },
              where: { id: poolItem.pool_id }
            })
          );

          /* Delete `pool_items` record */
          queries.push(
            prisma.poolItems.delete({
              where: { id: poolItem.id }
            })
          );
        });
      }
    }

    /* Execute above queries */
    await prisma.$transaction(queries);

    /* Set new Pool based on new spree */
    for (const item of poolingPreOrderItems) {
      await setPoolData(prisma, newSpree, item);
    }

    order = await prisma.preOrder.findUnique({
      where: { id: orderId },
      include: {
        pre_order_item: true,
        user: true,
        order_status: true
      }
    });

    await sendEmailNotification(prisma, order, newSpree, firebase, appMode);

    return order;
  }
});

/**
 * This function is copied `setPoolData` from groupBuyCheckout mutation
 * @param prisma PrismaClient
 * @param spree Spree of new collection point
 * @param preOrderItem Pooling pre order item
 */
async function setPoolData(prisma, spree, preOrderItem) {
  let poolData = await prisma.pool.findFirst({
    where: {
      sku_id: preOrderItem.sku_id,
      hub_id: spree.hub_id,
      close_date: spree.end_date,
      is_fullfilled: false
    },
    orderBy: {
      id: 'desc'
    }
  });

  const sku = await prisma.sku.findUnique({ where: { id: preOrderItem.sku_id } });

  if (!poolData || preOrderItem.total_qty >= sku.b2c_pooling_qty) {
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
        pool_qty: sku.b2c_pooling_qty,
        is_fullfilled: false,
        remaining_qty: sku.b2c_pooling_qty,
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

  const orderQty = preOrderItem.total_qty;
  let remainOrderQty = orderQty;

  if (orderQty < poolData.remaining_qty) {
    const updateExistingPool = await prisma.pool.update({
      data: {
        remaining_qty: poolData.remaining_qty - orderQty,
        updated_at: getNewDate()
      },
      where: {
        id: poolData.id
      }
    });
    const poolItems = await addPoolItem(prisma, updateExistingPool, preOrderItem, orderQty);
  } else {
    const updateExistingPool = await prisma.pool.update({
      data: {
        is_fullfilled: true,
        remaining_qty: 0,
        hub_id: spree.hub_id,
        close_date: spree.end_date,
        close_date_updated_at: undefined,
        updated_at: getNewDate()
      },
      where: {
        id: poolData.id
      }
    });
    remainOrderQty -= poolData.remaining_qty;

    const poolItems = await addPoolItem(prisma, updateExistingPool, preOrderItem, poolData.remaining_qty);

    while (remainOrderQty > 0) {
      const fulfilledImmediately = remainOrderQty >= sku.b2c_pooling_qty;
      const poolNewDataInsert = await prisma.pool.create({
        data: {
          sku_id: preOrderItem.sku_id,
          pool_qty: sku.b2c_pooling_qty,
          is_fullfilled: fulfilledImmediately,
          remaining_qty: fulfilledImmediately ? 0 : sku.b2c_pooling_qty - remainOrderQty,
          spree_id: spree.id,
          hub_id: spree.hub_id,
          close_date: spree.end_date,
          close_date_updated_at: undefined,
          created_at: getNewDate(),
          updated_at: undefined
        }
      });
      const poolQty = fulfilledImmediately ? sku.b2c_pooling_qty : remainOrderQty;
      const poolItems = await addPoolItem(prisma, poolNewDataInsert, preOrderItem, poolQty);

      remainOrderQty = fulfilledImmediately ? remainOrderQty - sku.b2c_pooling_qty : 0;
    }
  }
}

/**
 * This function is copied `setPoolItemData` from groupBuyCheckout mutation
 * @param prisma PrismaClient
 * @param pool Pool data
 * @param preOrderItem Pooling pre order item
 * @param qty Quantity of pool item
 * @returns Return new record of PoolItem
 */
async function addPoolItem(prisma: PrismaClient, pool: Pool, preOrderItem: PreOrderItem, qty: number) {
  return await prisma.poolItems.create({
    data: {
      pool: {
        connect: {
          id: pool.id
        }
      },
      PreOrderItem: {
        connect: {
          id: preOrderItem.id
        }
      },
      qty: qty,
      // user_id: preOrderItem.user_id
      user: {
        connect: {
          id: preOrderItem.user_id
        }
      }
    }
  });
}

async function sendEmailNotification(ctxPrisma: PrismaClient, orderData, newSpreeData, firebase, appMode) {
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
  const items = [];

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
      name: `${orderData.user.first_name} ${orderData.user.last_name}`,
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
        ? 'd-4430be7e181f481aa837bcc38b499c88'
        : 'd-e01c1da78ef54a7789582fb4d32e20d0'
  });

  //prepare data to send notification using firebase
  const message = {
    sender_user_id: 2, //mean admin do the collection point change
    target_user_id: orderData.user.id,
    topic: `${orderData.user.id}-${appMode}`,
    title: `🏠📍 Collection Point changed for your order ${orderData.payment_b2c_id}.`,
    message:
      orderData.order_status.name === 'B2C Processed'
        ? `Collection Point for your order has been changed to ${newSpreeData.hub.alias_name}, ${
            hubData.address
          }, ${hubData.country}, ${hubData.postalCode}. Come to pick up your order on ${dayjs(
            newSpreeData.delivery_date
          ).format(
            'DD MMMM YYYY'
          )}. Please reach out to your Collection Point via our app if you did not request for this change or think you received this by mistake. 💬`
        : `Collection Point for your order has been changed to ${newSpreeData.hub.alias_name}, ${
            hubData.address
          }, ${hubData.country}, ${hubData.postalCode} with new estimated collection date on ${dayjs(
            newSpreeData.delivery_date
          ).format(
            'DD MMMM YYYY'
          )}. Please reach out to your Collection Point via our app if you did not request for this change or think you received this by mistake. 💬`,
    payload: JSON.stringify({ payment_b2c_id: orderData.payment_b2c_id })
  };

  // -- Send notification message
  const notification = await firebase.sendNotification(message);
}

function getAddress(addressData) {
  if (!addressData)
    return { country: 'Singapore', postalCode: 'nodata', address: 'nodata', currencySimbol: 'S$' };
  return {
    country: addressData[0].country.description,
    postalCode: addressData[0].postal_code,
    currencySimbol: addressData[0].country.currency_symbol,
    address: addressData[0].road || ''.concat(', ', addressData[0].street_number || '')
  };
}

function getImageUrl(filename, size = 'large') {
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
