import { Country } from '@treedots/prisma';

export const testData = {
  email: 'demo@thetreedots.com',
  phoneNumber: '6289623436831',
  username: 'demobuyer',
  password: '747b7a79787f7e7d',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwOTQsInVzZXJUeXBlSWQiOjYsImJ1eWVyVHlwZSI6MSwiaWF0IjoxNjE0ODI2NTA0fQ.2gNYj6kMX59WVBnuje0dJD_wUDY0JX-ydoHrZ73EnUE',
  customerId: 1807
};

export const testUser = {
  id: 6641,
  email: 'adv@thetreedots.com',
  username: 'advocatenew',
  stripe_customer_id: 'cus_JA4gb1HETwb1jj',
  stripe_card_id: null,
  active: true
};

export const testDummyListStripeCard = {
  listCustomerCard: {
    __typename: 'ListCustomerCard',
    data: [
      {
        id: 'pm_1Ie3urHzlMR8SHJIajDXuODH',
        object: 'payment_method',
        customer: 'cus_JA4gb1HETwb1jj',
        type: 'card',
        card: {
          brand: 'visa',
          exp_month: 1,
          exp_year: 2024,
          country: 'US',
          funding: 'credit',
          last4: '4242',
          fingerprint: 'fuQnWOTGHso0bjoC'
        },
        created: '1617911605'
      },
      {
        id: 'pm_1Ie3u7HzlMR8SHJIgZygePYx',
        object: 'payment_method',
        customer: 'cus_JA4gb1HETwb1jj',
        type: 'card',
        card: {
          brand: 'visa',
          exp_month: 1,
          exp_year: 2024,
          country: 'US',
          funding: 'credit',
          last4: '4242',
          fingerprint: 'fuQnWOTGHso0bjoC'
        },
        created: '1617911559'
      },
      {
        id: 'pm_1Id21IHzlMR8SHJInTA5xNfY',
        object: 'payment_method',
        customer: 'cus_JA4gb1HETwb1jj',
        type: 'card',
        card: {
          brand: 'visa',
          exp_month: 1,
          exp_year: 2024,
          country: 'US',
          funding: 'credit',
          last4: '4242',
          fingerprint: 'fuQnWOTGHso0bjoC'
        },
        created: '1617665989'
      },
      {
        id: 'pm_1Id20XHzlMR8SHJIPovlTk7S',
        object: 'payment_method',
        customer: 'cus_JA4gb1HETwb1jj',
        type: 'card',
        card: {
          brand: 'visa',
          exp_month: 1,
          exp_year: 2024,
          country: 'US',
          funding: 'credit',
          last4: '4242',
          fingerprint: 'fuQnWOTGHso0bjoC'
        },
        created: '1617665941'
      },
      {
        id: 'card_1Id0eZHzlMR8SHJIE3s6bCvb',
        object: 'payment_method',
        customer: 'cus_JA4gb1HETwb1jj',
        type: 'card',
        card: {
          brand: 'mastercard',
          exp_month: 2,
          exp_year: 2022,
          country: 'US',
          funding: 'credit',
          last4: '5454',
          fingerprint: 'oznsyoZr2UKOkJef'
        },
        created: '1617660735'
      }
    ],
    has_more: false
  }
};

export const mockGetListCustomerCard = {
  httpStatus: 200,
  object: 'list',
  data: [
    {
      id: 'pm_1Ie3urHzlMR8SHJIajDXuODH',
      object: 'payment_method',
      card: {
        brand: 'visa',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass'
        },
        country: 'US',
        exp_month: 1,
        exp_year: 2024,
        fingerprint: 'fuQnWOTGHso0bjoC',
        funding: 'credit',
        generated_from: null,
        last4: '4242',
        networks: { available: ['visa'], preferred: null },
        three_d_secure_usage: { supported: true },
        wallet: null
      },
      created: 1617911605,
      customer: 'cus_JA4gb1HETwb1jj',
      livemode: false,
      metadata: {},
      type: 'card'
    },
    {
      id: 'pm_1Ie3u7HzlMR8SHJIgZygePYx',
      object: 'payment_method',
      card: {
        brand: 'visa',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass'
        },
        country: 'US',
        exp_month: 1,
        exp_year: 2024,
        fingerprint: 'fuQnWOTGHso0bjoC',
        funding: 'credit',
        generated_from: null,
        last4: '4242',
        networks: { available: ['visa'], preferred: null },
        three_d_secure_usage: { supported: true },
        wallet: null
      },
      created: 1617911559,
      customer: 'cus_JA4gb1HETwb1jj',
      livemode: false,
      metadata: {},
      type: 'card'
    },
    {
      id: 'pm_1Id21IHzlMR8SHJInTA5xNfY',
      object: 'payment_method',
      card: {
        brand: 'visa',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass'
        },
        country: 'US',
        exp_month: 1,
        exp_year: 2024,
        fingerprint: 'fuQnWOTGHso0bjoC',
        funding: 'credit',
        generated_from: null,
        last4: '4242',
        networks: { available: ['visa'], preferred: null },
        three_d_secure_usage: { supported: true },
        wallet: null
      },
      created: 1617665989,
      customer: 'cus_JA4gb1HETwb1jj',
      livemode: false,
      metadata: {},
      type: 'card'
    },
    {
      id: 'pm_1Id20XHzlMR8SHJIPovlTk7S',
      object: 'payment_method',
      card: {
        brand: 'visa',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass'
        },
        country: 'US',
        exp_month: 1,
        exp_year: 2024,
        fingerprint: 'fuQnWOTGHso0bjoC',
        funding: 'credit',
        generated_from: null,
        last4: '4242',
        networks: { available: ['visa'], preferred: null },
        three_d_secure_usage: { supported: true },
        wallet: null
      },
      created: 1617665941,
      customer: 'cus_JA4gb1HETwb1jj',
      livemode: false,
      metadata: {},
      type: 'card'
    },
    {
      id: 'card_1Id0eZHzlMR8SHJIE3s6bCvb',
      object: 'payment_method',
      card: {
        brand: 'mastercard',
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: 'pass'
        },
        country: 'US',
        exp_month: 2,
        exp_year: 2022,
        fingerprint: 'oznsyoZr2UKOkJef',
        funding: 'credit',
        generated_from: null,
        last4: '5454',
        networks: { available: ['mastercard'], preferred: null },
        three_d_secure_usage: { supported: true },
        wallet: null
      },
      created: 1617660735,
      customer: 'cus_JA4gb1HETwb1jj',
      livemode: false,
      metadata: {},
      type: 'card'
    }
  ],
  has_more: false,
  url: '/v1/payment_methods'
};

export const testDummyCreatePaymentMethod = {
  addStripeCard: {
    paymentMethodId: 'pm_1Id0RKHzlMR8SHJIxBfCWPfR',
    stripeCustomerId: 'cus_JA4gb1HETwb1jj'
  }
};

export const testDummySetDefaultCard = {
  setDefaultStripeCard: {
    paymentMethodId: 'pm_1Id04RHzlMR8SHJICDOatLhU',
    stripeCustomerId: 'cus_JA4gb1HETwb1jj'
  }
};

export const mockDummySetDefaultCard = {
  httpStatus: 200,
  id: 'cus_JA4gb1HETwb1jj',
  object: 'customer',
  address: {
    city: 'asd',
    country: 'ID',
    line1: 'q1',
    line2: 'q2',
    postal_code: '11120',
    state: 'DKI Jakarta'
  },
  balance: 0,
  created: 1616407110,
  currency: 'sgd',
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: 'johannes@thetreedots.com',
  invoice_prefix: 'E8D4C8B9',
  invoice_settings: {
    custom_fields: null,
    default_payment_method: 'pm_1Id04RHzlMR8SHJICDOatLhU',
    footer: null
  },
  livemode: false,
  metadata: {},
  name: 'account1',
  next_invoice_sequence: 1,
  phone: '+6281282639185',
  preferred_locales: ['en'],
  shipping: {
    address: {
      city: 'asd',
      country: 'ID',
      line1: 'q1',
      line2: 'q2',
      postal_code: '11120',
      state: 'DKI Jakarta'
    },
    name: 'account1',
    phone: '+6281282639185'
  },
  tax_exempt: 'none'
};

export const mockCreatePaymentMethod = {
  httpStatus: 200,
  id: 'pm_1Id0RKHzlMR8SHJIxBfCWPfR',
  object: 'payment_method',
  billing_details: {
    address: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postal_code: null,
      state: null
    },
    email: null,
    name: null,
    phone: null
  },
  card: {
    brand: 'visa',
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: 'pass'
    },
    country: 'US',
    exp_month: 1,
    exp_year: 2024,
    fingerprint: 'fuQnWOTGHso0bjoC',
    funding: 'credit',
    generated_from: null,
    last4: '4242',
    networks: { available: [Array], preferred: null },
    three_d_secure_usage: { supported: true },
    wallet: null
  },
  created: 1617659915,
  customer: 'cus_JA4gb1HETwb1jj',
  livemode: false,
  metadata: {},
  type: 'card'
};

export const dummyGetDefaultCard = {
  stripe_customer_id: 'cus_JA4gb1HETwb1jj',
  stripe_card_id: 'card_1Id0eZHzlMR8SHJIE3s6bCvq'
};

export const testDummyGetDefaultCard = {
  getDefaultCard: {
    paymentMethodId: 'card_1Id0eZHzlMR8SHJIE3s6bCvq',
    stripeCustomerId: 'cus_JA4gb1HETwb1jj'
  }
};

export const dummyUpdateDefaultCard = {
  id: 6641,
  email: 'adv@thetreedots.com',
  password: 'asd',
  passwordV3: 'asd',
  username: 'advocatenew',
  mobile: '222222',
  first_name: 'Advocate',
  last_name: 'New',
  gender: 'm',
  birth_date: new Date(),
  country_id: 193,
  address: null,
  image: null,
  user_type_id: 11,
  buyer_type: null,
  stripe_customer_id: 'cus_JA4gb1HETwb1jj',
  stripe_card_id: 'card_1Id0eZHzlMR8SHJIE3s6bCvq',
  active: true
};

export const dummyGetStripeCustomer = {
  httpStatus: 200,
  id: 'cus_JA4gb1HETwb1jj',
  object: 'customer',
  address: {
    city: 'asd',
    country: 'ID',
    line1: 'q1',
    line2: 'q2',
    postal_code: '11120',
    state: 'DKI Jakarta'
  },
  balance: 0,
  created: 1616407110,
  currency: 'sgd',
  default_source: 'card_1Id0eZHzlMR8SHJIE3s6bCvb',
  delinquent: false,
  description: null,
  discount: null,
  email: 'johannes@thetreedots.com',
  invoice_prefix: 'E8D4C8B9',
  invoice_settings: { custom_fields: null, default_payment_method: null, footer: null },
  livemode: false,
  metadata: {},
  name: 'account1',
  next_invoice_sequence: 1,
  phone: '+6281282639185',
  preferred_locales: ['en'],
  shipping: {
    address: {
      city: 'asd',
      country: 'ID',
      line1: 'q1',
      line2: 'q2',
      postal_code: '11120',
      state: 'DKI Jakarta'
    },
    name: 'account1',
    phone: '+6281282639185'
  },
  tax_exempt: 'none'
};

export const dummyDetachPaymentMethod = {
  httpStatus: 200,
  id: 'pm_1Id0QFHzlMR8SHJIhClMacLC',
  object: 'payment_method',
  billing_details: {
    address: {
      city: null,
      country: null,
      line1: null,
      line2: null,
      postal_code: null,
      state: null
    },
    email: null,
    name: null,
    phone: null
  },
  card: {
    brand: 'visa',
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: 'pass'
    },
    country: 'US',
    exp_month: 1,
    exp_year: 2024,
    fingerprint: 'fuQnWOTGHso0bjoC',
    funding: 'credit',
    generated_from: null,
    last4: '4242',
    networks: { available: [Array], preferred: null },
    three_d_secure_usage: { supported: true },
    wallet: null
  },
  created: 1617659847,
  customer: null,
  livemode: false,
  metadata: {},
  type: 'card'
};

export const testDummyRemovePaymentMethod = {
  removeStripeCard: {
    paymentMethodId: 'card_1Id0eZHzlMR8SHJIE3s6bCvb',
    stripeCustomerId: 'cus_JA4gb1HETwb1jj'
  }
};

export const dummyB2cUser = {
  userId: 2208,
  userTypeId: 6,
  buyerType: 2,
  country: { id: 179, name: 'Singapore', active: true, currency_code: 'SGD', currency_symbol: '$' } as Country
};

export const dummyAdminUser = {
  userId: 2,
  userTypeId: 2,
  buyerType: null,
  country: { id: 179, name: 'Singapore', active: true, currency_code: 'SGD', currency_symbol: '$' } as Country
};
