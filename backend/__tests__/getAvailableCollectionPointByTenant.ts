import { Customer, HubSpreeData } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummySprees = ([{ hub_id: 1440 }, { hub_id: 3074 }] as any) as HubSpreeData[];

const dummyCollectionPoints = ([
  {
    id: 1440,
    name: '251 Jurong East Street 24 B2C',
    alias_name: 'Jurong East',
    account_number: 'B1146',
    whatsapp_link: null
  },
  {
    id: 3074,
    name: '1 Marine Terrace - B2C',
    alias_name: 'Marine Terrace',
    account_number: 'B2584',
    whatsapp_link: null
  }
] as any) as Customer[];

async function getAvailableCollectionPointByTenant(tenantId: number) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getAvailableCollectionPointByTenant (tenantId: ${tenantId}) {
          id
          name
          alias_name
          account_number
          whatsapp_link
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user get available collection points', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummySprees);
    ctx.prisma.customer.findMany.mockResolvedValueOnce(dummyCollectionPoints);

    const result = await getAvailableCollectionPointByTenant(1);

    expect(result).toMatchObject({
      getAvailableCollectionPointByTenant: dummyCollectionPoints
    });
  });

  it("user can't get available collection points because there is no on open spree in the Tenant", async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce([]);
    ctx.prisma.customer.findMany.mockResolvedValueOnce([]);

    const result = await getAvailableCollectionPointByTenant(2);

    expect(result).toMatchObject({
      getAvailableCollectionPointByTenant: []
    });
  });
});
