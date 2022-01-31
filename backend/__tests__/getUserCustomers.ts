import { UserCustomer } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummyUserCustomer = ([
  {
    id: 15004,
    user_id: 6696,
    customer_id: 2246,
    active: true,
    user: {
      id: 6696,
      email: 'test@advocate.com',
      password: '747b7a79787f7e7d',
      passwordV3: '$2a$10$84aSGiFx3cOIZV7sRZFx5u4sr7S5FgsMHrpHQMyRZ6SXkIHxGsMZy',
      username: 'advocate-umar',
      mobile: '6512345',
      first_name: 'adv',
      last_name: 'umar',
      gender: 'm',
      birth_date: '2000-07-19T00:00:00.000Z',
      country_id: 193,
      address: null,
      image: null,
      user_type_id: 11,
      buyer_type: null,
      stripe_customer_id: null,
      stripe_card_id: null,
      tookan_fleet_id: null,
      active: true,
      date_created: null
    },
    customer: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: false,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: 0,
      minimum_order: 200,
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    }
  },
  {
    id: 15005,
    user_id: 6696,
    customer_id: 1897,
    active: true,
    user: {
      id: 6696,
      email: 'test@advocate.com',
      password: '747b7a79787f7e7d',
      passwordV3: '$2a$10$84aSGiFx3cOIZV7sRZFx5u4sr7S5FgsMHrpHQMyRZ6SXkIHxGsMZy',
      username: 'advocate-umar',
      mobile: '6512345',
      first_name: 'adv',
      last_name: 'umar',
      gender: 'm',
      birth_date: '2000-07-19T00:00:00.000Z',
      country_id: 193,
      address: null,
      image: null,
      user_type_id: 11,
      buyer_type: null,
      stripe_customer_id: null,
      stripe_card_id: null,
      tookan_fleet_id: null,
      active: true,
      date_created: null
    },
    customer: {
      id: 1897,
      name: '130 Jurong Gateway Road - MQ Bee - B2C',
      alias_name: 'Jurong (MQ Bee)',
      account_number: 'B1552',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: 0,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: 0,
      minimum_order: 300,
      hub: true,
      active: true,
      xero_id: '36c23a6c-8173-408e-9408-86d71e0bd39a',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/K8liRbH8iNi9jJngwqeNth',
      storecove_id: null,
      peppol_id: null,
      tenant_id: null,
      peppol_scheme_id: null
    }
  }
] as unknown) as UserCustomer;

async function getUserCustomers() {
  try {
    const req = `query{
            getUserCustomers{
                user_id                
            }
        }`;
    return await ctx.client.setHeader('Authorization', ctx.token).request(req);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('can get user customer details', async () => {
    ctx.prisma.userCustomer.findMany.mockResolvedValueOnce(dummyUserCustomer);
    const result = await getUserCustomers();
    expect(result).toMatchObject({
      getUserCustomers: {
        user_id: 6696
      }
    });
  });
});
