import { User } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };

const ctx = createTestContext(userInfo);

const expectedData = {
  me: {
    active: true,
    address: null,
    birth_date: expect.any(String),
    buyer_type: expect.any(Number),
    country: expect.any(Object) || null,
    country_id: expect.any(Number),
    email: expect.any(String),
    first_name: expect.any(String),
    gender: expect.any(String),
    id: expect.any(Number),
    image: null,
    last_name: expect.any(String),
    mobile: expect.any(String),
    stripe_card_id: expect.any(String),
    stripe_customer_id: expect.any(String),
    tenant: expect.any(Object) || null,
    token: null,
    tokenJWT: null,
    type: expect.any(Object) || null,
    user_type_id: expect.any(Number),
    username: expect.any(String)
  }
};

const dummyUser = {
  active: true,
  address: '',
  birth_date: new Date(),
  password: '747b7a79787f7e7d',
  passwordV3: '',
  buyer_type: 1,
  country_id: 193,
  email: 'demo@thetreedots.com',
  first_name: 'demo',
  gender: 'm',
  id: 2094,
  image: null,
  last_name: 'buyer',
  mobile: '65123123',
  stripe_card_id: 'card_123',
  stripe_customer_id: 'cus_123',
  user_type_id: 6,
  username: 'demobuyer'
} as User;

async function getMe(token: string) {
  try {
    return await ctx.client.setHeader('Authorization', token).request(`
      mutation {
        me {
            active
            address {
                active
                address_type_id
                building
                city
                country {
                    active
                    currency_code
                    currency_symbol
                    description
                    id
                    name
                }
                country_id
                customer_id
                floor_number
                id
                is_default
                latlng
                postal_code
                road
                stall
                state
                street_number
                type {
                    active
                    description
                    id
                    name
                }
                unit
            }
            birth_date
            buyer_type
            country {
                active
                currency_code
                currency_symbol
                description
                id
                name
            }
            country_id
            email
            first_name
            gender
            id
            image
            last_name
            mobile
            stripe_card_id
            stripe_customer_id
            tenant {
                building_name
                class_id
                default_credit_card_term
                email
                email_notification
                first_name
                id
                last_name
                registration_number
                street_name
                tax_rate
                tax_registration_number
                tenant {
                    account_number
                    active
                    alias_name
                    beef_products
                    cod
                    collection_type_id
                    credit_term
                    customer_type_id
                    delivery_charge
                    delivery_instruction
                    direction
                    group_id
                    halal_products
                    hub
                    hub_can_delivery
                    hub_delivery_fee
                    id
                    minimum_order
                    name
                    payment_type
                    peppol_scheme_id
                    profile
                    storecove_id
                    tenant_id
                    voucherify_id
                    whatsapp_link
                    xero_id
                }
                unit_number
                xeroIntegration {
                    active
                    created_at
                    created_by
                    id
                    tenant {
                        building_name
                        class_id
                        default_credit_card_term
                        email
                        email_notification
                        first_name
                        id
                        last_name
                        registration_number
                        street_name
                        tax_rate
                        tax_registration_number
                        unit_number
                    }
                    tenant_id
                    updated_at
                    updated_by
                    xero_tenant_id
                    xero_token_set
                }
            }
            token
            tokenJWT
            type {
                active
                description
                id
                name
            }
            user_type_id
            username
        }
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can get their own information', async () => {
    ctx.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);

    const result = await getMe(ctx.token);

    expect(result).toMatchObject(expectedData);
  });

  it("user can't get their own information because of invalid token", async () => {
    ctx.prisma.user.findFirst.mockResolvedValueOnce(dummyUser);

    const result = await getMe('FooBar123');

    expect(result).toMatchObject({
      errors: [
        {
          message: 'Not Authorized!'
        }
      ],
      data: { me: null }
    });
  });
});
