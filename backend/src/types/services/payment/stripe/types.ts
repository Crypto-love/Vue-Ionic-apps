import { Stripe } from 'stripe';

export type StripeReturnType<T> = (T & { httpStatus: number }) | Record<string, unknown>;
export interface IStripeCreateCustomer {
  name: string;
  email: string;
  description?: string;
}

export interface LooseObject {
  [key: string]: any;
}

export interface IStripeCustomErrorResponse {
  requestId: string;
  httpStatus: number;
  code: string;
  type: string;
  rawType: string;
  message: string;
}

export interface IStripeCreateSetupIntents {
  customer: string;
  paymentMethod: string;
  description?: string;
}

export interface IStripeCreatePaymentIntents {
  amount: number;
  currency: string;
  description?: string;
}
export interface IStripeCreateCard {
  customerId: string;
  number: string;
  expiredMonth: number;
  expiredYear: number;
  cvc: string;
}

export type IStripeCreatePaymentMethod = Stripe.PaymentMethodCreateParams.Card1;

export type PaymentStatus =
  | 'canceled'
  | 'processing'
  | 'requires_action'
  | 'requires_confirmation'
  | 'requires_payment_method'
  | 'succeeded';
