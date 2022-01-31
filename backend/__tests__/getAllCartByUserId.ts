import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const dummyCart = [
  {
    id: '92970f61-ab43-4147-ae78-d79ba2d10b9f',
    user_id: 2208,
    customer_id: 1440,
    created_at: formatISODateString('2021-05-09T02:17:42.000Z'),
    updated_at: formatISODateString('2021-05-09T02:17:42.000Z'),
    items: [
      {
        id: '148a1554-f7bf-432f-994a-976282b7775c',
        cart_id: '92970f61-ab43-4147-ae78-d79ba2d10b9f',
        sku_id: 3482,
        price: '23.83',
        order_quantity: 1,
        order_weight: '0.5',
        created_at: formatISODateString('2021-05-09T10:50:58.000Z'),
        updated_at: formatISODateString('2021-05-09T10:50:58.000Z'),
        sku: {
          id: 3482,
          product_id: 251,
          voucherify_sku_id: null,
          is_order_by_weight: false,
          name: 'Beef Tongue Slice 2-3mm (500 G) II',
          vendor_code: null,
          is_sample: false,
          alias: 'Beef Tongue Slice 2-3mm (500 G) II',
          halal: true,
          perishable: false,
          oom_id: 4,
          uom_id: 4,
          unit_per_oom: '1',
          increment_qty: 1,
          weight: '0.5',
          price: '20.35',
          market_unit_price: '0',
          total_price: '20.35',
          total_market_price: '0',
          tax_rate: '0',
          image: '94b9533c-98fc-49c6-901d-25f0e1499d48',
          specs: '{"Packaging": "(500 G)", "Beef Thickness": "2-3mm"}',
          country_of_origin: 'Australia',
          b2c: true,
          b2c_uom_id: 4,
          b2c_unit_per_oom: '1',
          b2c_increment_qty: 1,
          b2c_unit_price: '23.83',
          b2c_market_unit_price: '32.3',
          b2c_total_price: '0',
          b2c_total_market_price: '0',
          b2c_pooling_qty: 0,
          b2c_packaging: '(500 G)',
          b2c_weight: '0.5',
          b2c_oom_id: 4,
          is_b2c_pooling: true,
          description: 'Grass fed II',
          is_slack_notifiable: false,
          active: true,
          created_at: formatISODateString('2021-05-09T17:05:08.000Z'),
          updated_at: formatISODateString('2021-05-09T17:20:34.000Z'),
          product: {
            id: 251,
            tenant_id: 1,
            name: 'Beef Tongue Slice',
            image: '6d0313fb-13a9-4bbb-ad45-5b001b29e130',
            category_id: 17,
            voucherify_id: 'prod_ztE8poKC2cn8nQ',
            active: true,
            created_at: formatISODateString('2020-03-01T06:00:00.000Z'),
            updated_at: formatISODateString('2020-09-17T12:25:51.000Z'),
            tenant: {
              id: 1,
              registration_number: 'R-45678',
              tax_registration_number: 'T-0123',
              tax_rate: '7',
              building_name: null,
              street_name: null,
              unit_number: null,
              email: 'orders@thetreedots.com',
              first_name: 'Jiacai',
              last_name: 'Lau',
              logo: null,
              email_notification: 1,
              class_id: 2,
              default_credit_card_term: 0,
              tenant: {
                id: 12,
                name: 'Manna Pot Catering Pte Ltd',
                alias_name: null,
                account_number: 'B0001',
                group_id: null,
                customer_type_id: 2,
                collection_type_id: null,
                profile: 'Catering',
                halal_products: false,
                beef_products: false,
                cod: false,
                credit_term: 30,
                payment_type: 0,
                delivery_instruction: null,
                delivery_charge: '10',
                minimum_order: '0',
                hub: false,
                active: true,
                xero_id: '9f8db417-6d18-4a35-8ca0-a4a86f504854',
                voucherify_id: null,
                direction: null,
                hub_delivery_fee: null,
                hub_can_delivery: false,
                whatsapp_link: null,
                storecove_id: null,
                peppol_id: null,
                tenant_id: 1,
                peppol_scheme_id: null
              }
            }
          }
        }
      }
    ]
  },
  {
    id: '6230d3e8-cd90-4a0f-82ff-c5fdadea7424',
    user_id: 2208,
    customer_id: 1653,
    created_at: formatISODateString('2021-05-08T17:22:01.000Z'),
    updated_at: formatISODateString('2021-05-08T17:22:01.000Z'),
    items: []
  },
  {
    id: '88fc9197-7335-4cd4-afba-b06d3065fc4d',
    user_id: 2208,
    customer_id: 1998,
    created_at: formatISODateString('2021-05-09T18:51:41.000Z'),
    updated_at: formatISODateString('2021-05-09T18:51:41.000Z'),
    items: []
  },
  {
    id: 'd4ced94b-a5e1-49ab-a522-26ee4f3c26ec',
    user_id: 2208,
    customer_id: 2008,
    created_at: formatISODateString('2021-05-11T05:53:19.000Z'),
    updated_at: formatISODateString('2021-05-11T05:53:19.000Z'),
    items: []
  },
  {
    id: '45d08dca-63fd-4ecc-abad-6713ceae892d',
    user_id: 2208,
    customer_id: 2855,
    created_at: formatISODateString('2021-05-08T17:18:45.000Z'),
    updated_at: formatISODateString('2021-05-08T17:18:45.000Z'),
    items: []
  },
  {
    id: '67c9f739-889d-4f0c-9924-28ae43ac926d',
    user_id: 2208,
    customer_id: 3061,
    created_at: formatISODateString('2021-05-09T02:12:56.000Z'),
    updated_at: formatISODateString('2021-05-09T02:12:56.000Z'),
    items: []
  },
  {
    id: 'f9d7f9a7-fa67-415a-a9c8-41543ac7e75e',
    user_id: 2208,
    customer_id: 3072,
    created_at: formatISODateString('2021-05-08T17:24:05.000Z'),
    updated_at: formatISODateString('2021-05-08T17:24:05.000Z'),
    items: []
  }
];
const dummyInventoriesA = [{ quantity: -1 }];
const dummyHubSpreeData = [
  {
    hub_id: 1440,
    delivery_date: '2021-05-03T00:00:00.000Z',
    start_date: formatISODateString('2021-04-02T00:00:00.000Z'),
    end_date: formatISODateString('2021-04-30T20:00:00.000Z'),
    tenant_id: 1
  }
];
const dummyCustomers = [{ alias_name: 'TREEDOT', name: 'Treedots', minimum_order: '250', tenant_id: 1 }];
async function getAllCartByUserId(hubId) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getAllCartByUserId(hubId: ${hubId}) {
          active_sprees {
            hub_id
            minimum_order
            name
            alias_name
            delivery_date
            start_date
            end_date
            tenant_id
          }
          cart_items {
            supplier {
              id
              tax_rate
              tenant {
                name
              }
            }
            items {
              id
              sku_id
              order_quantity
              order_weight
              price
              item_quantity
              sku {
                id
                image
                is_sample
                name
                b2c_increment_qty
                b2c_market_unit_price
                b2c_oom_id
                b2c_packaging
                b2c_pooling_qty
                b2c_total_market_price
                b2c_total_price
                b2c_unit_per_oom
                b2c_unit_price
                b2c_uom_id
                b2c_weight
                halal
                is_b2c_pooling
                is_order_by_weight
                tax_rate
                active
                inventories {
                  unit_amount
                  customer_id
                  id
                  quantity
                  rank
                }
                product {
                  id
                  tenant_id
                  name
                  image
                  tenant {
                    id
                    tax_rate
                    tenant {
                      name
                    }
                  }
                }
                b2c_uom {
                  name
                }
                b2c_oom {
                  name
                }
              }
            }
          }
        }
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}
function formatISODateString(data) {
  const isoString = new Date(data).toISOString();
  return isoString;
}
describe('ensure that', () => {
  it('user can fetch all of their existing cart', async () => {
    const hubId = 1440;
    context.prisma.cart.findMany.mockResolvedValueOnce(dummyCart);
    context.prisma.inventory.findMany.mockResolvedValueOnce(dummyInventoriesA);
    context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreeData);
    context.prisma.customer.findMany.mockResolvedValueOnce(dummyCustomers);
    const result = await getAllCartByUserId(hubId);
    expect(result).toMatchObject({
      data: {
        getAllCartByUserId: {
          active_sprees: expect.any(Array),
          cart_items: [
            {
              items: expect.any(Array),
              supplier: expect.any(Object)
            }
          ]
        }
      }
    });
  });
});
