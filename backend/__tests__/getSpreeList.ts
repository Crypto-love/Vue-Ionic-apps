import { HubSpreeData } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const today = new Date();
const currentTime = today.toISOString();

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
  }
] as unknown) as HubSpreeData[];

async function getSprees(
  active: boolean,
  status: number,
  currentTime: string,
  tenantId: number,
  hubId: number,
  deliveryDate: string
) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getAllSprees(
          active: ${active},
          status: ${status},
          currentTime: ${currentTime ? `"${currentTime}"` : null},
          tenantId: ${tenantId},
          hubId: ${hubId},
          deliveryDate: ${deliveryDate ? `"${deliveryDate}"` : null}
        ) {
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
  it('customer can get list of inactive and closed sprees', async () => {
    const filteredSprees = dummyHubSpreeData.filter((v) => v.active === false && v.Status === 1);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(false, 1, null, null, null, null);

    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of inactive and open sprees', async () => {
    const filteredSprees = dummyHubSpreeData.filter((v) => v.active === false && v.Status === 0);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(false, 0, null, null, null, null);

    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of active and closed sprees', async () => {
    const filteredSprees = dummyHubSpreeData.filter((v) => v.active === true && v.Status === 1);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(true, 1, null, null, null, null);

    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of active and open sprees', async () => {
    const filteredSprees = dummyHubSpreeData.filter((v) => v.active === true && v.Status === 0);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(true, 0, null, null, null, null);
    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of active and open sprees that is upcoming', async () => {
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 0 && new Date(v.start_date).getTime() > today.getTime()
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(true, 0, currentTime, null, null, null);

    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of active and closed sprees that is upcoming', async () => {
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === true && v.Status === 1 && new Date(v.start_date).getTime() > today.getTime()
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(true, 1, currentTime, null, null, null);
    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of inactive and open sprees that is upcoming', async () => {
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === false && v.Status === 0 && new Date(v.start_date).getTime() > today.getTime()
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(false, 0, currentTime, null, null, null);
    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of inactive and closed sprees that is upcoming', async () => {
    const filteredSprees = dummyHubSpreeData.filter(
      (v) => v.active === false && v.Status === 1 && new Date(v.start_date).getTime() > today.getTime()
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(false, 1, currentTime, null, null, null);
    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });

  it('customer can get list of sprees regardless to active status and active ', async () => {
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreeData);

    const result = await getSprees(null, null, null, null, null, null);
    expect(result).toMatchObject({
      getAllSprees: dummyHubSpreeData
    });
  });

  it('customer can get list of sprees and their details', async () => {
    const filteredSprees = dummyHubSpreeData.filter(
      (v) =>
        v.active === true &&
        v.Status === 0 &&
        v.tenant_id === 1 &&
        v.hub_id === 1880 &&
        new Date(v.delivery_date).getTime() > today.getTime()
    );
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(filteredSprees);

    const result = await getSprees(true, 0, null, 1, 1880, currentTime);

    expect(result).toMatchObject({
      getAllSprees: filteredSprees
    });
  });
});
