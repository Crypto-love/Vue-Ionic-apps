import helper from './helper';
import { mutationField, stringArg, list, intArg, nonNull } from 'nexus';
import { UserInputError } from 'apollo-server-errors';
import { getNewDate } from '../../../utils/dateTime';
import stripeHelper, { getStripeInstance } from '../../../services/payment/stripe';
import { VoucherDiscountType } from '../../../constants';

export const groupBuyCheckout = mutationField((t) => {
  t.list.field('groupBuyCheckout', {
    type: 'GroupBuyCheckout',
    args: {
      userId: nonNull(intArg()),
      tenantId: nonNull(intArg()),
      hubId: nonNull(intArg()),
      deliveryDate: nonNull(stringArg()), // ISO Format
      description: stringArg(),
      voucherDiscount: stringArg(),
      voucherDiscountType: stringArg(),
      vouchercode: stringArg(),
      voucherMinimumAmount: stringArg(),
      cartItems: nonNull(list('GroupBuyCheckoutInputCardItem'))
    },
    resolve: async (
      _,
      {
        userId,
        tenantId,
        hubId,
        deliveryDate,
        description,
        voucherDiscount,
        voucherDiscountType,
        vouchercode,
        voucherMinimumAmount,
        cartItems
      },
      context
    ) => {
      // validate voucher discount type
      if (voucherDiscountType && VoucherDiscountType.indexOf(voucherDiscountType) === -1)
        throw new UserInputError('Voucher discount type invalid');

      if (!cartItems.length) throw new UserInputError('Order item cannot be empty');

      // get user info
      const user = await context.prisma.user.findUnique({
        where: { id: userId },
        include: { country: true }
      });
      if (!user.stripe_card_id || !user.stripe_customer_id)
        throw new UserInputError("User don't have a default credit card");

      const stripe = getStripeInstance(user.country.currency_code);
      const currency = user.country.currency_code;

      // split to create order by supplier
      let preOrderList = [];
      let preOrderIds = [];
      let preOrderItems = [];
      let completedPool = [];
      let customerCartItems = [];
      const inventoriesUpdateInfo = [];
      let totalAmountToCharge = 0;
      let totalOrderAmount = 0;

      // Validate: Spree
      const spreeData: any = await context.prisma.hubSpreeData.findFirst({
        where: {
          active: true,
          Status: 0,
          hub_id: hubId,
          tenant_id: tenantId,
          delivery_date: deliveryDate
        },
        orderBy: {
          delivery_date: 'asc'
        }
      });
      if (!spreeData) throw new UserInputError('Spree not available');

      // Validate: Skus
      const orderedSkus = await context.prisma.sku.findMany({
        where: {
          active: true,
          b2c: true,
          id: { in: cartItems.map((v) => v.skuId) },
          product: { active: true }
        },
        include: {
          product: {
            include: { tenant: true }
          },
          b2c_oom: {
            select: { name: true }
          },
          b2c_uom: {
            select: { name: true }
          },
          inventories: {
            where: { active: true, product_type_id: 1 }, // Sale inventory
            orderBy: { rank: 'asc' }
          }
        }
      });
      if (orderedSkus.length < cartItems.length)
        throw new UserInputError('One or more items are not available');

      // Check the Inventory
      const customerCart = {
        user_id: user.id,
        customer_id: hubId,
        user,
        items: []
      };
      for await (const sku of orderedSkus) {
        if (sku.is_b2c_pooling != orderedSkus[0].is_b2c_pooling)
          throw new UserInputError('Cannot combine pooling and non-pooling item into one order');

        if (sku.product.tenant_id != orderedSkus[0].product.tenant_id)
          throw new UserInputError('Cannot order an items from different Tenant');

        const cartItem = cartItems.find((v) => v.skuId == sku.id);
        const correspondingInventory = sku.inventories.filter(
          (inventory: any) => inventory.quantity < 0 || inventory.quantity >= cartItem.quantity
        );
        if (correspondingInventory.length === 0) throw new UserInputError(`Insufficient Stock: ${sku.name}`);

        const selectedInventory = correspondingInventory[0];
        if (selectedInventory.quantity !== -1) {
          inventoriesUpdateInfo.push({
            id: selectedInventory.id,
            quantity: selectedInventory.quantity - cartItem.quantity
          });
        }
        customerCart.items.push({
          sku,
          sku_id: sku.id,
          inventory: selectedInventory,
          order_quantity: cartItem.quantity
        });
      }

      // Insert the Data
      const preorder = await helper.processPreOrderBySupplier(context, {
        spreeData,
        customerCart,
        hubId,
        tenantId,
        currency,
        userId: user.id,
        description
      });

      // calculate total amount for charge
      totalAmountToCharge += preorder.totalAmountToCharge;
      preOrderIds = preOrderIds.concat(preorder.preOrders.map((o) => o.id));
      preOrderList = preOrderList.concat(preorder.preOrders);

      // update proceed pre order item
      preOrderItems = preOrderItems.concat(preorder.preOrderItems);

      // update coompleted pool items
      completedPool = completedPool.concat(preorder.completedPool);

      // delete unused data
      Reflect.deleteProperty(preorder, 'preOrderItems');
      Reflect.deleteProperty(preorder, 'completedPool');

      // calculate discount amount
      totalOrderAmount = totalAmountToCharge;
      const discountAmount = helper.calculateDiscountAmount(
        voucherDiscount,
        voucherDiscountType,
        totalAmountToCharge
      );

      // recalculate total charged if user apply voucher_discount
      totalAmountToCharge = totalAmountToCharge - discountAmount;

      // create payment info
      const paymentB2c = await context.prisma.paymentB2c.create({
        data: {
          payment_method: 'STRIPE',
          order_total: totalOrderAmount,
          discount_amount: totalOrderAmount - totalAmountToCharge,
          voucher_code: vouchercode,
          voucher_discount_type: voucherDiscountType,
          voucher_discount: voucherDiscount,
          voucher_minimum_amount: voucherMinimumAmount,
          status: 0,
          active: true,
          created_date: getNewDate()
        }
      });

      let payment_status_id: number;
      try {
        let paymentId: string;
        if (totalAmountToCharge > 0) {
          // process create payment intent by stripe
          const stripeResponse: any = await stripeHelper.createPaymentIntent(
            {
              amount: Number(totalAmountToCharge.toFixed(2)) * 100,
              currency
            },
            user.stripe_customer_id,
            user.stripe_card_id,
            'automatic',
            true,
            `B2C payment for #${paymentB2c.id}`,
            stripe
          );

          if (stripeResponse.httpStatus === 200) paymentId = stripeResponse.id;
          else throw new Error(`${stripeResponse.httpStatus}:${stripeResponse.message}`);
        }

        // update payment status and payment date
        await context.prisma.paymentB2c.update({
          data: {
            stripe_transaction_id: paymentId,
            status: 1
          },
          where: {
            id: paymentB2c.id
          }
        });

        // update preorder payment status for non MOV order
        if (preOrderIds.length > 0) {
          await context.prisma.preOrder.updateMany({
            data: {
              payment_status_id: 3,
              payment_b2c_id: paymentB2c.id,
              payment_date: getNewDate()
            },
            where: {
              id: { in: preOrderIds }
            }
          });
        }

        // process MOV order
        payment_status_id = 3;
      } catch (e) {
        console.log(e.message);
        await context.prisma.paymentB2c.update({
          data: {
            description: e.message
          },
          where: {
            id: paymentB2c.id
          }
        });

        // update preorder status
        await context.prisma.preOrder.updateMany({
          data: {
            payment_status_id: 10,
            payment_b2c_id: paymentB2c.id,
            order_status_id: 17
          },
          where: {
            id: { in: preOrderIds }
          }
        });

        // update order item status id
        await context.prisma.preOrderItem.updateMany({
          data: {
            order_item_status_id: 17
          },
          where: {
            id: { in: preOrderItems.map((o) => o.id) }
          }
        });

        // delete reserved b2c stocks if payment failed
        await context.prisma.reservedStockB2c.deleteMany({
          where: {
            id: { in: preOrderItems.map((o) => o.id) }
          }
        });

        payment_status_id = 10;
      }

      // remove cartItems from order in case stripe return ok
      if (payment_status_id !== 10) {
        // update inventory info process in asynchronous to reduce the response time of API
        await helper.reduceInventory(context.prisma, inventoriesUpdateInfo);
        // send email about order confirmation status

        await helper.sendEmailOrderConfirmation(context, {
          preOrderList,
          totalAmountToCharge,
          paymentB2c,
          userId
        });

        // send complete pool email
        completedPool.forEach((preOrderItemId) => {
          helper.sendEmailCompletedPool(context, preOrderItemId, userId);
        });

        // async send data to event tracking and send email about order delivery date confirmed
        preOrderList.map((order) => {
          const spreeData = order.spreeData;

          Reflect.deleteProperty(order, 'spreeData');

          helper.trackEvent('Charged', context, {
            preOrderData: order,
            spreeData,
            totalAmountToCharge,
            currency,
            userId: user.id,
            paymentB2cId: paymentB2c.id
          });

          helper.sendEmailOrderDeliveryDateConfirmed(context, {
            preOrderData: order,
            spreeData,
            paymentB2c,
            userId
          });

          order.payment_status_id = payment_status_id;

          // prepare customer cart items
          customerCartItems = customerCartItems.concat(order.cartItems);
        });

        // send redemption to voucherify
        if (!!voucherDiscount) {
          helper.redeemVoucher(
            {
              orderItems: customerCartItems,
              user,
              vouchercode,
              totalOrderAmount
            },
            context
          );
        }
      } else {
        preOrderList.map((order) => {
          Reflect.deleteProperty(order, 'spreeData');
          order.payment_status_id = payment_status_id;
        });
      }

      return preOrderList;
    }
  });
});
