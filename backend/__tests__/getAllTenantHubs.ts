import { CustomerTenant, Customer, Tenant } from '@prisma/client';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const ctx = createTestContext(userInfo);

const dummyCustomerTenants = ([
  {
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
  },
  {
    id: 3468,
    customer_id: 3074,
    tenant_id: 2,
    active: false,
    xero_customer_id: '5319cae3-f498-4564-abae-a648716d69ff',
    alias_name: 'Marine Terrace',
    cod: false,
    credit_term: 7,
    payment_type: 2,
    delivery_instruction: null,
    delivery_charge: 0,
    minimum_order: 200,
    commission_rate: 4,
    auto_create_spree: false,
    customer: {
      id: 3074,
      name: '1 Marine Terrace - B2C',
      alias_name: 'Marine Terrace B2C',
      active: false
    },
    tenant: {
      first_name: 'Zhi Yuen',
      last_name: null,
      email: 'alex@thetreedots.com',
      lead_days: 20,
      commission_rate: 3.1,
      logo: null,
      tenant: {
        name: 'Quality Meat Pte Ltd',
        id: 2284,
        alias_name: 'QM12311',
        DeliveryDay: [
          {
            day_id: 6,
            day: {
              id: 6,
              name: 'Friday',
              description: 'Friday'
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
            day_id: 5,
            day: {
              id: 5,
              name: 'Thursday',
              description: 'Thursday'
            }
          }
        ],
        active: false
      }
    }
  },
  {
    id: 3560,
    customer_id: 3074,
    tenant_id: 9,
    active: false,
    xero_customer_id: null,
    alias_name: null,
    cod: false,
    credit_term: 0,
    payment_type: 0,
    delivery_instruction: null,
    delivery_charge: 0,
    minimum_order: 300,
    commission_rate: 3.1,
    auto_create_spree: false,
    customer: {
      id: 3074,
      name: '1 Marine Terrace - B2C',
      alias_name: 'Marine Terrace B2C',
      active: false
    },
    tenant: {
      first_name: 'lala',
      last_name: null,
      email: 'lalala@thetreedots.com',
      lead_days: 20,
      commission_rate: 3.1,
      logo:
        'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Yifu%20Foodstuff.png',
      tenant: {
        name: 'Yifu Foodstuff',
        id: 3228,
        alias_name: '3123123',
        DeliveryDay: [],
        active: true
      }
    }
  },
  {
    id: 3561,
    customer_id: 1440,
    tenant_id: 14,
    active: true,
    xero_customer_id: null,
    alias_name: null,
    cod: false,
    credit_term: 0,
    payment_type: null,
    delivery_instruction: null,
    delivery_charge: null,
    minimum_order: 300,
    commission_rate: 3.1,
    auto_create_spree: false,
    customer: {
      id: 1440,
      name: '251 Jurong East Street 24 B2C',
      alias_name: 'Jurong East',
      active: true
    },
    tenant: {
      first_name: 'LALA',
      last_name: null,
      email: 'caieylau@gmail.com',
      lead_days: 20,
      commission_rate: 3.1,
      logo: null,
      tenant: {
        name: 'EG Fishery Pte Ltd',
        id: 3250,
        alias_name: 'EG 2020',
        DeliveryDay: [],
        active: true
      }
    }
  }
] as unknown) as CustomerTenant[];

async function getTenantHubs(tenantId, hubId, active) {
  try {
    if (tenantId) tenantId = `tenantId: ${tenantId}`;
    else tenantId = '';
    if (hubId) hubId = `hubId: ${hubId}`;
    else hubId = '';
    if (active) active = `active: ${active}`;
    else active = '';
    const requestQuery = `
    query {
        getTenantHubs(${tenantId}
        ${tenantId ? ',' + hubId : hubId}
        ${hubId ? ',' + active : active}) {
            id
            customer_id
            tenant_id
            active
            xero_customer_id
            alias_name
            cod
            credit_term
            payment_type
            delivery_instruction
            delivery_charge
            minimum_order
            commission_rate
            auto_create_spree            
      }
    }
  `;
    return await ctx.client.setHeader('Authorization', ctx.token).request(requestQuery);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('can get all active customer tenants data', async () => {
    const filterCustomerTenant = dummyCustomerTenants.filter((x) => x.active === true);
    ctx.prisma.customerTenant.findMany.mockResolvedValueOnce(filterCustomerTenant);
    const result = await getTenantHubs(null, null, true);
    expect(result).toMatchObject({
      getTenantHubs: [
        {
          active: true,
          alias_name: null,
          auto_create_spree: false,
          cod: false,
          commission_rate: 3.1,
          credit_term: 0,
          customer_id: 1440,
          delivery_charge: null,
          delivery_instruction: null,
          id: 3561,
          minimum_order: 300,
          payment_type: null,
          tenant_id: 14,
          xero_customer_id: null
        }
      ]
    });
  });
  it('can get all active customer tenants by tenant id ', async () => {
    const filterCustomerTenant = dummyCustomerTenants.filter((x) => x.active === true);
    ctx.prisma.customerTenant.findMany.mockResolvedValueOnce(filterCustomerTenant);
    const result = await getTenantHubs(14, null, null);
    expect(result).toMatchObject({
      getTenantHubs: [
        {
          active: true,
          alias_name: null,
          auto_create_spree: false,
          cod: false,
          commission_rate: 3.1,
          credit_term: 0,
          customer_id: 1440,
          delivery_charge: null,
          delivery_instruction: null,
          id: 3561,
          minimum_order: 300,
          payment_type: null,
          tenant_id: 14,
          xero_customer_id: null
        }
      ]
    });
  });
  it('can get all active customer tenants by hub id ', async () => {
    const filterCustomerTenant = dummyCustomerTenants.filter((x) => x.active === true);
    ctx.prisma.customerTenant.findMany.mockResolvedValueOnce(filterCustomerTenant);
    const result = await getTenantHubs(null, 3561, null);
    expect(result).toMatchObject({
      getTenantHubs: [
        {
          active: true,
          alias_name: null,
          auto_create_spree: false,
          cod: false,
          commission_rate: 3.1,
          credit_term: 0,
          customer_id: 1440,
          delivery_charge: null,
          delivery_instruction: null,
          id: 3561,
          minimum_order: 300,
          payment_type: null,
          tenant_id: 14,
          xero_customer_id: null
        }
      ]
    });
  });
});
