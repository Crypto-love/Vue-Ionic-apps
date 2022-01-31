import { Sku } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummySkus = ([
  {
    id: 1007,
    name: 'Frozen Batang Steak 吧当鱼 (5 X 2 KG)',
    is_b2c_pooling: true,
    tax_rate: 8.5,
    b2c_unit_per_oom: 1,
    b2c_unit_price: 18.5,
    b2c_pooling_qty: 5,
    b2c_packaging: '(2 KG)'
  },
  {
    id: 1052,
    name: 'Fresh Chicken Bone (5 KG)',
    is_b2c_pooling: false,
    tax_rate: 0,
    b2c_unit_per_oom: 1,
    b2c_unit_price: 5.42,
    b2c_pooling_qty: 0,
    b2c_packaging: '(5 KG)'
  }
] as any) as Sku[];

async function getB2cSkus(tenantId: number, isPooling: boolean = null) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getB2cSkus(tenantId: ${tenantId}, isPooling: ${isPooling}) {
          id
          name
          is_b2c_pooling
          tax_rate
          b2c_unit_per_oom
          b2c_unit_price
          b2c_pooling_qty
          b2c_packaging
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can get all of SKU for B2C', async () => {
    ctx.prisma.sku.findMany.mockResolvedValueOnce(dummySkus);

    const result = await getB2cSkus(1);

    expect(result).toMatchObject({
      getB2cSkus: dummySkus
    });
  });

  it('user can get pooling B2C SKUs', async () => {
    const filteredData = dummySkus.filter((v) => v.is_b2c_pooling === true);
    ctx.prisma.sku.findMany.mockResolvedValueOnce(filteredData);

    const result = await getB2cSkus(1, true);

    expect(result).toMatchObject({
      getB2cSkus: filteredData
    });
  });
});
