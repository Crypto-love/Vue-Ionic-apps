import Stripe from 'stripe';
import { STRIPE_COUNTRY } from '../../../constants';

const { STRIPE_SECRET_KEY_SGD, STRIPE_VERSION, STRIPE_SECRET_KEY_MYR } = process.env;

export const stripeSGD: Stripe = new Stripe(STRIPE_SECRET_KEY_SGD, {
  apiVersion: STRIPE_VERSION as Stripe.LatestApiVersion
});

export const stripeMYR: Stripe = new Stripe(STRIPE_SECRET_KEY_MYR, {
  apiVersion: STRIPE_VERSION as Stripe.LatestApiVersion
});

export const getStripeInstance = (currencyCode: string): Stripe => {
  if (currencyCode === STRIPE_COUNTRY.SINGAPORE) return stripeSGD;
  else if (currencyCode === STRIPE_COUNTRY.MALAYSIA) return stripeMYR;
  else return null;
};

export const formatStripeError = (error: Stripe.StripeError): any => {
  return {
    requestId: error.requestId,
    httpStatus: error.statusCode,
    code: error.code,
    type: error.type,
    rawType: error.rawType,
    message: (error.raw as any)?.message ?? error.message ?? 'An error occured'
  };
};
