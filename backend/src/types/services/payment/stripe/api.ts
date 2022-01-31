import Stripe from 'stripe';
import { formatStripeError } from './helper';
import {
  IStripeCreatePaymentIntents,
  IStripeCreateSetupIntents,
  IStripeCreateCustomer,
  IStripeCreatePaymentMethod,
  StripeReturnType
} from './types';

import { HTTP_STATUS } from '../../../HttpStatus';
import * as Sentry from '@sentry/node';

const createPaymentMethodforCustomer = async (
  stripe: Stripe,
  card: IStripeCreatePaymentMethod,
  customer: string
): Promise<StripeReturnType<Stripe.PaymentMethod>> => {
  try {
    const paymentMethod = await createPaymentMethod(card, stripe);
    if (paymentMethod.httpStatus !== HTTP_STATUS.OK) {
      return paymentMethod;
    }
    const linkedPaymentMethod = await attachPaymentMethod(customer, paymentMethod.id as string, stripe);
    if (linkedPaymentMethod.httpStatus !== HTTP_STATUS.OK) {
      return linkedPaymentMethod;
    }
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...linkedPaymentMethod
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const attachPaymentMethod = async (
  customerId: string,
  paymentId: string,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.PaymentMethod>> => {
  try {
    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentId, {
      customer: customerId
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...attachedPaymentMethod
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const getStripeCustomer = async (
  stripe: Stripe,
  method: string,
  stripeCustomerId?: string,
  options?: IStripeCreateCustomer
): Promise<StripeReturnType<Stripe.Customer>> => {
  try {
    let customers;
    switch (method) {
      case 'get':
        customers = await stripe.customers.retrieve(stripeCustomerId);
        break;
      case 'confirm':
        customers = await stripe.customers.create(options);
        break;
      default:
        break;
    }
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...customers
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const createStripeCustomer = async (
  options: IStripeCreateCustomer,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.Customer>> => {
  try {
    const createdCustomer = await stripe.customers.create(options);
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...createdCustomer
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const createPaymentMethod = async (
  card: IStripeCreatePaymentMethod,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.PaymentMethod>> => {
  try {
    const createdPaymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...createdPaymentMethod
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const createSetupIntents = async (
  options: IStripeCreateSetupIntents,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.SetupIntent>> => {
  try {
    const createdSetupIntents = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      customer: options.customer,
      payment_method: options.paymentMethod,
      description: options.description,
      confirm: true
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...createdSetupIntents
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const createPaymentIntent = async (
  options: IStripeCreatePaymentIntents,
  stripeCustomerId: string,
  stripePaymentMethodId: string,
  stripeCaptureMethod = 'manual',
  confirm = false,
  description: string,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.PaymentIntent>> => {
  try {
    // convert the amount to int to make sure the date sending to stripe is integer ( not a number )
    options.amount = parseInt(options.amount.toFixed(0));

    const data: Stripe.PaymentIntentCreateParams = {
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      capture_method: stripeCaptureMethod as Stripe.PaymentIntentCreateParams.CaptureMethod,
      confirm,
      description,
      ...options
    };

    const createdPaymentIntents = await stripe.paymentIntents.create(data);
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...createdPaymentIntents
    };
    return result;
  } catch (e) {
    Sentry.captureException(e);
    return formatStripeError(e);
  }
};

const cancelPaymentIntent = async (
  paymentId: string,
  stripe: Stripe
): Promise<StripeReturnType<Stripe.PaymentIntent>> => {
  try {
    const canceledPaymentIntent = await stripe.paymentIntents.cancel(paymentId, {
      cancellation_reason: 'requested_by_customer'
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...canceledPaymentIntent
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const updatePaymentIntent = async (
  paymentId: string,
  stripe: Stripe,
  method: string
): Promise<StripeReturnType<Stripe.PaymentIntent>> => {
  try {
    let updatedPaymentIntent;
    switch (method) {
      case 'capture':
        updatedPaymentIntent = await stripe.paymentIntents.capture(paymentId);
        break;
      case 'confirm':
        updatedPaymentIntent = await stripe.paymentIntents.confirm(paymentId);
        break;
      default:
        break;
    }
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...updatedPaymentIntent
    };
    return result;
  } catch (e) {
    Sentry.captureException(e);
    return formatStripeError(e);
  }
};

const refundPaymentIntent = async (
  paymentId: string,
  amount: number = null, // fully refund if amount = null
  stripe: Stripe
): Promise<StripeReturnType<Stripe.PaymentIntent>> => {
  try {
    // convert the amount to int to make sure the date sending to stripe is integer ( not a number )
    amount = amount ? parseInt(amount.toFixed(0)) : null; //add condition if amount is null no need to parsing
    const refundedPaymentIntent = await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount || undefined
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...refundedPaymentIntent
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const getListCustomerCard = async (
  stripe: Stripe,
  stripeCustomerId: string
): Promise<StripeReturnType<Stripe.PaymentMethod>> => {
  try {
    const customerDetail = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card'
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...customerDetail
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const updateStripeCustomer = async (
  stripe: Stripe,
  stripeCustomerId: string,
  payload: Stripe.CustomerUpdateParams
): Promise<StripeReturnType<Stripe.Customer | Stripe.DeletedCustomer>> => {
  try {
    const customerDetail = await stripe.customers.update(stripeCustomerId, payload);
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...customerDetail
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const detachPaymentMethod = async (
  stripe: Stripe,
  paymentId: string
): Promise<StripeReturnType<Stripe.PaymentMethod>> => {
  try {
    const detachedPaymentMethod = await stripe.paymentMethods.detach(paymentId, {
      expand: ['customer']
    });
    const result = {
      httpStatus: HTTP_STATUS.OK,
      ...detachedPaymentMethod
    };
    return result;
  } catch (e) {
    return formatStripeError(e);
  }
};

const stripeHelper = {
  getStripeCustomer,
  createStripeCustomer,
  createPaymentMethod,
  createSetupIntents,
  updatePaymentIntent,
  createPaymentMethodforCustomer,
  createPaymentIntent,
  cancelPaymentIntent,
  refundPaymentIntent,
  getListCustomerCard,
  detachPaymentMethod,
  updateStripeCustomer
};

export default stripeHelper;
