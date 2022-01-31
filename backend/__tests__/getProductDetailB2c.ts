import { Product, Sku, SkuDeal, Customer } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const dummyProduct = ({
  id: 1,
  category_id: 1,
  image: 'img5',
  name: 'Alaska Pollock',
  tenant_id: 1,
  updated_at: new Date().toISOString(),
  active: true,
  tenant: {
    tax_rate: 7
  }
} as unknown) as Product;

const dummySkus = ([
  {
    id: 1,
    name: 'Alaska Pollock 1kg',
    b2c_unit_per_oom: 1,
    b2c_market_unit_price: 1.5,
    b2c_unit_price: 1,
    is_b2c_pooling: true,
    b2c_pooling_qty: 6,
    halal: true
  },
  {
    id: 2,
    name: 'Alaska Pollock 5kg',
    b2c_unit_per_oom: 1,
    b2c_market_unit_price: 5.5,
    b2c_unit_price: 5,
    is_b2c_pooling: true,
    b2c_pooling_qty: 5,
    halal: true
  },
  {
    id: 3,
    name: 'Alaska Pollock 10kg',
    b2c_unit_per_oom: 1,
    b2c_market_unit_price: 10.5,
    b2c_unit_price: 10,
    is_b2c_pooling: true,
    b2c_pooling_qty: 5,
    halal: true
  }
] as unknown) as Sku[];

const dummyCustomer = {
  id: 1807,
  name: 'Demo Company'
} as Customer;

const dummySkuDeal = {
  id: 1
} as SkuDeal;

async function getProductDetailB2c(productId: number, productTypeId: number) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getProductDetailB2c(product_id:${productId}, product_type_id:${productTypeId}) {
          id
          name
          tax_rate
          max_amount
          max_market_price
          max_price
          min_amount
          min_market_price
          min_price
          skus {
            id
            name
            b2c_unit_per_oom
            b2c_market_unit_price
            b2c_unit_price
            last_pool {
                pool_qty
                is_fullfilled
                remaining_qty
            }
          }
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can fetch b2c product detail with available skus including pool progress', async () => {
    context.prisma.product.findUnique.mockResolvedValueOnce(dummyProduct);
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyCustomer);
    context.prisma.sku.findMany.mockResolvedValueOnce(dummySkus);
    context.prisma.skuDeal.findFirst.mockResolvedValueOnce(dummySkuDeal);
    context.clevertap.uploadEvents = jest.fn().mockResolvedValueOnce(true);

    const result = await getProductDetailB2c(1, 1);

    expect(result).toMatchObject({
      getProductDetailB2c: {
        id: dummyProduct.id,
        name: dummyProduct.name,
        max_amount: expect.any(Number),
        max_market_price: expect.any(Number),
        max_price: expect.any(Number),
        min_amount: expect.any(Number),
        min_market_price: expect.any(Number),
        min_price: expect.any(Number),
        skus: expect.any(Array)
      }
    });
  });

  it('user can fetch b2c product detail but the sku is empty as there is no available sku', async () => {
    context.prisma.product.findUnique.mockResolvedValueOnce(dummyProduct);
    context.prisma.sku.findMany.mockResolvedValueOnce([]);

    const result = await getProductDetailB2c(1, 1);

    expect(result).toMatchObject({
      getProductDetailB2c: {
        id: dummyProduct.id,
        name: dummyProduct.name,
        max_amount: null,
        max_market_price: null,
        max_price: null,
        min_amount: null,
        min_market_price: null,
        min_price: null,
        skus: []
      }
    });
  });

  it("can't fetch b2c product detail due to invalid product id", async () => {
    const result = await getProductDetailB2c(-100, 1);

    expect(result).toMatchObject({
      data: {
        getProductDetailB2c: null
      },
      errors: [
        {
          message: 'Product not found'
        }
      ]
    });
  });
});
