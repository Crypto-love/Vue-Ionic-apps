import { PrismaClient } from '@treedots/prisma';
import { extendType, stringArg, intArg, nonNull } from 'nexus';
import { Stripe } from 'stripe';
import { HTTP_STATUS } from '../../HttpStatus';
import stripeHelper from '../../services/payment/stripe';

const getUserInfo = async (prisma: PrismaClient, userId: number) => {
  return await prisma.user.findUnique({ where: { id: userId } });
};

const addStripeCard = async (_, { cardNumber, expMonth, expYear, cvc }, { credential, stripe, prisma }) => {
  let stripeCustomerId;
  try {
    const user = await getUserInfo(prisma, credential.userId);
    if (!user.stripe_customer_id) {
      const createdCustomer: any = await stripeHelper.createStripeCustomer(
        {
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          email: user.email
        },
        stripe
      );

      if (createdCustomer.httpStatus !== HTTP_STATUS.OK) {
        return {
          error: createdCustomer.code,
          message: createdCustomer.message
        };
      } else {
        await prisma.user.update({
          data: {
            stripe_customer_id: createdCustomer.id
          },
          where: {
            id: user.id
          }
        });
      }
      stripeCustomerId = createdCustomer.id;
    }
    const createdCard: any = await stripeHelper.createPaymentMethodforCustomer(
      stripe,
      {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc
      },
      user.stripe_customer_id ? user.stripe_customer_id : stripeCustomerId
    );
    if (createdCard.httpStatus !== HTTP_STATUS.OK) {
      return {
        error: createdCard.code,
        message: createdCard.message
      };
    }

    // Set first added card as default card
    if (!user.stripe_card_id) {
      await prisma.user.update({
        data: { stripe_card_id: createdCard.id },
        where: { id: user.id }
      });
    }
    return {
      paymentMethodId: createdCard.id,
      stripeCustomerId: user.stripe_customer_id,
      card: createdCard.card
    };
  } catch (e) {
    return e;
  }
};

const setDefaultCard = async (_root, { paymentMethodId }, { credential, stripe, prisma }) => {
  try {
    const user = await getUserInfo(prisma, credential.userId);
    const updatedStripeCustomer: any = await stripeHelper.updateStripeCustomer(
      stripe,
      user.stripe_customer_id,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      }
    );
    if (updatedStripeCustomer.httpStatus !== HTTP_STATUS.OK) {
      return {
        error: updatedStripeCustomer.code,
        message: updatedStripeCustomer.message
      };
    }
    await prisma.user.update({
      data: {
        stripe_card_id: paymentMethodId
      },
      where: {
        id: user.id
      }
    });
    return {
      paymentMethodId: paymentMethodId,
      stripeCustomerId: user.stripe_customer_id
    };
  } catch (e) {
    return e;
  }
};

const removeCard = async (_root, { paymentMethodId }, { credential, stripe, prisma }) => {
  try {
    const user = await getUserInfo(prisma, credential.userId);
    const data = await stripeHelper.detachPaymentMethod(stripe, paymentMethodId);
    const defaultPaymentMethod = (data.customer as Stripe.Customer)?.invoice_settings?.default_payment_method; // only received if delete card_
    const defaultCard = (data.customer as Stripe.Customer)?.default_source; // only received if delete card_
    // if delete card_ but there's still another card_ in list, set that default to invoice settings
    if (defaultPaymentMethod === null && defaultCard !== null) {
      const updateCustomer: any = await stripeHelper.updateStripeCustomer(stripe, user.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: defaultCard as string
        }
      });

      if (updateCustomer.httpStatus !== HTTP_STATUS.OK) {
        return {
          error: updateCustomer.code,
          message: updateCustomer.message
        };
      }
      await prisma.user.update({
        data: {
          stripe_card_id: defaultCard as string
        },
        where: {
          id: user.id
        }
      });
    }

    // set default if delete pm_ but still have card_ , stripe will set it to default, but when delete pm_ you will not receive default_source
    const checkUserDefaultPayment = await stripeHelper.getStripeCustomer(
      stripe,
      'get',
      user.stripe_customer_id
    );
    const currentDefaultPaymentMethod = (checkUserDefaultPayment as Stripe.Customer)?.invoice_settings
      ?.default_payment_method;

    if (currentDefaultPaymentMethod === null) {
      await prisma.user.update({
        data: {
          stripe_card_id: checkUserDefaultPayment.default_source
        },
        where: {
          id: user.id
        }
      });
    }

    return {
      paymentMethodId: checkUserDefaultPayment.default_source || paymentMethodId,
      stripeCustomerId: user.stripe_customer_id
    };
  } catch (e) {
    return e;
  }
};

export const StripeCardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addStripeCard', {
      type: 'CardResponse',
      args: {
        cardNumber: nonNull(stringArg()),
        expMonth: nonNull(intArg()),
        expYear: nonNull(intArg()),
        cvc: nonNull(stringArg()),
        description: stringArg()
      },
      resolve: addStripeCard
    });
    t.field('setDefaultStripeCard', {
      type: 'CardResponse',
      args: {
        paymentMethodId: nonNull(stringArg())
      },
      resolve: setDefaultCard
    });
    /*
      Changing from card_ to pm_ (Payment Method)

      Problems will occur if you try to detach a `card_` payment method from a Customer
      When you're detaching the `card_` from the Customer, check the user detail,
      if it has `default_source` set, means you're removing the payment method with id prefix `card_`
      if it's not, it means you're removing the card with id prefix `pm_`
      The differences is that `card_` will try to set other cards(card_ only) as default when removed and `pm_` not

      There is an approach for this issue

      - Setting default card
      I recommend doing something like this: check for `invoice_settings.default_payment_method` first
      if that doesn't exist check for `default_source` and make that the `invoice_settings.default_payment_method`.
      Basically use `default_source` as a fallback if needed,
      but rely on `invoice_settings.default_payment_method` as the source of truth.
      this is to eliminate existing `card_`

      - No default card when removing card (NOT_WORKING!)
      I've also tried to make the `default_source` to null. forcing the same behaviour for `card_` and `pm_`,
      for now it's still not working
    */
    t.field('removeStripeCard', {
      type: 'CardResponse',
      args: {
        paymentMethodId: nonNull(stringArg())
      },
      resolve: removeCard
    });
  }
});

export const StripeCardQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('listCustomerCard', {
      type: 'CardResponse',
      resolve: async (_root, __, { credential, prisma, stripe }) => {
        try {
          const user = await getUserInfo(prisma, credential.userId);
          const listCustomerCard: any = await stripeHelper.getListCustomerCard(
            stripe,
            user.stripe_customer_id
          );
          if (listCustomerCard.httpStatus !== HTTP_STATUS.OK) {
            return {
              error: listCustomerCard.code,
              message: listCustomerCard.message
            };
          }
          return listCustomerCard;
        } catch (e) {
          return e;
        }
      }
    });
    t.field('getDefaultCard', {
      type: 'CardResponse',
      resolve: async (_root, __, { credential, prisma }) => {
        try {
          const listCustomerCard = await getUserInfo(prisma, credential.userId);
          return {
            paymentMethodId: listCustomerCard.stripe_card_id,
            stripeCustomerId: listCustomerCard.stripe_customer_id
          };
        } catch (e) {
          return e;
        }
      }
    });
  }
});
