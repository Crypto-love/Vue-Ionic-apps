import { HubSpreeData } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const today = new Date();

const dummyHubSpreeData = ([
  {
    id: 1,
    hub_id: 1880,
    advocate_id: 2,
    tenant_id: 1,
    start_date: new Date('2015-03-1').toISOString(),
    end_date: new Date('2015-03-5').toISOString(),
    delivery_date: new Date('2015-03-7').toISOString(),
    Status: 1,
    active: true
  },
  {
    id: 2,
    hub_id: 1880,
    advocate_id: 2,
    tenant_id: 1,
    start_date: new Date().toISOString(),
    end_date: new Date('2015-03-12').toISOString(),
    delivery_date: new Date('2015-03-15').toISOString(),
    Status: 0,
    active: false
  },
  {
    id: 3,
    hub_id: 1880,
    advocate_id: 2,
    tenant_id: 1,
    start_date: new Date(today.getTime() - 2 * 3600 * 24 * 1000).toISOString(),
    end_date: new Date(today.getTime() + 2 * 3600 * 24 * 1000).toISOString(),
    delivery_date: new Date(today.getTime() + 4 * 3600 * 24 * 1000).toISOString(),
    Status: 0,
    active: true
  },
  {
    id: 4,
    hub_id: 1440,
    advocate_id: 2,
    tenant_id: 1,
    start_date: new Date(today.getTime() - 2 * 3600 * 24 * 1000).toISOString(),
    end_date: new Date(today.getTime() + 2 * 3600 * 24 * 1000).toISOString(),
    delivery_date: new Date(today.getTime() + 4 * 3600 * 24 * 1000).toISOString(),
    Status: 0,
    active: true
  },
  {
    id: 5,
    hub_id: 1440,
    advocate_id: 2,
    tenant_id: 2,
    start_date: new Date(today.getTime() - 2 * 3600 * 24 * 1000).toISOString(),
    end_date: new Date(today.getTime() + 2 * 3600 * 24 * 1000).toISOString(),
    delivery_date: new Date(today.getTime() + 4 * 3600 * 24 * 1000).toISOString(),
    Status: 0,
    active: true
  }
] as unknown) as HubSpreeData[];

async function getAvailableSprees(hubId: number, tenantId: number) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getAvailableSprees (hubId: ${hubId}, tenantId: ${tenantId}) {
          Status
          active
          advocate_id
          delivery_date
          end_date
          hub_id
          id
          start_date
          tenant_id
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', () => {
  it('user can fetch all available spree', async () => {
    const filteredSprees = dummyHubSpreeData.filter((v) => v.active === true && v.Status === 0);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getAvailableSprees(null, null);

    expect(result).toMatchObject({
      getAvailableSprees: filteredSprees
    });
  });

  it('user can fetch spree when they only send hub id', async () => {
    const hubId = 1880;
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 0 && v.hub_id == hubId
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getAvailableSprees(hubId, null);

    expect(result).toMatchObject({
      getAvailableSprees: filteredSprees
    });
  });

  it('user can fetch spree when they only send tenant id', async () => {
    const tenantId = 1;
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 0 && v.tenant_id == tenantId
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getAvailableSprees(null, tenantId);

    expect(result).toMatchObject({
      getAvailableSprees: filteredSprees
    });
  });

  it('user can fetch spree when they send hub id and tenant id', async () => {
    const hubId = 1880;
    const tenantId = 1;
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 0 && v.tenant_id == tenantId && v.hub_id == hubId
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getAvailableSprees(hubId, tenantId);

    expect(result).toMatchObject({
      getAvailableSprees: filteredSprees
    });
  });

  it('user receive empty data when there is no available spree', async () => {
    const hubId = 1880;
    const tenantId = 2;
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 1 && v.tenant_id == tenantId && v.hub_id == hubId
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getAvailableSprees(hubId, tenantId);
    expect(result).toMatchObject({
      getAvailableSprees: filteredSprees
    });
  });
});
