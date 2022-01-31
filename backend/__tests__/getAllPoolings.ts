import { PreOrderItem } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

// pre_order_item
const dummyPreOrderItem = ([
  {
    id: 5,
    order_id: 3,
    sku_id: 1007,
    product_type_id: 2,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 1440,
    group_id: null,
    invoice_id: null,
    amount_qty: 1,
    total_qty: 11,
    origin_unit_price: 40.5432,
    sale_unit_price: 40.5432,
    total_price: 527.0616,
    tax: 0,
    discount: 0,
    original_sale_unit_price: 40.5432,
    original_total_price: 527.0616,
    original_tax: 0,
    sku_deal_id: null,
    cod: null,
    created_at: '2021-04-08T18:21:22.000Z',
    updated_at: '2021-04-08T11:21:22.000Z',
    last_user_id: 2208,
    description: null,
    active: true,
    order_item_status_id: -2,
    status_note: null,
    pre_order: {
      delivery_date: '2021-04-13T00:00:00.000Z'
    },
    user: {
      id: 2208,
      first_name: 'demo',
      last_name: 'b2c',
      mobile: '678678678'
    },
    sku: {
      id: 1007,
      is_b2c_pooling: true,
      b2c_pooling_qty: 5
    },
    pool_item: [
      {
        user_id: 2208,
        qty: 5,
        pool: {
          id: 1,
          is_fullfilled: true,
          pool_qty: 5
        }
      },
      {
        user_id: 2208,
        qty: 5,
        pool: {
          id: 2,
          is_fullfilled: true,
          pool_qty: 5
        }
      },
      {
        user_id: 2208,
        qty: 1,
        pool: {
          id: 3,
          is_fullfilled: false,
          pool_qty: 5
        }
      }
    ]
  }
] as unknown) as PreOrderItem[];

async function getAllPoolings(skuId: number, hubId: number, deliveryDate: string) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query{
        getAllPoolings(skuId:${skuId}, hubId:${hubId}, deliveryDate:"${deliveryDate}"){
          full_name
          mobile
          item_type
          pooling_qty
          non_pooling_qty
          successfully_pooled
          pending_pooling
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('customer can fetch pre order items to get pooling details data', async () => {
    context.prisma.preOrderItem.findMany.mockResolvedValueOnce(dummyPreOrderItem);
    const result = await getAllPoolings(1007, 1440, '2021-03-13T00:00:00.000Z');
    expect(result).toMatchObject({
      getAllPoolings: [
        {
          full_name: expect.any(String),
          mobile: expect.any(String),
          item_type: expect.any(String),
          pooling_qty: expect.any(Number),
          non_pooling_qty: expect.any(Number),
          successfully_pooled: expect.any(Number),
          pending_pooling: expect.any(Number)
        }
      ]
    });
  });
});
