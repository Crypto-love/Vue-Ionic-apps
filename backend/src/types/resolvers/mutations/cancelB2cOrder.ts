import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, stringArg } from 'nexus';
import stripeHelper, { getStripeInstance } from '../../services/payment/stripe';
import { sendEmail } from '../../services';
import { PaymentB2c, PrismaClient } from '@treedots/prisma';

export const cancelB2cOrder = mutationField('cancelB2cOrder', {
  type: 'PreOrder',
  args: {
    id: nonNull(intArg()),
    appMode: nonNull(stringArg())
  },
  resolve: async (_parent, { id, appMode }, context) => {
    let subTotalPrice = 0;
    const preOrders = await context.prisma.preOrder.findUnique({
      where: { id: id },
      include: {
        pre_order_item: true,
        paymentB2c: true
      }
    });
    if (!preOrders) throw new UserInputError('Order not found');

    if (!preOrders.pre_order_item.filter((x) => '-1,-2,11,14'.includes(x.order_item_status_id.toString())))
      throw new UserInputError('Order already cancelled or refunded');

    const user = await context.prisma.user.findUnique({
      where: { id: preOrders.pre_order_item[0].user_id },
      include: { eWallet: true }
    });

    const queries = [];
    for (const item of preOrders.pre_order_item.filter((x) =>
      '-1,-2,11,14'.includes(x.order_item_status_id.toString())
    )) {
      subTotalPrice = subTotalPrice + Number(Number(item.total_price) + Number(item.tax));

      const sku = await context.prisma.sku.findUnique({
        where: { id: item.sku_id },
        select: { is_b2c_pooling: true }
      });

      if (sku.is_b2c_pooling) {
        const poolItem = await context.prisma.poolItems.findFirst({
          where: { pre_order_item_id: item.id },
          include: { pool: true }
        });

        /* Update pool by increase remaining_qty and set isFulfilled to false */
        queries.push(
          context.prisma.pool.update({
            data: {
              remaining_qty: poolItem.pool.remaining_qty + poolItem.qty,
              is_fullfilled: false
            },
            where: {
              id: poolItem.pool_id
            }
          })
        );

        /* Delete `pool_items` record */
        queries.push(
          context.prisma.poolItems.delete({
            where: { id: poolItem.id }
          })
        );
      }

      /* Update the pre order item's status */
      queries.push(
        context.prisma.preOrderItem.update({
          where: { id: item.id },
          data: {
            active: true, //new logic on V3 for canceled item let the status still active
            order_item_status_id: 12 //set to 12 refunded no need set to B2C Canceled cause this mutation will also do refund
          }
        })
      );
    }

    /* Cancel or refund payment */
    subTotalPrice = calculateLastTotalPrice(preOrders.paymentB2c, subTotalPrice);
    let paymentStatusId = preOrders.payment_status_id;
    if (
      (preOrders.stripe_transaction_id ||
        preOrders.paymentB2c?.stripe_transaction_id ||
        preOrders.paymentB2c?.payment_transaction_id) &&
      [2, 3].includes(preOrders.payment_status_id)
    ) {
      // Refund to e-wallet if payment method e-wallet OR payment isn't e-wallet but user allow to refund to his/her wallet
      const paidWithEwallet = preOrders.paymentB2c.payment_method === 'EWALLET';
      if (paidWithEwallet || (!paidWithEwallet && user.eWallet?.is_refund_to_e_wallet)) {
        let lockedBalanceToIncrease = 0;
        if (paidWithEwallet) {
          lockedBalanceToIncrease = await calculateLockedBalanceToIncrease(
            context.prisma,
            preOrders.paymentB2c,
            subTotalPrice
          );
          if (lockedBalanceToIncrease > 0) {
            queries.push(
              context.prisma.paymentB2c.update({
                where: { id: preOrders.paymentB2c.id },
                data: {
                  increased_e_wallet_locked_balance: { increment: lockedBalanceToIncrease }
                }
              }),
              context.prisma.eWallet.update({
                where: { id: user.e_wallet_id },
                data: {
                  locked_balance: { increment: lockedBalanceToIncrease }
                }
              })
            );
          }
        }
        queries.push(
          context.prisma.eWalletTransaction.create({
            data: {
              e_wallet_id: user.e_wallet_id,
              amount: subTotalPrice,
              locked_amount: lockedBalanceToIncrease,
              transaction_type_id: 4, // Order Refund
              transaction_status_id: 2, // Complete
              description: `Refund for package ${id} from order #${preOrders.payment_b2c_id}`
            }
          })
        );
      } else {
        const stripeTransactionId = preOrders.stripe_transaction_id
          ? preOrders.stripe_transaction_id
          : preOrders.paymentB2c.stripe_transaction_id;
        const user = await context.prisma.user.findUnique({
          where: { id: preOrders.pre_order_item[0].user_id },
          include: { country: true }
        });
        const stripeInstance = getStripeInstance(user.country.currency_code);
        const stripeResponse =
          paymentStatusId === 2
            ? await stripeHelper.cancelPaymentIntent(stripeTransactionId, stripeInstance)
            : await stripeHelper.refundPaymentIntent(
                stripeTransactionId,
                Number((subTotalPrice * 100).toString().split('.')[0]),
                stripeInstance
              );
        if (stripeResponse.httpStatus !== 200) {
          throw new UserInputError('There is payment issue. Please contact our support');
        }
      }
    }

    /* Execute above queries */
    await context.prisma.$transaction(queries);

    paymentStatusId = 4; // Cancel status

    if (preOrders.paymentB2c) {
      await context.prisma.paymentB2c.update({
        data: {
          refunded_amount: {
            increment: subTotalPrice
          }
        },
        where: { id: preOrders.paymentB2c.id }
      });
    }

    /* Update the pre order's status and its payment status */
    await context.prisma.preOrder.update({
      where: { id: id },
      data: {
        payment_status_id: paymentStatusId,
        order_status_id: 12, // set to Refunded because refund already successful
        description: `Cancel from Titan Dashboard, Total Refund: ${subTotalPrice.toFixed(2)}`
      }
    });

    const preOrder = await context.prisma.preOrder.findFirst({
      where: {
        id: id
      },
      include: {
        user: true,
        order_status: true,
        paymentB2c: true,
        pre_order_item: {
          include: {
            sku: {
              include: {
                product: {
                  include: {
                    tenant: {
                      include: {
                        customer: {
                          where: { customer_type_id: 3, active: true },
                          take: 1
                        }
                      }
                    }
                  }
                }
              }
            },
            hub: {
              include: {
                addresses: {
                  where: { address_type_id: 1, active: true },
                  take: 1,
                  include: { country: true }
                }
              }
            }
          },
          take: 1
        }
      }
    });

    await sendEmailNotification(context.prisma, preOrder, context.firebase, appMode, subTotalPrice);

    return preOrder;
  }
});

function calculateLastTotalPrice(paymentB2c: PaymentB2c, totalItemAmount: number) {
  if (paymentB2c) {
    if (!paymentB2c?.stripe_transaction_id && !paymentB2c?.payment_transaction_id) return 0;
    const voucherPercentage = Number(paymentB2c.discount_amount) / Number(paymentB2c.order_total);
    const totalVoucherAmount = totalItemAmount * voucherPercentage;
    return totalItemAmount - totalVoucherAmount;
  } else {
    return totalItemAmount;
  }
}

async function calculateLockedBalanceToIncrease(
  prisma: PrismaClient,
  paymentB2c: PaymentB2c,
  amountToRefund: number // Amount to refund to e-wallet
) {
  const eWalletTransaction = await prisma.eWalletTransaction.findUnique({
    where: { id: paymentB2c.payment_transaction_id }
  });
  const deductedLockedBalance = eWalletTransaction ? Math.abs(Number(eWalletTransaction.locked_amount)) : 0;
  if (!deductedLockedBalance) return 0;

  const orderItems = await prisma.preOrderItem.findMany({
    where: {
      order_item_status_id: { in: [-1, -2, 11, 14] },
      active: true,
      pre_order: {
        payment_b2c_id: paymentB2c.id,
        order_status_id: { in: [-1, -2, 11, 14] },
        active: true
      }
    }
  });
  let currentOrderTotal = orderItems.reduce((sum, pre) => {
    return (sum += calculateLastTotalPrice(paymentB2c, Number(pre.total_price) + Number(pre.tax)));
  }, 0);
  currentOrderTotal -= amountToRefund;

  if (currentOrderTotal < deductedLockedBalance) {
    return deductedLockedBalance - currentOrderTotal - Number(paymentB2c.increased_e_wallet_locked_balance);
  } else {
    return 0;
  }
}

async function sendEmailNotification(
  ctxPrisma: any,
  orderData: any,
  firebase: any,
  appMode: any,
  subTotalPrice: any
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

  /* calculate amount to refund after discount or not */
  const hubData = getAddress(orderData.pre_order_item[0].hub.addresses);
  const tenantData = orderData.pre_order_item[0].sku.product.tenant.customer[0];
  const items: any = [];
  let totalItemQty = 0;

  for (const item of orderItems) {
    items.push({
      itemImageUrl: getImageUrl(item.sku.image),
      itemName: item.sku.name,
      itemPrice: hubData.currencySimbol.concat((Number(item.total_price) + Number(item.tax)).toFixed(2)),
      itemQuantity: item.total_qty
    });
    totalItemQty += item.total_qty;
  }

  // sendgrid email nofitication
  const currencySymbol = hubData.currencySimbol;
  await sendEmail({
    to: orderData.user.email,
    dynamic_template_data: {
      name: `${orderData.user.first_name || ''} ${orderData.user.last_name || ''}`.trim(),
      orderId: orderData.payment_b2c_id,
      packageNo: orderData.id,
      voucher_amount: `${currencySymbol}${orderData.paymentB2c.discount_amount}`,
      cancelled_qty: totalItemQty,
      totalRefund: currencySymbol.concat(subTotalPrice.toFixed(2)),
      collectionPoint: orderData.pre_order_item[0].hub.alias_name,
      collectionPointAddress: hubData.address,
      country: hubData.country,
      postalCode: hubData.postalCode,
      supplier: tenantData.name,
      items: items
    },
    template_id: 'd-ad286e567ede456b869f869adc458788'
  });

  //prepare data to send notification using firebase
  const message: any = {
    sender_user_id: 2, //mean admin do the collection point change
    target_user_id: orderData.user.id,
    topic: `${orderData.user.id}-${appMode}`,
    title: `🚫 Your order has been canceled.`,
    message: `Package ${
      orderData.id
    } in your order has been canceled and the amount of ${hubData.currencySimbol.concat(
      subTotalPrice.toFixed(2)
    )} will be refunded to you within 7-10 business days. Reach out to your Collection Point via our app if you did not request for cancelation or think you received this email by mistake. 💬`,
    payload: JSON.stringify({ order_id: orderData.id })
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
