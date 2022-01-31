import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, stringArg } from 'nexus';
import stripeHelper, { getStripeInstance } from '../../services/payment/stripe';
import { sendEmail } from '../../services';
import { PaymentB2c, PrismaClient } from '@treedots/prisma';

export const cancelB2cOrderItem = mutationField('cancelB2cOrderItem', {
  type: 'PreOrder',
  args: {
    id: nonNull(intArg()),
    appMode: nonNull(stringArg())
  },
  resolve: async (_parent, { id, appMode }, context) => {
    const preOrderItem = await context.prisma.preOrderItem.findUnique({
      where: { id: id },
      include: {
        pre_order: {
          include: {
            user: true,
            paymentB2c: true,
            pre_order_item: {
              where: {
                active: true
              }
            }
          }
        },
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
        },
        user: {
          include: {
            country: true,
            eWallet: true
          }
        }
      }
    });
    if (!preOrderItem) throw new UserInputError('Item not found');

    if (!'-1,-2,11,14'.includes(preOrderItem.order_item_status_id.toString()))
      throw new UserInputError('Item already cancelled or refunded');

    const queries = [];
    if (preOrderItem.sku.is_b2c_pooling) {
      const poolItems = await context.prisma.poolItems.findMany({
        where: { pre_order_item_id: preOrderItem.id },
        include: {
          pool: {
            include: {
              pool_item: {
                include: {
                  PreOrderItem: {
                    select: {
                      order_id: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      /* Update pool by increase remaining_qty and set isFulfilled to false */
      for (const poolItem of poolItems) {
        queries.push(
          context.prisma.pool.update({
            data: {
              remaining_qty: { increment: poolItem.qty },
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

        if (poolItem.pool.is_fullfilled) {
          /* Update pre_order_item status of all related pool item */
          queries.push(
            context.prisma.preOrderItem.updateMany({
              where: {
                AND: [
                  { id: { in: poolItem.pool.pool_item.map((item) => item.pre_order_item_id) } },
                  { id: { not: id } }
                ]
              },
              data: {
                order_item_status_id: -2
              }
            })
          );

          /* Update pre_order status of all related pool item */
          queries.push(
            context.prisma.preOrder.updateMany({
              where: {
                AND: [{ id: { in: poolItem.pool.pool_item.map((item) => item.PreOrderItem.order_id) } }]
              },
              data: {
                order_status_id: -2
              }
            })
          );
        }
      }
    }

    /* Update payment amount or partialy refund */
    const preOrder = preOrderItem.pre_order;
    const refundAmount = calculateRefundAmount(
      preOrderItem.pre_order.paymentB2c,
      Number(preOrderItem.total_price) + Number(preOrderItem.tax)
    );

    /* Update the pre order item's status */
    queries.push(
      context.prisma.preOrderItem.update({
        where: { id: preOrderItem.id },
        data: {
          active: true, //new logic on V3 for canceled item let the status still active
          order_item_status_id: 12, //set to 12 refunded no need set to B2C Canceled cause this mutation will also do refund
          description: `Cancel from Titan Dashboard, Total Refund: ${refundAmount.toFixed(2)}`
        }
      })
    );

    /* Update preorder to refunded in case no more order item in pre order */
    if (preOrder.pre_order_item.length === 1) {
      queries.push(
        context.prisma.preOrder.update({
          where: { id: preOrder.id },
          data: {
            order_status_id: 12 //set to 12 refunded no need set to B2C Canceled cause this mutation will also do refund
          }
        })
      );
    }

    if (
      (preOrder.stripe_transaction_id ||
        preOrder.paymentB2c?.stripe_transaction_id ||
        preOrder.paymentB2c?.payment_transaction_id) &&
      [2, 3].includes(preOrder.payment_status_id)
    ) {
      // Refund to e-wallet if payment method e-wallet OR payment isn't e-wallet but user allow to refund to his/her wallet
      const paidWithEwallet = preOrder.paymentB2c.payment_method === 'EWALLET';
      if (paidWithEwallet || (!paidWithEwallet && preOrderItem.user.eWallet?.is_refund_to_e_wallet)) {
        let lockedBalanceToIncrease = 0;
        if (paidWithEwallet) {
          lockedBalanceToIncrease = await calculateLockedBalanceToIncrease(
            context.prisma,
            preOrderItem.pre_order.paymentB2c,
            refundAmount
          );
          if (lockedBalanceToIncrease > 0) {
            queries.push(
              context.prisma.paymentB2c.update({
                where: { id: preOrder.paymentB2c.id },
                data: {
                  increased_e_wallet_locked_balance: { increment: lockedBalanceToIncrease }
                }
              }),
              context.prisma.eWallet.update({
                where: { id: preOrderItem.user.e_wallet_id },
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
              e_wallet_id: preOrderItem.user.e_wallet_id,
              amount: refundAmount,
              locked_amount: lockedBalanceToIncrease,
              transaction_type_id: 5, // Item Refund
              transaction_status_id: 2, // Complete
              description: `Refund for item ${preOrderItem.sku.name} from Order No. #${preOrder.payment_b2c_id}`
            }
          })
        );
      } else {
        const stripeInstance = getStripeInstance(preOrderItem.user.country.currency_code);
        const stripeResponse = await stripeHelper.refundPaymentIntent(
          preOrder.stripe_transaction_id
            ? preOrder.stripe_transaction_id
            : preOrder.paymentB2c.stripe_transaction_id,
          // Number(refundAmount.toFixed(2)) * 100
          Number((refundAmount * 100).toString().split('.')[0]),
          stripeInstance
        );
        if (stripeResponse?.httpStatus !== 200) {
          throw new UserInputError('There is payment issue. Please contact our support');
        }
      }
    }

    // Execute above queries
    await context.prisma.$transaction(queries);

    //check if all the items are refunded ? if yes update order status to refunded
    const checkItems = await context.prisma.preOrderItem.findMany({
      where: { order_id: preOrder.id, order_item_status_id: { notIn: [12, 13] } }
    });
    if (checkItems.length === 0) {
      //update order status to refunded
      await context.prisma.preOrder.update({
        data: { order_status_id: 12 },
        where: { id: preOrder.id }
      });
    }

    await context.prisma.paymentB2c.update({
      data: {
        refunded_amount: {
          increment: refundAmount
        }
      },
      where: { id: preOrder.paymentB2c.id }
    });

    await sendEmailNotification(preOrderItem, refundAmount, context.firebase, appMode);

    return context.prisma.preOrder.findUnique({
      where: { id: preOrderItem.order_id },
      include: { pre_order_item: true }
    });
  }
});

function calculateRefundAmount(paymentB2c: PaymentB2c, totalItemAmount: number) {
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
    return (sum += calculateRefundAmount(paymentB2c, Number(pre.total_price) + Number(pre.tax)));
  }, 0);
  currentOrderTotal -= amountToRefund;

  if (currentOrderTotal < deductedLockedBalance) {
    return deductedLockedBalance - currentOrderTotal - Number(paymentB2c.increased_e_wallet_locked_balance);
  } else {
    return 0;
  }
}

async function sendEmailNotification(orderItemData: any, refundAmount: number, firebase: any, appMode: any) {
  // sendgrid email nofitication
  const currencySymbol = orderItemData.hub.addresses[0].country.currency_symbol;
  await sendEmail({
    to: orderItemData.pre_order.user.email,
    dynamic_template_data: {
      name: `${orderItemData.pre_order.user.first_name || ''} ${
        orderItemData.pre_order.user.last_name || ''
      }`.trim(),
      paymentId: orderItemData.pre_order.payment_b2c_id,
      voucher_amount: `${currencySymbol}${orderItemData.pre_order.paymentB2c.discount_amount}`,
      cancelled_qty: orderItemData.total_qty,
      totalRefund: `${currencySymbol}${refundAmount.toFixed(2)}`,
      packageNo: orderItemData.order_id,
      supplier: orderItemData.sku.product.tenant.customer[0].name,
      productName: orderItemData.sku.name,
      imageUrl: getImageUrl(orderItemData.sku.image),
      price: currencySymbol.concat(
        (Number(orderItemData.total_price) + Number(orderItemData.tax)).toFixed(2)
      ),
      quantity: orderItemData.total_qty
    },
    template_id: 'd-ecb20180559f4464b0ded7fb3eeef0f0'
  });

  //prepare data to send notification using firebase
  const message: any = {
    sender_user_id: 2, //mean admin do the collection point change
    target_user_id: orderItemData.pre_order.user.id,
    topic: `${orderItemData.pre_order.user.id}-${appMode}`,
    title: `🚫 Item canceled`,
    message: `${orderItemData.sku.name} has been canceled from your order #${orderItemData.pre_order.payment_b2c_id}} and we have refunded the amount for this item to you. it might take 7-10 business days for a refund to appear in your bank account. Reach out to your Collection Point via our app if you did not request for cancelation or think you received this email by mistake. 💬`,
    payload: JSON.stringify({ payment_b2c_id: orderItemData.pre_order.payment_b2c_id })
  };

  // -- Send notification message
  await firebase.sendNotification(message);
}

function getImageUrl(filename: string, size = 'large') {
  const noImage = 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png';
  if (!filename) return noImage;
  return `https://production.thetreedots.com/storage/${size}/${filename}.png`;
}
