import * as dotenv from 'dotenv';
import { PubSub } from 'graphql-subscriptions';
import { Request } from 'apollo-server-express';
import Stripe from 'stripe';
import { PrismaClient } from '@treedots/prisma';
import { Sqs, Firebase, Clevertap, Voucherify } from './types/services';
import { getStripeInstance } from './types/services/payment/stripe';
import { getUserCredentialsByToken, UserCredentials } from './types/utils/auth';

dotenv.config();

const {
  NODE_ENV,
  JWT_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  FCM_HOST,
  FCM_SERVER_KEY,
  CT_HOST,
  CT_ACCOUNT_ID,
  CT_PASSCODE,
  VOUCHERIFY_HOST,
  VOUCHERIFY_APPID,
  VOUCHERIFY_SECRET_KEY
} = process.env;

export interface Context {
  request: Request & any;
  prisma: PrismaClient;
  pubsub: PubSub;
  appSecret: string;
  sqs: Sqs;
  firebase: Firebase;
  stripe: Stripe;
  clevertap: Clevertap;
  voucherify: Voucherify;
  credential: UserCredentials;
}

const prismaClientPropertyName = `__prevent-name-collision__prisma`;
type GlobalThisWithPrismaClient = typeof globalThis & {
  [prismaClientPropertyName]: PrismaClient;
};
const getPrismaClient = () => {
  if (NODE_ENV === 'production') {
    return new PrismaClient();
  } else {
    const newGlobalThis = globalThis as GlobalThisWithPrismaClient;
    if (!newGlobalThis[prismaClientPropertyName]) {
      newGlobalThis[prismaClientPropertyName] = new PrismaClient();
    }
    return newGlobalThis[prismaClientPropertyName];
  }
};

const prisma = getPrismaClient();

/** Development purposes */
// prisma.$on('query', e => {
//   console.log(e)
// })

const pubsub = new PubSub();

const config = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
};

const sqs = new Sqs(config);

const firebase = new Firebase({
  host: FCM_HOST,
  serverKey: FCM_SERVER_KEY
});

const clevertap = new Clevertap({
  host: CT_HOST,
  accountId: CT_ACCOUNT_ID,
  passcode: CT_PASSCODE
});

const voucherify = new Voucherify({
  apiUrl: VOUCHERIFY_HOST,
  applicationId: VOUCHERIFY_APPID,
  clientSecretKey: VOUCHERIFY_SECRET_KEY
});

export const createContext = (prismaClient?: PrismaClient) => (request: Request): Context => {
  const req: any = request;
  const credential = getUserCredentialsByToken(req.req.get('Authorization'));
  const stripe = getStripeInstance(credential?.country?.currency_code || null);
  return {
    request,
    prisma: prismaClient || prisma,
    pubsub,
    appSecret: JWT_SECRET,
    sqs,
    firebase,
    stripe,
    clevertap,
    voucherify,
    credential
  };
};
