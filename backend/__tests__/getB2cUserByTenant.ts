import { Customer, User } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummyCustomer = ({
  id: 2222,
  addresses: [{ id: 1, country_id: 193 }]
} as any) as Customer;

const dummyUsers = ([
  {
    id: 2208,
    email: 'demo_b2c@gmail.com',
    mobile: '62123123',
    first_name: 'demo',
    last_name: 'b2c',
    full_name: 'demo b2c',
    stripe_customer_id: 'cus_AAAA',
    stripe_card_id: 'card_AAAA'
  },
  {
    id: 6632,
    email: 'advocatehub@gmail.com',
    mobile: '09090909',
    first_name: 'Advocate',
    last_name: 'Hub',
    full_name: 'Advocate Hub',
    stripe_customer_id: null,
    stripe_card_id: null
  }
] as any) as User[];

async function getB2cUserByTenant(tenantId: number) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getB2cUserByTenant (tenantId: ${tenantId}) {
          id
          email
          mobile
          first_name
          last_name
          full_name
          stripe_customer_id
          stripe_card_id
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can get B2C users', async () => {
    ctx.prisma.customer.findFirst.mockResolvedValueOnce(dummyCustomer);
    ctx.prisma.user.findMany.mockResolvedValueOnce(dummyUsers);

    const result = await getB2cUserByTenant(1);

    expect(result).toMatchObject({
      getB2cUserByTenant: dummyUsers
    });
  });

  it("user get empty data because of tenant doesn't have an address", async () => {
    ctx.prisma.customer.findFirst.mockResolvedValueOnce(({ id: 2222 } as any) as Customer);

    const result = await getB2cUserByTenant(1);

    expect(result).toMatchObject({
      getB2cUserByTenant: []
    });
  });

  it("user can't get B2C users because of invalid tenant id", async () => {
    const result = await getB2cUserByTenant(-1);

    expect(result).toMatchObject({
      data: {
        getB2cUserByTenant: null
      },
      errors: [
        {
          message: 'Tenant not found'
        }
      ]
    });
  });
});
