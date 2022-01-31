import { PaymentB2c, PrismaClient } from '@treedots/prisma';
import { ForbiddenError, UserInputError } from 'apollo-server-errors';
import { intArg, mutationField, nonNull } from 'nexus';
import stripeHelper, { getStripeInstance } from '../../services/payment/stripe';

export const updatePreOrderItemB2CDashboard = mutationField((t) => {
  t.list.field('updatePreOrderItemB2CDashboard', {
    type: 'PreOrderItem',
    args: {
      customerBuyerId: intArg(),
      preOrderItemId: nonNull(intArg()),
      newTotalQty: nonNull(intArg())
    },
    resolve: async (_parent, { preOrderItemId, newTotalQty }, context) => {
      if (newTotalQty === 0) throw new ForbiddenError('Cannot update quantity to 0');

      const preOrderItem = await context.prisma.preOrderItem.findUnique({
        where: { id: preOrderItemId },
        include: {
          pre_order: {
            include: {
              paymentB2c: true
            }
          },
          sku: {
            include: {
              product: {
                select: {
                  tenant: { select: { tax_rate: true } }
                }
              }
            }
          },
          user: {
            include: {
              country: { select: { currency_code: true } },
              eWallet: { select: { is_refund_to_e_wallet: true } }
            }
          }
        }
      });
      if (!preOrderItem) throw new UserInputError('Item not found');

      const isNewTotalQtySameWithOldQty = preOrderItem.total_qty === newTotalQty;
      const isNewTotalQtyBigger = newTotalQty > preOrderItem.total_qty;
      if (isNewTotalQtySameWithOldQty || isNewTotalQtyBigger)
        throw new ForbiddenError(
          'Only can update the order if the new requested qty is different and smaller'
        );

      const taxRate =
        Number(preOrderItem.sku.tax_rate) > 0
          ? preOrderItem.sku.tax_rate
          : preOrderItem.sku.product.tenant.tax_rate;
      const updatedSubtotal = Number(preOrderItem.sale_unit_price) * newTotalQty;
      const updatedTaxAmount = updatedSubtotal * (Number(taxRate) / 100);

      const prismaQueries = [];
      prismaQueries.push(
        context.prisma.preOrderItem.update({
          data: {
            active: true,
            original_tax: updatedTaxAmount,
            original_total_price: updatedSubtotal,
            tax: updatedTaxAmount,
            total_price: updatedSubtotal,
            total_qty: newTotalQty,
            last_user_id: context.credential.userId
          },
          where: {
            id: preOrderItemId
          }
        })
      );

      const qtyToCancel = Number(preOrderItem.total_qty - newTotalQty);
      const subtotalToCancel = qtyToCancel * Number(preOrderItem.sale_unit_price);
      const taxToCancel = subtotalToCancel * (Number(taxRate) / 100);
      const canceledPreOrderItem: any = {
        ...preOrderItem,
        id: undefined,
        pre_order: undefined,
        sku: undefined,
        user: undefined
      };
      prismaQueries.push(
        context.prisma.preOrderItem.create({
          data: {
            ...canceledPreOrderItem,
            active: false,
            order_item_status_id: 13,
            original_tax: taxToCancel,
            original_total_price: subtotalToCancel,
            tax: taxToCancel,
            total_price: subtotalToCancel,
            total_qty: qtyToCancel,
            last_user_id: context.credential.userId,
            status_note: `Refund for Order Item #${preOrderItemId} of Order #${preOrderItem.order_id}`
          }
        })
      );
      const executeTransaction = await context.prisma.$transaction(prismaQueries);

      if (executeTransaction.length > 0) {
        const paymentB2c = preOrderItem.pre_order.paymentB2c;
        const amountToRefund = calculateRefundAmount(paymentB2c, subtotalToCancel + taxToCancel);

        if (amountToRefund === 0) return executeTransaction;

        const isPaidWithEwallet = paymentB2c.payment_method === 'EWALLET';
        if (isPaidWithEwallet || (!isPaidWithEwallet && preOrderItem.user.eWallet?.is_refund_to_e_wallet)) {
          let lockedBalanceToIncrease = 0;
          if (isPaidWithEwallet) {
            lockedBalanceToIncrease = await calculateLockedBalanceToIncrease(
              context.prisma,
              preOrderItem.pre_order.paymentB2c,
              amountToRefund
            );
            if (lockedBalanceToIncrease > 0) {
              await context.prisma.paymentB2c.update({
                where: { id: preOrderItem.pre_order.payment_b2c_id },
                data: {
                  increased_e_wallet_locked_balance: { increment: lockedBalanceToIncrease }
                }
              });
              await context.prisma.eWallet.update({
                where: { id: preOrderItem.user.e_wallet_id },
                data: {
                  locked_balance: { increment: lockedBalanceToIncrease }
                }
              });
            }
          }
          await context.prisma.eWalletTransaction.create({
            data: {
              e_wallet_id: preOrderItem.user.e_wallet_id,
              amount: amountToRefund,
              locked_amount: lockedBalanceToIncrease,
              transaction_type_id: 5, // Item Refund
              transaction_status_id: 2, // Complete
              description: `Refund for update quantity of ${preOrderItem.sku.name} from Order No. #${preOrderItem.pre_order.payment_b2c_id}`
            }
          });
        } else {
          const stripeTransactionId = preOrderItem.pre_order.stripe_transaction_id
            ? preOrderItem.pre_order.stripe_transaction_id
            : paymentB2c && paymentB2c.stripe_transaction_id
            ? paymentB2c.stripe_transaction_id
            : null;
          const stripeInstance = getStripeInstance(preOrderItem.user.country.currency_code);
          const stripeResponse = await stripeHelper.refundPaymentIntent(
            stripeTransactionId,
            Number(Number(amountToRefund.toFixed(2)) * 100),
            stripeInstance
          );
          if (!stripeResponse || (stripeResponse && stripeResponse?.httpStatus !== 200))
            throw new UserInputError('There is payment issue. Please contact our support');
        }

        await context.prisma.paymentB2c.update({
          data: {
            refunded_amount: {
              increment: amountToRefund
            }
          },
          where: { id: preOrderItem.pre_order.payment_b2c_id }
        });

        return executeTransaction;
      }
    }
  });
});

function calculateRefundAmount(paymentB2c: PaymentB2c, totalItemAmount: number) {
  if (paymentB2c) {
    if (!paymentB2c.stripe_transaction_id && !paymentB2c.payment_transaction_id) return 0;
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
  const currentOrderTotal = orderItems.reduce((sum, pre) => {
    return (sum += calculateRefundAmount(paymentB2c, Number(pre.total_price) + Number(pre.tax)));
  }, 0);

  const refundableLockedBalance =
    deductedLockedBalance - currentOrderTotal - Number(paymentB2c.increased_e_wallet_locked_balance);

  if (currentOrderTotal < deductedLockedBalance && refundableLockedBalance > 0) {
    return refundableLockedBalance > amountToRefund ? amountToRefund : refundableLockedBalance;
  } else {
    return 0;
  }
}
