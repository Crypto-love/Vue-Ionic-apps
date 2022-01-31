import { HubSpreeData, Product, User } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2 };
const context = createTestContext(userInfo);
const dummyHubSprees = [{ tenant_id: 1 }, { tenant_id: 2 }, { tenant_id: 3 }] as HubSpreeData[];
const dummyHubSpreesSelected = [{ tenant_id: 1 }] as HubSpreeData[];
const dummyProducts = ([
  {
    id: 4,
    tenant_id: 1,
    name: 'Batang Steak 吧当鱼',
    image: 'fff36658-b5ca-4814-a726-3b4d65f070ca',
    category_id: 7,
    voucherify_id: null,
    active: true,
    created_at: '2020-03-01T06:00:00.000Z',
    updated_at: '2020-09-17T12:25:51.000Z',
    skus: [
      {
        id: 1007,
        product_id: 4,
        voucherify_sku_id: null,
        is_order_by_weight: false,
        name: 'Frozen Batang Steak 吧当鱼 (5 X 2 KG)',
        vendor_code: null,
        is_sample: false,
        alias: 'batang steak  (5 x 2 kg)',
        halal: true,
        perishable: false,
        oom_id: 7,
        uom_id: 1,
        unit_per_oom: '10',
        increment_qty: 1,
        weight: '10',
        price: '8',
        market_unit_price: '0',
        total_price: '80',
        total_market_price: '0',
        tax_rate: '0',
        image: null,
        specs: '{"Freshness":"Frozen","Packaging":"(5 X 2 KG)"}',
        country_of_origin: 'Europe',
        b2c: true,
        b2c_uom_id: 4,
        b2c_unit_per_oom: '1',
        b2c_increment_qty: 1,
        b2c_unit_price: '18.5',
        b2c_market_unit_price: '22.43',
        b2c_total_price: '0',
        b2c_total_market_price: '0',
        b2c_pooling_qty: 5,
        b2c_packaging: '(2 KG)',
        b2c_weight: '2',
        b2c_oom_id: 4,
        is_b2c_pooling: true,
        description: 'Weight indicated is gross weight',
        is_slack_notifiable: false,
        active: true,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-29T21:48:37.000Z'
      },
      {
        id: 2042,
        product_id: 4,
        voucherify_sku_id: null,
        is_order_by_weight: false,
        name: 'Frozen Batang Steak 吧当鱼 Sample (2   KG)',
        vendor_code: null,
        is_sample: false,
        alias: 'batang steak  (2 kg)',
        halal: true,
        perishable: false,
        oom_id: 7,
        uom_id: 1,
        unit_per_oom: '2',
        increment_qty: 1,
        weight: '2',
        price: '999',
        market_unit_price: '0',
        total_price: '1998',
        total_market_price: '0',
        tax_rate: '0',
        image: null,
        specs: '{"Freshness":"Frozen","Sample":"Sample","Packaging":"(2   KG)"}',
        country_of_origin: null,
        b2c: false,
        b2c_uom_id: 1,
        b2c_unit_per_oom: '0',
        b2c_increment_qty: 0,
        b2c_unit_price: '0',
        b2c_market_unit_price: '0',
        b2c_total_price: '0',
        b2c_total_market_price: '0',
        b2c_pooling_qty: 0,
        b2c_packaging: null,
        b2c_weight: '0',
        b2c_oom_id: 1,
        is_b2c_pooling: false,
        description: null,
        is_slack_notifiable: false,
        active: false,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-17T22:29:27.000Z'
      },
      {
        id: 3097,
        product_id: 4,
        voucherify_sku_id: null,
        is_order_by_weight: false,
        name: 'Frozen Batang Steak  LG (10   KG)',
        vendor_code: null,
        is_sample: false,
        alias: 'batang steak (10kg)',
        halal: false,
        perishable: false,
        oom_id: 7,
        uom_id: 1,
        unit_per_oom: '10',
        increment_qty: 1,
        weight: '10',
        price: '3.5',
        market_unit_price: '6',
        total_price: '0',
        total_market_price: '0',
        tax_rate: '0',
        image: null,
        specs: '{"Freshness":"Frozen","Seafood Grade":" LG","Packaging":"(10   KG)"}',
        country_of_origin: null,
        b2c: false,
        b2c_uom_id: 1,
        b2c_unit_per_oom: '0',
        b2c_increment_qty: 0,
        b2c_unit_price: '0',
        b2c_market_unit_price: '0',
        b2c_total_price: '0',
        b2c_total_market_price: '0',
        b2c_pooling_qty: 0,
        b2c_packaging: null,
        b2c_weight: '0',
        b2c_oom_id: 1,
        is_b2c_pooling: false,
        description: null,
        is_slack_notifiable: false,
        active: false,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-10-14T19:23:22.000Z'
      },
      {
        id: 3206,
        product_id: 4,
        voucherify_sku_id: null,
        is_order_by_weight: false,
        name: 'Frozen Batang Steak 吧当鱼 Sample (1   KG)',
        vendor_code: null,
        is_sample: true,
        alias: 'frozen batang steak (1kg)',
        halal: false,
        perishable: false,
        oom_id: 1,
        uom_id: 1,
        unit_per_oom: '1',
        increment_qty: 1,
        weight: '1',
        price: '0.01',
        market_unit_price: '0',
        total_price: '0.01',
        total_market_price: '0',
        tax_rate: '0',
        image: null,
        specs: '{"Freshness":"Frozen","Sample":"Sample","Packaging":"(1   KG)"}',
        country_of_origin: null,
        b2c: false,
        b2c_uom_id: 1,
        b2c_unit_per_oom: '0',
        b2c_increment_qty: 0,
        b2c_unit_price: '0',
        b2c_market_unit_price: '0',
        b2c_total_price: '0',
        b2c_total_market_price: '0',
        b2c_pooling_qty: 0,
        b2c_packaging: null,
        b2c_weight: '0',
        b2c_oom_id: 1,
        is_b2c_pooling: false,
        description: null,
        is_slack_notifiable: false,
        active: false,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-17T12:25:58.000Z'
      }
    ]
  }
] as unknown) as Product[];

const dummyUser = {
  id: userInfo.userId,
  email: 'test@thetreedots.com'
} as User;

async function getGroupBuyProducts(hubId: number) {
  const countryId = 193;
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getGroupBuyProducts(
          hubId:${hubId ? `${hubId}` : null},
          countryId:${countryId ? `${countryId}` : null},
        ) {
          id
          tenant_id
          category_id
          name
          image
          voucherify_id
          active
          category {
            id
            main_category_id
            sub_category_id
            active
            mainCategory {
              id
              name
              description
              active
            }
            subCategory {
              id
              name
              description
              active
            }
          }
          skus {
            id
            name
            product_id
            voucherify_sku_id
            is_order_by_weight
            name
            vendor_code
            is_sample
            alias
            halal
            perishable
            oom_id
            unit_per_oom
            increment_qty
            weight
            price
            market_unit_price
            total_price
            total_market_price
            tax_rate
            image
            specs
            country_of_origin
            description
            is_slack_notifiable
            active
            is_b2c_pooling
            b2c
          }
        }
      }`);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('customer can see all pooling item products regarding the hub', async () => {
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSprees);
    context.prisma.product.findMany.mockResolvedValueOnce(dummyProducts);
    context.prisma.user.findFirst.mockResolvedValueOnce(dummyUser);
    const result = await getGroupBuyProducts(null);
    expect(result).toMatchObject({
      getGroupBuyProducts: [
        {
          id: expect.any(Number),
          image: expect.any(String),
          name: expect.any(String),
          category_id: expect.any(Number),
          active: true,
          category: expect.any(Object)
        }
      ]
    });
  });
  it('customer can see all pooling item products base on the hub', async () => {
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreesSelected);
    context.prisma.product.findMany.mockResolvedValueOnce(dummyProducts);
    context.prisma.user.findFirst.mockResolvedValueOnce(dummyUser);
    const result = await getGroupBuyProducts(1440);
    expect(result).toMatchObject({
      getGroupBuyProducts: [
        {
          id: expect.any(Number),
          image: expect.any(String),
          name: expect.any(String),
          category_id: expect.any(Number),
          active: true,
          category: expect.any(Object)
        }
      ]
    });
  });
});
