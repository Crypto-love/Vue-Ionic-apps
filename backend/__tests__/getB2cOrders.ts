import { PreOrder } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const ctx = createTestContext(userInfo);

const dummyPreOrder = ([
  {
    id: 47571,
    order_status_id: 12,
    payment_b2c_id: 28,
    po_number: '-',
    standalone: false,
    delivery_date: new Date('2021-05-22T00:00:00.000Z'),
    delivery_time: null,
    stripe_transaction_id: null,
    spree_id: 12312249,
    charge_date: new Date('2021-05-28T00:00:00.000Z'),
    close_date: new Date('2021-05-20T00:00:00.000Z'),
    payment_date: new Date('2021-05-21T00:00:00.000Z'),
    payment_status_id: 4,
    created_at: new Date('2021-05-21T17:08:30.000Z'),
    updated_at: new Date('2021-06-04T18:05:15.000Z'),
    last_user_id: 2208,
    b2b_order_id: null,
    description: '',
    active: true,
    token: null,
    voucher_discount_type: null,
    voucher_discount: null,
    total_charged: 257.442,
    pre_order_item: [
      {
        total_price: 176.48,
        tax: 12.3536,
        sku_id: 1705,
        order_item_status_id: 12,
        customer_buyer_id: 2008,
        sku: {
          id: 1705,
          product_id: 169,
          voucherify_sku_id: null,
          is_order_by_weight: false,
          name: 'Vannamei Live Frozen HOSO Semi IQF 31/40 (10 X 1KG)',
          vendor_code: null,
          is_sample: false,
          alias: 'vannamei live frozen hoso semi iqf 31/40 (10 x 1kg)',
          halal: true,
          perishable: false,
          oom_id: 7,
          uom_id: 1,
          unit_per_oom: 10,
          increment_qty: 1,
          weight: 10,
          price: 8.9,
          market_unit_price: 0,
          total_price: 89,
          total_market_price: 0,
          tax_rate: 0,
          image: null,
          country_of_origin: 'Indonesia',
          b2c: true,
          b2c_uom_id: 4,
          b2c_unit_per_oom: 1,
          b2c_increment_qty: 1,
          b2c_unit_price: 11.03,
          b2c_market_unit_price: 17.66,
          b2c_total_price: 0,
          b2c_total_market_price: 250,
          b2c_pooling_qty: 10,
          b2c_packaging: '(1 KG)',
          b2c_weight: 1,
          b2c_oom_id: 4,
          is_b2c_pooling: true,
          description: 'Weight indicated is gross weight',
          is_slack_notifiable: false,
          active: true,
          created_at: '2020-03-01T06:00:00.000Z',
          updated_at: '2021-05-05T14:59:55.000Z',
          product: {
            id: 169,
            tenant_id: 1,
            name: 'Vannamei Live Frozen',
            image: 'f7f9610f-300c-4b40-b0c2-3f2b661d9f70',
            category_id: 8,
            voucherify_id: null,
            active: true,
            created_at: '2020-03-01T06:00:00.000Z',
            updated_at: '2020-09-17T12:25:51.000Z',
            tenant: {
              id: 1,
              registration_number: 'R-45678',
              tax_registration_number: 'T-0123',
              tax_rate: 7,
              building_name: null,
              street_name: null,
              unit_number: null,
              email: 'orders@thetreedots.com',
              first_name: 'Jiacai',
              last_name: 'Lau',
              logo: 'treedots',
              email_notification: 1,
              class_id: 2,
              default_credit_card_term: 0,
              customer: [
                {
                  id: 2222,
                  name: 'Treedots',
                  alias_name: 'TREEDOT',
                  account_number: null,
                  group_id: null,
                  customer_type_id: 3,
                  collection_type_id: null,
                  profile: 'Wholesale',
                  halal_products: false,
                  beef_products: false,
                  cod: false,
                  credit_term: 0,
                  payment_type: 1,
                  delivery_instruction: null,
                  delivery_charge: 0,
                  minimum_order: 290,
                  hub: false,
                  active: true,
                  xero_id: null,
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
              ]
            }
          }
        },
        hub: {
          id: 2008,
          name: 'Ang Mo Kio - Shree Srisha - B2C',
          alias_name: 'Ang Mo Kio',
          account_number: 'B1648',
          group_id: null,
          customer_type_id: 2,
          collection_type_id: 0,
          profile: 'Other',
          halal_products: false,
          beef_products: false,
          cod: false,
          credit_term: 7,
          payment_type: 0,
          delivery_instruction: null,
          delivery_charge: 0,
          minimum_order: 300,
          hub: true,
          active: true,
          xero_id: '31c3c677-519c-46c4-b124-1c36f072cb68',
          voucherify_id: null,
          direction: null,
          hub_delivery_fee: null,
          hub_can_delivery: false,
          whatsapp_link: 'https://chat.whatsapp.com/HYI9etR6Han8k407HuTIbe',
          storecove_id: null,
          peppol_id: null,
          tenant_id: null,
          peppol_scheme_id: null
        }
      },
      {
        total_price: 64.12,
        tax: 4.4884,
        sku_id: 3197,
        order_item_status_id: 12,
        customer_buyer_id: 2008,
        sku: {
          id: 3197,
          product_id: 139,
          voucherify_sku_id: null,
          is_order_by_weight: false,
          name: 'Frozen Salmon Portion 180-225g (500   G)',
          vendor_code: null,
          is_sample: false,
          alias: null,
          halal: true,
          perishable: false,
          oom_id: 4,
          uom_id: 4,
          unit_per_oom: 1,
          increment_qty: 1,
          weight: 0.5,
          price: 8.2,
          market_unit_price: 10,
          total_price: 8.2,
          total_market_price: 10,
          tax_rate: 0,
          image: null,
          country_of_origin: 'Chile',
          b2c: true,
          b2c_uom_id: 4,
          b2c_unit_per_oom: 1,
          b2c_increment_qty: 1,
          b2c_unit_price: 9.16,
          b2c_market_unit_price: 13.08,
          b2c_total_price: 0,
          b2c_total_market_price: 250,
          b2c_pooling_qty: 0,
          b2c_packaging: '(500 G)',
          b2c_weight: 0.5,
          b2c_oom_id: 4,
          is_b2c_pooling: false,
          description: 'Weight indicated is gross weight',
          is_slack_notifiable: false,
          active: true,
          created_at: '2020-03-01T06:00:00.000Z',
          updated_at: '2021-05-05T14:59:55.000Z',
          product: {
            id: 139,
            tenant_id: 1,
            name: 'Salmon Portion',
            image: '20167680-9d47-454f-b0df-3de14d32af0a',
            category_id: 7,
            voucherify_id: null,
            active: true,
            created_at: '2020-03-01T06:00:00.000Z',
            updated_at: '2020-09-17T12:25:51.000Z',
            tenant: {
              id: 1,
              registration_number: 'R-45678',
              tax_registration_number: 'T-0123',
              tax_rate: 7,
              building_name: null,
              street_name: null,
              unit_number: null,
              email: 'orders@thetreedots.com',
              first_name: 'Jiacai',
              last_name: 'Lau',
              logo: 'treedots',
              email_notification: 1,
              class_id: 2,
              default_credit_card_term: 0
            }
          }
        },
        hub: {
          id: 2008,
          name: 'Ang Mo Kio - Shree Srisha - B2C',
          alias_name: 'Ang Mo Kio',
          account_number: 'B1648',
          group_id: null,
          customer_type_id: 2,
          collection_type_id: 0,
          profile: 'Other',
          halal_products: false,
          beef_products: false,
          cod: false,
          credit_term: 7,
          payment_type: 0,
          delivery_instruction: null,
          delivery_charge: 0,
          minimum_order: 300,
          hub: true,
          active: true,
          xero_id: '31c3c677-519c-46c4-b124-1c36f072cb68',
          voucherify_id: null,
          direction: null,
          hub_delivery_fee: null,
          hub_can_delivery: false,
          whatsapp_link: 'https://chat.whatsapp.com/HYI9etR6Han8k407HuTIbe',
          storecove_id: null,
          peppol_id: null,
          tenant_id: null,
          peppol_scheme_id: null
        }
      }
    ],
    order_status: {
      id: 12,
      name: 'Refunded',
      description: 'Manual Refund',
      active: true
    },
    user: {
      id: 2208,
      email: 'demo_b2c@gmail.com',
      password: '747b7a79787f7e7d',
      passwordV3: '$2a$10$7XCZt0mivTkCGJUFqeld6.ty/7LnHJWBSAvrf5VeN6OjQ9mftMTAu',
      username: 'demo_b2c',
      mobile: '678678678',
      first_name: 'Demo',
      last_name: 'B2c',
      gender: 'f',
      birth_date: '2019-12-10T00:00:00.000Z',
      country_id: 193,
      address: 'dummy address',
      image: 'b018b691-62a9-4c8c-9f78-2150465a1ff1',
      user_type_id: 6,
      buyer_type: 2,
      stripe_customer_id: 'cus_JW9sHJdRGsE1ff',
      stripe_card_id: 'card_1ItVlLHzlMR8SHJISkmERjHF',
      active: true,
      date_created: null
    }
  },
  {
    id: 47568,
    order_status_id: 12,
    payment_b2c_id: 26,
    po_number: '-',
    standalone: false,
    delivery_date: new Date('2021-06-03T00:00:00.000Z'),
    delivery_time: null,
    stripe_transaction_id: null,
    spree_id: 91,
    charge_date: new Date('2021-05-28T00:00:00.000Z'),
    close_date: new Date('2020-12-19T00:00:00.000Z'),
    payment_date: new Date('2021-05-21T00:00:00.000Z'),
    payment_status_id: 3,
    created_at: new Date('2021-05-21T09:39:43.000Z'),
    updated_at: new Date('2021-06-04T18:15:22.000Z'),
    last_user_id: 2208,
    b2b_order_id: null,
    description: '',
    active: true,
    token: null,
    voucher_discount_type: null,
    voucher_discount: null,
    total_charged: 19.795,
    pre_order_item: [
      {
        total_price: 18.5,
        tax: 1.295,
        sku_id: 1007,
        order_item_status_id: 12,
        customer_buyer_id: 1767,
        sku: {
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
          unit_per_oom: 10,
          increment_qty: 1,
          weight: 10,
          price: 8,
          market_unit_price: 0,
          total_price: 80,
          total_market_price: 0,
          tax_rate: 0,
          image: null,
          country_of_origin: 'Europe',
          b2c: true,
          b2c_uom_id: 4,
          b2c_unit_per_oom: 1,
          b2c_increment_qty: 1,
          b2c_unit_price: 18.5,
          b2c_market_unit_price: 22.43,
          b2c_total_price: 0,
          b2c_total_market_price: 250,
          b2c_pooling_qty: 5,
          b2c_packaging: '(2 KG)',
          b2c_weight: 2,
          b2c_oom_id: 4,
          is_b2c_pooling: true,
          description: 'Weight indicated is gross weight',
          is_slack_notifiable: false,
          active: true,
          created_at: '2020-03-01T06:00:00.000Z',
          updated_at: '2021-05-05T14:59:55.000Z',
          product: {
            id: 4,
            tenant_id: 2,
            name: 'Batang Steak 吧当鱼',
            image: 'fff36658-b5ca-4814-a726-3b4d65f070ca',
            category_id: 7,
            voucherify_id: null,
            active: true,
            created_at: '2020-03-01T06:00:00.000Z',
            updated_at: '2020-09-17T12:25:51.000Z',
            tenant: {
              id: 2,
              registration_number: 'R-45678',
              tax_registration_number: 'T-0123',
              tax_rate: 7,
              building_name: null,
              street_name: null,
              unit_number: null,
              email: 'orders@thetreedots.com',
              first_name: 'Jiacai',
              last_name: 'Lau',
              logo: 'treedots',
              email_notification: 1,
              class_id: 2,
              default_credit_card_term: 0,
              customer: [
                {
                  id: 2284,
                  name: 'Quality Meat Pte Ltd',
                  alias_name: 'QM12311',
                  account_number: null,
                  group_id: null,
                  customer_type_id: 3,
                  collection_type_id: null,
                  profile: 'Wholesale',
                  halal_products: false,
                  beef_products: false,
                  cod: false,
                  credit_term: 0,
                  payment_type: 1,
                  delivery_instruction: null,
                  delivery_charge: 0,
                  minimum_order: 290,
                  hub: false,
                  active: true,
                  xero_id: null,
                  voucherify_id: null,
                  direction: null,
                  hub_delivery_fee: null,
                  hub_can_delivery: false,
                  whatsapp_link: null,
                  storecove_id: null,
                  peppol_id: null,
                  tenant_id: 2,
                  peppol_scheme_id: null
                }
              ]
            }
          }
        },
        hub: {
          id: 1767,
          name: 'Sol Acres B2C',
          alias_name: 'Sol Acres',
          account_number: 'B1434',
          group_id: null,
          customer_type_id: 2,
          collection_type_id: null,
          profile: 'Other',
          halal_products: false,
          beef_products: false,
          cod: false,
          credit_term: 7,
          payment_type: 0,
          delivery_instruction: null,
          delivery_charge: 0,
          minimum_order: 200,
          hub: true,
          active: true,
          xero_id: '8c481f54-baaf-4aa6-8e53-ec7584056af2',
          voucherify_id: null,
          direction: null,
          hub_delivery_fee: null,
          hub_can_delivery: false,
          whatsapp_link: 'https://t.me/joinchat/FQIXvROKoxWYyW9zzkEW-A',
          storecove_id: null,
          peppol_id: null,
          tenant_id: 1,
          peppol_scheme_id: null
        }
      }
    ],
    order_status: {
      id: 12,
      name: 'Refunded',
      description: 'Manual Refund',
      active: true
    },
    user: {
      id: 2208,
      email: 'demo_b2c@gmail.com',
      password: '747b7a79787f7e7d',
      passwordV3: '$2a$10$7XCZt0mivTkCGJUFqeld6.ty/7LnHJWBSAvrf5VeN6OjQ9mftMTAu',
      username: 'demo_b2c',
      mobile: '678678678',
      first_name: 'Demo',
      last_name: 'B2c',
      gender: 'f',
      birth_date: '2019-12-10T00:00:00.000Z',
      country_id: 193,
      address: 'dummy address',
      image: 'b018b691-62a9-4c8c-9f78-2150465a1ff1',
      user_type_id: 6,
      buyer_type: 2,
      stripe_customer_id: 'cus_JW9sHJdRGsE1ff',
      stripe_card_id: 'card_1ItVlLHzlMR8SHJISkmERjHF',
      active: true,
      date_created: null
    }
  },
  {
    id: 47562,
    order_status_id: -2,
    payment_b2c_id: 23,
    po_number: '-',
    standalone: false,
    delivery_date: new Date('2021-06-07T00:00:00.000Z'),
    delivery_time: null,
    stripe_transaction_id: null,
    spree_id: 238,
    charge_date: new Date('2021-05-28T00:00:00.000Z'),
    close_date: new Date('2020-12-19T00:00:00.000Z'),
    payment_date: new Date('2021-05-21T00:00:00.000Z'),
    payment_status_id: 3,
    created_at: new Date('2021-05-21T06:26:45.000Z'),
    updated_at: new Date('2021-05-31T12:02:01.000Z'),
    last_user_id: 2208,
    b2b_order_id: null,
    description: '',
    active: true,
    token: null,
    voucher_discount_type: null,
    voucher_discount: null,
    total_charged: 5.7994,
    pre_order_item: [
      {
        total_price: 5.42,
        tax: 0.3794,
        sku_id: 1007,
        order_item_status_id: -2,
        customer_buyer_id: 1767,
        sku: {
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
          unit_per_oom: 10,
          increment_qty: 1,
          weight: 10,
          price: 8,
          market_unit_price: 0,
          total_price: 80,
          total_market_price: 0,
          tax_rate: 0,
          image: null,
          country_of_origin: 'Europe',
          b2c: true,
          b2c_uom_id: 4,
          b2c_unit_per_oom: 1,
          b2c_increment_qty: 1,
          b2c_unit_price: 18.5,
          b2c_market_unit_price: 22.43,
          b2c_total_price: 0,
          b2c_total_market_price: 250,
          b2c_pooling_qty: 5,
          b2c_packaging: '(2 KG)',
          b2c_weight: 2,
          b2c_oom_id: 4,
          is_b2c_pooling: true,
          description: 'Weight indicated is gross weight',
          is_slack_notifiable: false,
          active: true,
          created_at: '2020-03-01T06:00:00.000Z',
          updated_at: '2021-05-05T14:59:55.000Z',
          product: {
            id: 4,
            tenant_id: 1,
            name: 'Batang Steak 吧当鱼',
            image: 'fff36658-b5ca-4814-a726-3b4d65f070ca',
            category_id: 7,
            voucherify_id: null,
            active: true,
            created_at: '2020-03-01T06:00:00.000Z',
            updated_at: '2020-09-17T12:25:51.000Z',
            tenant: {
              id: 1,
              registration_number: 'R-45678',
              tax_registration_number: 'T-0123',
              tax_rate: 7,
              building_name: null,
              street_name: null,
              unit_number: null,
              email: 'orders@thetreedots.com',
              first_name: 'Jiacai',
              last_name: 'Lau',
              logo: 'treedots',
              email_notification: 1,
              class_id: 2,
              default_credit_card_term: 0,
              customer: [
                {
                  id: 2222,
                  name: 'Treedots',
                  alias_name: 'TREEDOT',
                  account_number: null,
                  group_id: null,
                  customer_type_id: 3,
                  collection_type_id: null,
                  profile: 'Wholesale',
                  halal_products: false,
                  beef_products: false,
                  cod: false,
                  credit_term: 0,
                  payment_type: 1,
                  delivery_instruction: null,
                  delivery_charge: 0,
                  minimum_order: 290,
                  hub: false,
                  active: true,
                  xero_id: null,
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
              ]
            }
          }
        },
        hub: {
          id: 1767,
          name: 'Sol Acres B2C',
          alias_name: 'Sol Acres',
          account_number: 'B1434',
          group_id: null,
          customer_type_id: 2,
          collection_type_id: null,
          profile: 'Other',
          halal_products: false,
          beef_products: false,
          cod: false,
          credit_term: 7,
          payment_type: 0,
          delivery_instruction: null,
          delivery_charge: 0,
          minimum_order: 200,
          hub: true,
          active: true,
          xero_id: '8c481f54-baaf-4aa6-8e53-ec7584056af2',
          voucherify_id: null,
          direction: null,
          hub_delivery_fee: null,
          hub_can_delivery: false,
          whatsapp_link: 'https://t.me/joinchat/FQIXvROKoxWYyW9zzkEW-A',
          storecove_id: null,
          peppol_id: null,
          tenant_id: 1,
          peppol_scheme_id: null
        }
      }
    ],
    order_status: {
      id: -2,
      name: 'Processing in Hub',
      description: 'B2B Order Processing',
      active: true
    },
    user: {
      id: 2208,
      email: 'demo_b2c@gmail.com',
      password: '747b7a79787f7e7d',
      passwordV3: '$2a$10$7XCZt0mivTkCGJUFqeld6.ty/7LnHJWBSAvrf5VeN6OjQ9mftMTAu',
      username: 'demo_b2c',
      mobile: 678678678,
      first_name: 'Demo',
      last_name: 'B2c',
      gender: 'f',
      birth_date: '2019-12-10T00:00:00.000Z',
      country_id: 193,
      address: 'dummy address',
      image: 'b018b691-62a9-4c8c-9f78-2150465a1ff1',
      user_type_id: 6,
      buyer_type: 2,
      stripe_customer_id: 'cus_JW9sHJdRGsE1ff',
      stripe_card_id: 'card_1ItVlLHzlMR8SHJISkmERjHF',
      active: true,
      date_created: null
    }
  }
] as unknown) as PreOrder[];

async function getB2cOrder(
  deliveryDate: string,
  hubIdList: [number],
  tenantIdList: [number],
  status: string,
  orderId: number
) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getB2COrders(deliveryDate:"${deliveryDate}",hubIdList:${hubIdList}, tenantIdList:${tenantIdList}, status:"${status}", orderId:${orderId}) {
          order_id
          status_id
          status
          delivery_date
          delivery_time
          order_date
          info
          user_id
          customer_buyer_id
          customer
          alias_name
          items
          prices
          taxes
          description
          standalone
          po_number
          active
          tenant_id
          tenant_name
          hub
          user_name
          mobile
          delivery_method
          delivery_fee
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', () => {
  it('customer can see all order filtering by tenantIdList', async () => {
    const dummyData = dummyPreOrder.filter((x) => x.pre_order_item[0].sku.product.tenant_id === 1);
    ctx.prisma.preOrder.findMany.mockResolvedValueOnce(dummyData);

    const result = await getB2cOrder(null, null, [1], null, null);
    expect(result).toMatchObject({
      getB2COrders: [
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        },
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        }
      ]
    });
  });
  it('customer can see all order filtering by tenantIdList and hubIdList', async () => {
    const dummyData = dummyPreOrder.filter(
      (x) => x.pre_order_item[0].sku.product.tenant_id === 1 && x.pre_order_item[0].customer_buyer_id === 2008
    );
    ctx.prisma.preOrder.findMany.mockResolvedValueOnce(dummyData);

    const result = await getB2cOrder(null, [2008], [1], null, null);
    expect(result).toMatchObject({
      getB2COrders: [
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        }
      ]
    });
  });
  it('customer can see all order filtering by orderId', async () => {
    const dummyData = dummyPreOrder.filter((x) => x.id === 47562);
    ctx.prisma.preOrder.findMany.mockResolvedValueOnce(dummyData);

    const result = await getB2cOrder(null, null, [1], null, 47562);
    expect(result).toMatchObject({
      getB2COrders: [
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        }
      ]
    });
  });
  it('customer can see all order filtering by deliveryDate', async () => {
    const dummyData = dummyPreOrder.filter(
      (x) => x.delivery_date.toISOString() == '2021-05-22T00:00:00.000Z'
    );
    await ctx.prisma.preOrder.findMany.mockResolvedValueOnce(dummyData);

    const result = await getB2cOrder('2021-05-22T00:00:00.000Z', null, [1], null, null);
    expect(result).toMatchObject({
      getB2COrders: [
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        }
      ]
    });
  });
  it('customer can see all order filtering by status', async () => {
    const dummyData = dummyPreOrder.filter((x) => x.order_status.name == 'Processing in Hub');
    ctx.prisma.preOrder.findMany.mockResolvedValueOnce(dummyData);

    const result = await getB2cOrder(null, null, [1], 'Processing in Hub', null);
    expect(result).toMatchObject({
      getB2COrders: [
        {
          active: expect.any(Number),
          alias_name: expect.any(String),
          customer: expect.any(String),
          customer_buyer_id: expect.any(Number),
          delivery_date: expect.any(String),
          delivery_fee: expect.any(Number),
          delivery_method: expect.any(String),
          delivery_time: null,
          description: expect.any(String),
          hub: expect.any(Number),
          info: expect.any(String),
          items: expect.any(Number),
          mobile: expect.any(String),
          order_date: expect.any(String),
          order_id: expect.any(Number),
          po_number: expect.any(String),
          prices: expect.any(Number),
          standalone: expect.any(Number),
          status: expect.any(String),
          status_id: expect.any(Number),
          taxes: expect.any(Number),
          tenant_id: expect.any(Number),
          tenant_name: expect.any(String),
          user_id: expect.any(Number),
          user_name: expect.any(String)
        }
      ]
    });
  });
});
