describe('ensure that', () => {
  it.todo('customer can see a random list of discounted regardless the hub selection');
  it.todo('customer can see a random list of discounted base on the hub');
});

// import { HubSpreeData, Product } from '@treedots/prisma';
// import { createTestContext } from './__helper';

// const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2 };
// const context = createTestContext(userInfo);
// const dummyHubSprees = [{ tenant_id: 1 }, { tenant_id: 2 }, { tenant_id: 3 }] as HubSpreeData[];
// const dummyHubSpreesSelected = [{ tenant_id: 1 }] as HubSpreeData[];
// const dummyProducts = ([
//   {
//     id: 4,
//     tenant_id: 1,
//     name: 'Batang Steak 吧当鱼',
//     image: 'fff36658-b5ca-4814-a726-3b4d65f070ca',
//     category_id: 7,
//     voucherify_id: null,
//     active: true,
//     created_at: '2020-03-01T06:00:00.000Z',
//     updated_at: '2020-09-17T12:25:51.000Z',
//     skus: [
//       {
//         id: 1007,
//         product_id: 4,
//         voucherify_sku_id: null,
//         is_order_by_weight: false,
//         name: 'Frozen Batang Steak 吧当鱼 (5 X 2 KG)',
//         vendor_code: null,
//         is_sample: false,
//         alias: 'batang steak  (5 x 2 kg)',
//         halal: true,
//         perishable: false,
//         oom_id: 7,
//         uom_id: 1,
//         unit_per_oom: '10',
//         increment_qty: 1,
//         weight: '10',
//         price: '8',
//         market_unit_price: '0',
//         total_price: '80',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Freshness":"Frozen","Packaging":"(5 X 2 KG)"}',
//         country_of_origin: 'Europe',
//         b2c: true,
//         b2c_uom_id: 4,
//         b2c_unit_per_oom: '1',
//         b2c_increment_qty: 1,
//         b2c_unit_price: '18.5',
//         b2c_market_unit_price: '22.43',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 5,
//         b2c_packaging: '(2 KG)',
//         b2c_weight: '2',
//         b2c_oom_id: 4,
//         is_b2c_pooling: true,
//         description: 'Weight indicated is gross weight',
//         is_slack_notifiable: false,
//         active: true,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2020-09-29T21:48:37.000Z'
//       },
//       {
//         id: 2042,
//         product_id: 4,
//         voucherify_sku_id: null,
//         is_order_by_weight: false,
//         name: 'Frozen Batang Steak 吧当鱼 Sample (2   KG)',
//         vendor_code: null,
//         is_sample: false,
//         alias: 'batang steak  (2 kg)',
//         halal: true,
//         perishable: false,
//         oom_id: 7,
//         uom_id: 1,
//         unit_per_oom: '2',
//         increment_qty: 1,
//         weight: '2',
//         price: '999',
//         market_unit_price: '0',
//         total_price: '1998',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Freshness":"Frozen","Sample":"Sample","Packaging":"(2   KG)"}',
//         country_of_origin: null,
//         b2c: false,
//         b2c_uom_id: 1,
//         b2c_unit_per_oom: '0',
//         b2c_increment_qty: 0,
//         b2c_unit_price: '0',
//         b2c_market_unit_price: '0',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 0,
//         b2c_packaging: null,
//         b2c_weight: '0',
//         b2c_oom_id: 1,
//         is_b2c_pooling: false,
//         description: null,
//         is_slack_notifiable: false,
//         active: false,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2020-09-17T22:29:27.000Z'
//       },
//       {
//         id: 3097,
//         product_id: 4,
//         voucherify_sku_id: null,
//         is_order_by_weight: false,
//         name: 'Frozen Batang Steak  LG (10   KG)',
//         vendor_code: null,
//         is_sample: false,
//         alias: 'batang steak (10kg)',
//         halal: false,
//         perishable: false,
//         oom_id: 7,
//         uom_id: 1,
//         unit_per_oom: '10',
//         increment_qty: 1,
//         weight: '10',
//         price: '3.5',
//         market_unit_price: '6',
//         total_price: '0',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Freshness":"Frozen","Seafood Grade":" LG","Packaging":"(10   KG)"}',
//         country_of_origin: null,
//         b2c: false,
//         b2c_uom_id: 1,
//         b2c_unit_per_oom: '0',
//         b2c_increment_qty: 0,
//         b2c_unit_price: '0',
//         b2c_market_unit_price: '0',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 0,
//         b2c_packaging: null,
//         b2c_weight: '0',
//         b2c_oom_id: 1,
//         is_b2c_pooling: false,
//         description: null,
//         is_slack_notifiable: false,
//         active: false,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2020-10-14T19:23:22.000Z'
//       },
//       {
//         id: 3206,
//         product_id: 4,
//         voucherify_sku_id: null,
//         is_order_by_weight: false,
//         name: 'Frozen Batang Steak 吧当鱼 Sample (1   KG)',
//         vendor_code: null,
//         is_sample: true,
//         alias: 'frozen batang steak (1kg)',
//         halal: false,
//         perishable: false,
//         oom_id: 1,
//         uom_id: 1,
//         unit_per_oom: '1',
//         increment_qty: 1,
//         weight: '1',
//         price: '0.01',
//         market_unit_price: '0',
//         total_price: '0.01',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Freshness":"Frozen","Sample":"Sample","Packaging":"(1   KG)"}',
//         country_of_origin: null,
//         b2c: false,
//         b2c_uom_id: 1,
//         b2c_unit_per_oom: '0',
//         b2c_increment_qty: 0,
//         b2c_unit_price: '0',
//         b2c_market_unit_price: '0',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 0,
//         b2c_packaging: null,
//         b2c_weight: '0',
//         b2c_oom_id: 1,
//         is_b2c_pooling: false,
//         description: null,
//         is_slack_notifiable: false,
//         active: false,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2020-09-17T12:25:58.000Z'
//       }
//     ]
//   },
//   {
//     id: 16,
//     tenant_id: 1,
//     name: 'Chicken Bone 鸡骨',
//     image: 'ef0f3c02-8e9c-4127-a36e-96c1d3eb5437',
//     category_id: 2,
//     voucherify_id: null,
//     active: true,
//     created_at: '2020-03-01T06:00:00.000Z',
//     updated_at: '2020-09-17T12:25:51.000Z',
//     skus: [
//       {
//         id: 1052,
//         product_id: 16,
//         voucherify_sku_id: null,
//         is_order_by_weight: true,
//         name: 'Fresh Chicken Bone (5 KG)',
//         vendor_code: null,
//         is_sample: false,
//         alias: 'ck bone',
//         halal: true,
//         perishable: false,
//         oom_id: 4,
//         uom_id: 1,
//         unit_per_oom: '1',
//         increment_qty: 1,
//         weight: '5',
//         price: '1',
//         market_unit_price: '0',
//         total_price: '1',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Packaging":"(5 KG)","Freshness":"Fresh"}',
//         country_of_origin: 'Malaysia',
//         b2c: true,
//         b2c_uom_id: 4,
//         b2c_unit_per_oom: '1',
//         b2c_increment_qty: 1,
//         b2c_unit_price: '5.42',
//         b2c_market_unit_price: '21.5',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 0,
//         b2c_packaging: '(5 KG)',
//         b2c_weight: '5',
//         b2c_oom_id: 4,
//         is_b2c_pooling: false,
//         description:
//           'Chickens come live from Malaysia and slaughtered in Singapore on the morning of collection, delivered straight from the slaughterhouses in our cold trucks',
//         is_slack_notifiable: false,
//         active: true,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2021-01-06T11:33:39.000Z'
//       },
//       {
//         id: 2300,
//         product_id: 16,
//         voucherify_sku_id: null,
//         is_order_by_weight: false,
//         name: '(SAMPLE) Fresh Chicken Bone (5 KG)',
//         vendor_code: null,
//         is_sample: false,
//         alias: 'ck bone',
//         halal: true,
//         perishable: false,
//         oom_id: 1,
//         uom_id: 1,
//         unit_per_oom: '1',
//         increment_qty: 1,
//         weight: '5',
//         price: '999',
//         market_unit_price: '0',
//         total_price: '999',
//         total_market_price: '0',
//         tax_rate: '0',
//         image: null,
//         specs: '{"Packaging":"(5 KG)","Freshness":"Fresh"}',
//         country_of_origin: null,
//         b2c: null,
//         b2c_uom_id: 1,
//         b2c_unit_per_oom: '1',
//         b2c_increment_qty: 1,
//         b2c_unit_price: '0',
//         b2c_market_unit_price: '0',
//         b2c_total_price: '0',
//         b2c_total_market_price: '0',
//         b2c_pooling_qty: 0,
//         b2c_packaging: null,
//         b2c_weight: '0',
//         b2c_oom_id: 1,
//         is_b2c_pooling: false,
//         description: null,
//         is_slack_notifiable: false,
//         active: true,
//         created_at: '2020-03-01T06:00:00.000Z',
//         updated_at: '2020-09-17T12:25:58.000Z'
//       }
//     ]
//   }
// ] as unknown) as Product[];
// async function getHotDiscountProductsB2C(hubId: number) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(`
//       query {
//         getHotDiscountProductsB2C(
//           hubId:${hubId ? `${hubId}` : null}
//         ) {
//           id
//           name
//           tenant_id
//           category_id
//           image
//           category {
//             id
//           }
//           voucherify_id
//           active
//           skus {
//             id
//             product_id
//             inventories {
//               id
//             }
//           }
//           max_price
//           max_amount
//           max_market_price
//           min_price
//           min_amount
//           min_market_price
//           discount
//         }
//       }
//     `);
//   } catch (e) {
//     return e.response || e;
//   }
// }

// describe('ensure that', function () {
//   it('customer can see a random list of discounted regardless the hub selection', async () => {
//     context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSprees);
//     context.prisma.product.findMany.mockResolvedValueOnce(dummyProducts);
//     const result = await getHotDiscountProductsB2C(null);
//     expect(result).toMatchObject({
//       getHotDiscountProductsB2C: [
//         {
//           id: expect.any(Number),
//           image: expect.any(String),
//           name: expect.any(String),
//           category_id: expect.any(Number),
//           tenant_id: expect.any(Number),
//           active: true,
//           category: expect.any(Object),
//           discount: expect.any(Number),
//           max_amount: expect.any(Number),
//           max_market_price: expect.any(Number),
//           max_price: expect.any(Number),
//           min_amount: expect.any(Number),
//           min_market_price: expect.any(Number),
//           min_price: expect.any(Number)
//         },
//         {
//           id: expect.any(Number),
//           image: expect.any(String),
//           name: expect.any(String),
//           category_id: expect.any(Number),
//           tenant_id: expect.any(Number),
//           active: true,
//           category: expect.any(Object),
//           discount: expect.any(Number),
//           max_amount: expect.any(Number),
//           max_market_price: expect.any(Number),
//           max_price: expect.any(Number),
//           min_amount: expect.any(Number),
//           min_market_price: expect.any(Number),
//           min_price: expect.any(Number)
//         }
//       ]
//     });
//   });
//   it('customer can see a random list of discounted base on the hub', async () => {
//     context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreesSelected);
//     context.prisma.product.findMany.mockResolvedValueOnce(dummyProducts);
//     const result = await getHotDiscountProductsB2C(1440);
//     expect(result).toMatchObject({
//       getHotDiscountProductsB2C: [
//         {
//           id: expect.any(Number),
//           image: expect.any(String),
//           name: expect.any(String),
//           category_id: expect.any(Number),
//           tenant_id: expect.any(Number),
//           active: true,
//           category: expect.any(Object),
//           discount: expect.any(Number),
//           max_amount: expect.any(Number),
//           max_market_price: expect.any(Number),
//           max_price: expect.any(Number),
//           min_amount: expect.any(Number),
//           min_market_price: expect.any(Number),
//           min_price: expect.any(Number)
//         },
//         {
//           id: expect.any(Number),
//           image: expect.any(String),
//           name: expect.any(String),
//           category_id: expect.any(Number),
//           tenant_id: expect.any(Number),
//           active: true,
//           category: expect.any(Object),
//           discount: expect.any(Number),
//           max_amount: expect.any(Number),
//           max_market_price: expect.any(Number),
//           max_price: expect.any(Number),
//           min_amount: expect.any(Number),
//           min_market_price: expect.any(Number),
//           min_price: expect.any(Number)
//         }
//       ]
//     });
//   });
// });
