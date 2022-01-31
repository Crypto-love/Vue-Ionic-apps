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
  auto_create_spree: true,
  customer: {
    id: 3074,
    name: '1 Marine Terrace - B2C',
    alias_name: 'Marine Terrace B2C',
    active: false
  },
  tenant: {
    first_name: 'Jiacai',
    last_name: 'Lau',
    email: 'orders@thetreedots.com',
    lead_days: 2,
    commission_rate: 1.25,
    logo:
      'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
    tenant: {
      name: 'Treedots',
      id: 2222,
      alias_name: 'TREEDOT',
      DeliveryDay: [
        {
          day_id: 5,
          day: {
            id: 5,
            name: 'Thursday',
            description: 'Thursday'
          }
        },
        {
          day_id: 7,
          day: {
            id: 7,
            name: 'Saturday',
            description: 'Saturday'
          }
        },
        {
          day_id: 1,
          day: {
            id: 1,
            name: 'Sunday',
            description: 'Sunday'
          }
        },
        {
          day_id: 2,
          day: {
            id: 2,
            name: 'Monday',
            description: 'Monday'
          }
        },
        {
          day_id: 3,
          day: {
            id: 3,
            name: 'Tuesday',
            description: 'Tuesday'
          }
        },
        {
          day_id: 4,
          day: {
            id: 4,
            name: 'Wednesday',
            description: 'Wednesday'
          }
        }
      ],
      active: true
    }
  }
} as unknown) as CustomerTenant;

const data = `{
  customer_id: 3074,
  tenant_id: 1,
  active: true,
  xero_customer_id: "",
  alias_name: "test",
  cod: false,
  credit_term: 1,
  payment_type: 1,
  delivery_instruction: "",
  delivery_charge: 0,
  minimum_order: 250,
  commission_rate: 3.1,
  auto_create_spree: false
}`;

async function addCustomerTenant() {
  try {
    const requstQuery = `mutation {
        addCustomerTenant(data: ${data}) {
              id
              customer_id
              tenant_id
          }
      }`;
    return await ctx.client.setHeader('Authorization', ctx.token).request(requstQuery);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('can add new info to customer tenant table', async () => {
    ctx.prisma.customer.findFirst.mockResolvedValueOnce({ id: 2222 } as any);
    ctx.prisma.customerTenant.create.mockResolvedValueOnce(dummyCustomerTenants);
    const result = await addCustomerTenant();
    expect(result).toMatchObject({
      addCustomerTenant: {
        id: expect.any(Number),
        customer_id: 3074,
        tenant_id: 1
      }
    });
  });
});
