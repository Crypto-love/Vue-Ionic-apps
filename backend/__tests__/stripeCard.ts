import { User } from '@treedots/prisma';

import { createTestContext } from './__helper';
import {
  testDummyListStripeCard,
  mockGetListCustomerCard,
  testDummyCreatePaymentMethod,
  mockCreatePaymentMethod,
  testDummySetDefaultCard,
  mockDummySetDefaultCard,
  dummyDetachPaymentMethod,
  dummyUpdateDefaultCard,
  dummyGetStripeCustomer,
  testDummyRemovePaymentMethod,
  testDummyGetDefaultCard
} from './__testData';
const userInfo = { userId: 6641, userTypeId: 11, buyerType: null, iat: 1616757807 };

import stripeHelper from '../src/types/services/payment/stripe';

const userStripeInfo = ({
  id: 6641,
  email: 'adv@thetreedots.com',
  username: 'advocatenew',
  stripe_customer_id: 'cus_JA4gb1HETwb1jj',
  stripe_card_id: null,
  active: true
} as unknown) as User;

const context = createTestContext(userInfo);

async function listCustomerCard() {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `
        query {
          listCustomerCard {
            __typename
            ... on ListCustomerCard {
              object
              has_more
              data {
                card{
                  brand
                  country
                  exp_month
                  exp_year
                  fingerprint
                  funding
                  last4
                }
                id
                object
                type
                created
                customer
              }
            }
          }
        }
      `
    );
  } catch (error) {
    return error.response || error;
  }
}

async function addCard(cardNumber: string, expYear: number, expMonth: number, cvc: string) {
  try {
    const variables = {
      cardNumber: cardNumber,
      expYear: expYear,
      expMonth: expMonth,
      cvc: cvc
    };

    return await context.client.setHeader('Authorization', context.token).request(
      `
        mutation addStripeCard($cardNumber: String!, $expYear: Int!, $expMonth: Int!, $cvc: String!){
          addStripeCard(
            cardNumber: $cardNumber
            expYear: $expYear
            expMonth: $expMonth
            cvc: $cvc
          ) {
            ... on DefaultStripeCardResponse {
              paymentMethodId
              stripeCustomerId
            }
            ... on CardErrorResponse {
              error
              message
            }
          }
        }
      `,
      variables
    );
  } catch (e) {
    return e.response || e;
  }
}

async function removeCard(paymentMethodId: string) {
  try {
    const variables = {
      paymentMethodId: paymentMethodId
    };
    return await context.client.setHeader('Authorization', context.token).request(
      `
        mutation removeStripeCard($paymentMethodId: String!) {
          removeStripeCard(paymentMethodId: $paymentMethodId) {
            ... on DefaultStripeCardResponse {
              paymentMethodId
              stripeCustomerId
            }
          }
        }
      `,
      variables
    );
  } catch (e) {
    return e.response || e;
  }
}

async function setDefaultCard(paymentMethodId: string) {
  try {
    const variables = {
      paymentMethodId: paymentMethodId
    };
    return await context.client.setHeader('Authorization', context.token).request(
      `
        mutation setDefaultStripeCard($paymentMethodId: String!){
          setDefaultStripeCard(paymentMethodId: $paymentMethodId) {
            ... on DefaultStripeCardResponse {
                paymentMethodId
                stripeCustomerId
              }
          }
        }
      `,
      variables
    );
  } catch (e) {
    return e.response || e;
  }
}

async function getDefaultCard() {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getDefaultCard {
          ... on DefaultStripeCardResponse {
            paymentMethodId
            stripeCustomerId
          }
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', () => {
  it('user can get list of his card', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(userStripeInfo);
    stripeHelper.getListCustomerCard = jest.fn().mockReturnValue(mockGetListCustomerCard);
    const result = await listCustomerCard();
    expect(result).toMatchObject(testDummyListStripeCard);
  });
  it('user can add card', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(userStripeInfo);
    stripeHelper.createPaymentMethodforCustomer = jest.fn().mockReturnValue(mockCreatePaymentMethod);
    const result = await addCard('4242424242424242', 2024, 1, '123');
    expect(result).toMatchObject(testDummyCreatePaymentMethod);
  });
  it('user can set default card', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(userStripeInfo);
    stripeHelper.updateStripeCustomer = jest.fn().mockReturnValue(mockDummySetDefaultCard);
    const result = await setDefaultCard('pm_1Id04RHzlMR8SHJICDOatLhU');
    expect(result).toMatchObject(testDummySetDefaultCard);
  });
  it('user can remove card (remove pm_) expect default to be null', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(userStripeInfo);
    stripeHelper.detachPaymentMethod = jest.fn().mockReturnValue(dummyDetachPaymentMethod);
    stripeHelper.getStripeCustomer = jest.fn().mockReturnValue(dummyGetStripeCustomer);
    context.prisma.user.update.mockResolvedValueOnce(dummyUpdateDefaultCard);
    const result = await removeCard('4242424242424242');
    expect(result).toMatchObject(testDummyRemovePaymentMethod);
  });
  it('user can get default card', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUpdateDefaultCard);
    const result = await getDefaultCard();
    expect(result).toMatchObject(testDummyGetDefaultCard);
  });
});
