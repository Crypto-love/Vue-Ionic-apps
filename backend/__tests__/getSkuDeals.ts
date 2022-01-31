import { SkuDeal } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const ctx = createTestContext(userInfo);

const dummySkuDeals = ([
  {
    id: 1,
    sku_id: 3312,
    quantity: 20,
    discount: 10,
    rank: 2,
    default: true,
    active: true
  },
  {
    id: 2,
    sku_id: 3309,
    quantity: 5,
    discount: 10,
    rank: 1,
    default: false,
    active: true
  },
  {
    id: 3,
    sku_id: 3104,
    quantity: 10,
    discount: 10,
    rank: 2,
    default: false,
    active: false
  }
] as unknown) as SkuDeal[];

async function getSkuDeals(active: boolean) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getSkuDeals(active: ${active}) {
          id
          sku_id
          quantity
          discount
          rank
          default
          active
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('customer can see all active sku deals data', async () => {
    const activeDeals = dummySkuDeals.filter((v) => v.active === true);
    ctx.prisma.skuDeal.findMany.mockResolvedValueOnce(activeDeals);

    const result = await getSkuDeals(true);

    expect(result).toMatchObject({
      getSkuDeals: activeDeals
    });
  });

  it('customer can see all inactive sku deals data', async () => {
    const inActiveDeals = dummySkuDeals.filter((v) => v.active === false);
    ctx.prisma.skuDeal.findMany.mockResolvedValueOnce(inActiveDeals);

    const result = await getSkuDeals(true);

    expect(result).toMatchObject({
      getSkuDeals: inActiveDeals
    });
  });
});
