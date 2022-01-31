import { CustomerTenant } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';
const ctx = createTestContext(dummyB2cUser);

const dummyCustomerTenants = ({
  id: 2816,
  customer_id: 3074,
  tenant_id: 1,
  active: false,
  xero_customer_id: '5319cae3-f498-4564-abae-a648716d69ff',
  alias_name: 'Marine Terrace B2C',
  cod: false,
  credit_term: 7,
  payment_type: 2,
  delivery_instruction: null,
  delivery_charge: 0,
  minimum_order: 200,
  commission_rate: 4,
  auto_create_spree: true
} as unknown) as CustomerTenant;

const data = `{
  id: 2816,
  customer_id: 3074,
  tenant_id: 1,
  active: true,
  xero_customer_id: "5319cae3-f498-4564-abae-a648716d69ff",
  alias_name: "Marine Terrace B2C",
  cod: false,
  credit_term: 7,
  payment_type: 2,
  delivery_instruction: null,
  delivery_charge: 0,
  minimum_order: 200,
  commission_rate: 4,
  auto_create_spree: true,
}`;

async function updateCustomerTenant() {
  try {
    const requstQuery = `mutation {
      updateCustomerTenant(data: ${data}) {
              id
              customer_id
              tenant_id
              active
          }
      }`;
    return await ctx.client.setHeader('Authorization', ctx.token).request(requstQuery);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('can update new info to customer tenant table', async () => {
    ctx.prisma.customer.findFirst.mockResolvedValueOnce({ id: 2222 } as any);
    ctx.prisma.customerTenant.update.mockResolvedValueOnce(dummyCustomerTenants);
    const result = await updateCustomerTenant();
    expect(result).toMatchObject({
      updateCustomerTenant: {
        id: expect.any(Number),
        customer_id: 3074,
        tenant_id: 1,
        active: false
      }
    });
  });
});
