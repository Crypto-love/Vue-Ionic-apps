import { rule } from 'graphql-shield';
import { STRIPE_COUNTRY } from '../constants';
import { stripeMYR, stripeSGD } from '../services/payment/stripe';
import { Context } from '../../context';

export const checkUserCountryForStripe = rule()((parent, args, context) => {
  const userCountry = context.request?.user?.country?.currency_code;
  // context.stripe = userCountry === STRIPE_COUNTRY.SINGAPORE ? stripeSGD : stripeMYR; // TODO will use this after all API is migrated to V3. For now all user will use SG key
  context.stripe = stripeSGD;
  return userCountry !== null;
});

export const populateStripeAccount = rule()(async (_parent, _args, { prisma, request }: Context) => {
  const { user } = request;
  const data = await prisma.user.findFirst({
    select: {
      id: true,
      email: true,
      username: true,
      stripe_customer_id: true,
      stripe_card_id: true,
      active: true
    },
    where: {
      id: user.userId
    }
  });
  request.user = data;
  return data !== null;
});
