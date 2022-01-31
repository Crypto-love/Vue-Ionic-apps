import { HubSpreeData, PreOrderItem } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummyHubSpreeData = [
  {
    id: 12312278,
    advocate_id: 2,
    hub_id: 2246,
    tenant_id: 1,
    delivery_date: '2021-09-11T00:00:00.000Z',
    start_date: '1988-01-01T00:00:00.000Z',
    end_date: '2021-09-09T19:00:00.000Z',
    Status: 0,
    active: true,
    updated_at: '2021-09-01T11:54:07.000Z',
    hub: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: '0',
      minimum_order: '200',
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    },
    tenant: {
      id: 1,
      registration_number: 'R-45678',
      merchant_id: null,
      tookan_team_id: null,
      tax_registration_number: 'T-0123',
      tax_rate: '7',
      building_name: null,
      street_name: null,
      unit_number: null,
      email: 'orders@thetreedots.com',
      first_name: 'Jiacai',
      last_name: 'Lau',
      logo:
        'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
      lead_days: 2,
      commission_rate: '1.25',
      email_notification: 1,
      class_id: 2,
      default_credit_card_term: 0,
      customer: [
        {
          id: 2222,
          name: 'Treedots',
          alias_name: 'TREEDOT',
          account_number: null,
          password: null,
          is_private: null,
          group_id: null,
          customer_type_id: 3,
          collection_type_id: null,
          profile: 'Wholesale',
          halal_products: false,
          beef_products: false,
          cod: false,
          credit_term: 0,
          payment_type: 1,
          delivery_instruction: 'place in front of my house',
          delivery_charge: '0',
          minimum_order: '290',
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
  } as unknown
] as HubSpreeData[];
const dummyPreOrderItem = [
  {
    id: 76756,
    order_id: 47587,
    sku_id: 1705,
    product_type_id: 1,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 3,
    customer_buyer_id: 2246,
    group_id: null,
    invoice_id: null,
    amount_qty: '10',
    total_qty: 4,
    origin_unit_price: '11.03',
    sale_unit_price: '11.03',
    total_price: '44.12',
    tax: '3.0884',
    discount: '0',
    original_sale_unit_price: '11.03',
    original_total_price: '44.12',
    original_tax: '0.07',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-09-03T11:38:28.000Z',
    updated_at: '2021-09-03T04:38:28.000Z',
    last_user_id: 2,
    description: null,
    active: true,
    order_item_status_id: -2,
    status_note: null,
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
      unit_per_oom: '10',
      increment_qty: 1,
      weight: '10',
      price: '8.9',
      market_unit_price: '0',
      total_price: '89',
      total_market_price: '0',
      tax_rate: '0',
      image: null,
      specs: '{"Packaging":"(10 X 1KG)","Freshness":"Frozen","Prawn Quantity":"31/40","Prawn Type":"HOSO"}',
      country_of_origin: 'Indonesia',
      b2c: true,
      b2c_uom_id: 4,
      b2c_unit_per_oom: '1',
      b2c_increment_qty: 1,
      b2c_unit_price: '11.03',
      b2c_market_unit_price: '17.66',
      b2c_total_price: '0',
      b2c_total_market_price: '250',
      b2c_pooling_qty: 10,
      b2c_packaging: '(1 KG)',
      b2c_weight: '1',
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
          merchant_id: null,
          tookan_team_id: null,
          tax_registration_number: 'T-0123',
          tax_rate: '7',
          building_name: null,
          street_name: null,
          unit_number: null,
          email: 'orders@thetreedots.com',
          first_name: 'Jiacai',
          last_name: 'Lau',
          logo:
            'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
          lead_days: 2,
          commission_rate: '1.25',
          email_notification: 1,
          class_id: 2,
          default_credit_card_term: 0,
          customer: [
            {
              id: 2222,
              name: 'Treedots',
              alias_name: 'TREEDOT',
              account_number: null,
              password: null,
              is_private: null,
              group_id: null,
              customer_type_id: 3,
              collection_type_id: null,
              profile: 'Wholesale',
              halal_products: false,
              beef_products: false,
              cod: false,
              credit_term: 0,
              payment_type: 1,
              delivery_instruction: 'place in front of my house',
              delivery_charge: '0',
              minimum_order: '290',
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
    pool_item: [
      {
        id: 234,
        pool_id: 139,
        qty: 4,
        user_id: 2208,
        pre_order_item_id: 76756,
        pool: {
          id: 139,
          sku_id: 1705,
          pool_qty: 10,
          is_fullfilled: false,
          remaining_qty: 6,
          hub_id: 2246,
          spree_id: 12312278,
          close_date: '2021-09-09T19:00:00.000Z',
          close_date_updated_at: null,
          created_at: '2021-09-03T11:38:28.000Z',
          updated_at: '2021-09-03T11:38:28.000Z'
        }
      }
    ],
    hub: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: '0',
      minimum_order: '200',
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    },
    pre_order: {
      id: 47587,
      order_status_id: -2,
      payment_b2c_id: 39,
      po_number: '-',
      standalone: null,
      delivery_date: '2021-09-11T00:00:00.000Z',
      delivery_time: null,
      stripe_transaction_id: null,
      spree_id: 12312278,
      charge_date: '2021-09-10T00:00:00.000Z',
      close_date: '2021-09-09T00:00:00.000Z',
      payment_date: '2021-09-03T00:00:00.000Z',
      payment_status_id: 3,
      created_at: '2021-09-03T11:38:28.000Z',
      updated_at: '2021-09-03T11:38:30.000Z',
      last_user_id: 2208,
      b2b_order_id: null,
      description: '',
      active: true,
      token: null,
      voucher_discount_type: null,
      voucher_discount: null,
      total_charged: '47.2084',
      notification_status: false
    },
    user: {
      id: 2208,
      email: 'umar@thetreedots.com',
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
      stripe_customer_id: 'cus_IrhTffDIa8YNYo',
      stripe_card_id: 'card_1ItPqgHzlMR8SHJILXrE7Zv6',
      tookan_fleet_id: null,
      language: null,
      date_created: null,
      active: true
    }
  },
  {
    id: 76753,
    order_id: 47586,
    sku_id: 1053,
    product_type_id: 1,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 2246,
    group_id: null,
    invoice_id: null,
    amount_qty: '5',
    total_qty: 3,
    origin_unit_price: '10.09',
    sale_unit_price: '10.09',
    total_price: '30.27',
    tax: '2.1189',
    discount: '0',
    original_sale_unit_price: '10.09',
    original_total_price: '30.27',
    original_tax: '0.07',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-09-01T18:54:56.000Z',
    updated_at: '2021-09-01T11:54:56.000Z',
    last_user_id: 2,
    description: null,
    active: true,
    order_item_status_id: -1,
    status_note: null,
    sku: {
      id: 1053,
      product_id: 20,
      voucherify_sku_id: null,
      is_order_by_weight: false,
      name: 'Fresh Chicken Feet (5 KG)',
      vendor_code: null,
      is_sample: false,
      alias: 'ck feet',
      halal: true,
      perishable: false,
      oom_id: 1,
      uom_id: 1,
      unit_per_oom: '5',
      increment_qty: 1,
      weight: '5',
      price: '1.5',
      market_unit_price: '0',
      total_price: '7.5',
      total_market_price: '0',
      tax_rate: '0',
      image: null,
      specs: '{"Packaging":"(5 KG)","Freshness":"Fresh"}',
      country_of_origin: 'Malaysia',
      b2c: true,
      b2c_uom_id: 4,
      b2c_unit_per_oom: '1',
      b2c_increment_qty: 1,
      b2c_unit_price: '10.09',
      b2c_market_unit_price: '23.83',
      b2c_total_price: '0',
      b2c_total_market_price: '250',
      b2c_pooling_qty: 0,
      b2c_packaging: '(5 KG)',
      b2c_weight: '5',
      b2c_oom_id: 4,
      is_b2c_pooling: false,
      description:
        'Chickens come live from Malaysia and slaughtered in Singapore on the morning of collection, delivered straight from the slaughterhouses in our cold trucks',
      is_slack_notifiable: false,
      active: true,
      created_at: '2020-03-01T06:00:00.000Z',
      updated_at: '2021-05-05T14:59:55.000Z',
      product: {
        id: 20,
        tenant_id: 1,
        name: 'Chicken Feet 鸡脚',
        image: 'e0d3ec2a-dd78-406f-ab4b-ca40dd4d9486',
        category_id: 2,
        voucherify_id: null,
        active: true,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-17T12:25:51.000Z',
        tenant: {
          id: 1,
          registration_number: 'R-45678',
          merchant_id: null,
          tookan_team_id: null,
          tax_registration_number: 'T-0123',
          tax_rate: '7',
          building_name: null,
          street_name: null,
          unit_number: null,
          email: 'orders@thetreedots.com',
          first_name: 'Jiacai',
          last_name: 'Lau',
          logo:
            'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
          lead_days: 2,
          commission_rate: '1.25',
          email_notification: 1,
          class_id: 2,
          default_credit_card_term: 0,
          customer: [
            {
              id: 2222,
              name: 'Treedots',
              alias_name: 'TREEDOT',
              account_number: null,
              password: null,
              is_private: null,
              group_id: null,
              customer_type_id: 3,
              collection_type_id: null,
              profile: 'Wholesale',
              halal_products: false,
              beef_products: false,
              cod: false,
              credit_term: 0,
              payment_type: 1,
              delivery_instruction: 'place in \r\nfront of my house',
              delivery_charge: '0',
              minimum_order: '290',
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
    pool_item: [],
    hub: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: '0',
      minimum_order: '200',
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    },
    pre_order: {
      id: 47586,
      order_status_id: -1,
      payment_b2c_id: 38,
      po_number: '-',
      standalone: null,
      delivery_date: '2021-09-11T00:00:00.000Z',
      delivery_time: null,
      stripe_transaction_id: null,
      spree_id: 12312278,
      charge_date: '2021-09-08T00:00:00.000Z',
      close_date: '2021-09-09T00:00:00.000Z',
      payment_date: '2021-09-01T00:00:00.000Z',
      payment_status_id: 3,
      created_at: '2021-09-01T18:54:56.000Z',
      updated_at: '2021-09-01T18:54:57.000Z',
      last_user_id: 2208,
      b2b_order_id: null,
      description: 'local test',
      active: true,
      token: null,
      voucher_discount_type: null,
      voucher_discount: null,
      total_charged: '157.1937',
      notification_status: false
    },
    user: {
      id: 2208,
      email: 'umar@thetreedots.com',
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
      stripe_customer_id: 'cus_IrhTffDIa8YNYo',
      stripe_card_id: 'card_1ItPqgHzlMR8SHJILXrE7Zv6',
      tookan_fleet_id: null,
      language: null,
      date_created: null,
      active: true
    }
  },
  {
    id: 76754,
    order_id: 47586,
    sku_id: 1055,
    product_type_id: 1,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 2246,
    group_id: null,
    invoice_id: null,
    amount_qty: '5',
    total_qty: 4,
    origin_unit_price: '19.44',
    sale_unit_price: '19.44',
    total_price: '77.76',
    tax: '5.4432',
    discount: '0',
    original_sale_unit_price: '19.44',
    original_total_price: '77.76',
    original_tax: '0.07',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-09-01T18:54:56.000Z',
    updated_at: '2021-09-01T11:54:56.000Z',
    last_user_id: 2,
    description: null,
    active: true,
    order_item_status_id: -1,
    status_note: null,
    sku: {
      id: 1055,
      product_id: 36,
      voucherify_sku_id: null,
      is_order_by_weight: false,
      name: 'Fresh Chicken Wing 70g up (5 KG)',
      vendor_code: null,
      is_sample: false,
      alias: 'ck wing 70g up',
      halal: true,
      perishable: false,
      oom_id: 4,
      uom_id: 1,
      unit_per_oom: '5',
      increment_qty: 1,
      weight: '5',
      price: '2.8',
      market_unit_price: '0',
      total_price: '14',
      total_market_price: '0',
      tax_rate: '0',
      image: null,
      specs: '{"Packaging":"(5 KG)","Chicken Sizing":"70g UP","Freshness":"Fresh"}',
      country_of_origin: 'Malaysia',
      b2c: true,
      b2c_uom_id: 4,
      b2c_unit_per_oom: '1',
      b2c_increment_qty: 1,
      b2c_unit_price: '19.44',
      b2c_market_unit_price: '41.59',
      b2c_total_price: '0',
      b2c_total_market_price: '250',
      b2c_pooling_qty: 0,
      b2c_packaging: '(5 KG)',
      b2c_weight: '5',
      b2c_oom_id: 4,
      is_b2c_pooling: false,
      description:
        'Chickens come live from Malaysia and slaughtered in Singapore on the morning of collection, delivered \r\nstraight from the slaughterhouses in our cold trucks , 60/70g per wing',
      is_slack_notifiable: false,
      active: true,
      created_at: '2020-03-01T06:00:00.000Z',
      updated_at: '2021-05-05T14:59:55.000Z',
      product: {
        id: 36,
        tenant_id: 1,
        name: 'Chicken Wing 鸡翅',
        image: 'b4c1406c-1a96-49a0-a94f-debe698711e2',
        category_id: 2,
        voucherify_id: null,
        active: true,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-17T12:25:51.000Z',
        tenant: {
          id: 1,
          registration_number: 'R-45678',
          merchant_id: null,
          tookan_team_id: null,
          tax_registration_number: 'T-0123',
          tax_rate: '7',
          building_name: null,
          street_name: null,
          unit_number: null,
          email: 'orders@thetreedots.com',
          first_name: 'Jiacai',
          last_name: 'Lau',
          logo:
            'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
          lead_days: 2,
          commission_rate: '1.25',
          email_notification: 1,
          class_id: 2,
          default_credit_card_term: 0,
          customer: [
            {
              id: 2222,
              name: 'Treedots',
              alias_name: 'TREEDOT',
              account_number: null,
              password: null,
              is_private: null,
              group_id: null,
              customer_type_id: 3,
              collection_type_id: null,
              profile: 'Wholesale',
              halal_products: false,
              beef_products: false,
              cod: false,
              credit_term: 0,
              payment_type: 1,
              delivery_instruction: 'place in front of my house',
              delivery_charge: '0',
              minimum_order: '290',
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
    pool_item: [],
    hub: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: '0',
      minimum_order: '200',
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    },
    pre_order: {
      id: 47586,
      order_status_id: -1,
      payment_b2c_id: 38,
      po_number: '-',
      standalone: null,
      delivery_date: '2021-09-11T00:00:00.000Z',
      delivery_time: null,
      stripe_transaction_id: null,
      spree_id: 12312278,
      charge_date: '2021-09-08T00:00:00.000Z',
      close_date: '2021-09-09T00:00:00.000Z',
      payment_date: '2021-09-01T00:00:00.000Z',
      payment_status_id: 3,
      created_at: '2021-09-01T18:54:56.000Z',
      updated_at: '2021-09-01T18:54:57.000Z',
      last_user_id: 2208,
      b2b_order_id: null,
      description: 'local test',
      active: true,
      token: null,
      voucher_discount_type: null,
      voucher_discount: null,
      total_charged: '157.1937',
      notification_status: false
    },
    user: {
      id: 2208,
      email: 'umar@thetreedots.com',
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
      stripe_customer_id: 'cus_IrhTffDIa8YNYo',
      stripe_card_id: 'card_1ItPqgHzlMR8SHJILXrE7Zv6',
      tookan_fleet_id: null,
      language: null,
      date_created: null,
      active: true
    }
  },
  {
    id: 76755,
    order_id: 47586,
    sku_id: 1183,
    product_type_id: 1,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 2246,
    group_id: null,
    invoice_id: null,
    amount_qty: '5',
    total_qty: 2,
    origin_unit_price: '19.44',
    sale_unit_price: '19.44',
    total_price: '38.88',
    tax: '2.7216',
    discount: '0',
    original_sale_unit_price: '19.44',
    original_total_price: '38.88',
    original_tax: '0.07',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-09-01T18:54:56.000Z',
    updated_at: '2021-09-01T11:54:56.000Z',
    last_user_id: 2,
    description: null,
    active: true,
    order_item_status_id: -1,
    status_note: null,
    sku: {
      id: 1183,
      product_id: 115,
      voucherify_sku_id: null,
      is_order_by_weight: false,
      name: 'Fresh Chicken Breast Fillet Skinless (5 KG)',
      vendor_code: null,
      is_sample: false,
      alias: 'bl sl ck breast',
      halal: true,
      perishable: false,
      oom_id: 4,
      uom_id: 1,
      unit_per_oom: '5',
      increment_qty: 1,
      weight: '5',
      price: '2.8',
      market_unit_price: '0',
      total_price: '14',
      total_market_price: '0',
      tax_rate: '0',
      image: null,
      specs: '{"Packaging":"(5 KG)","Skin Type":"Skinless","Freshness":"Fresh"}',
      country_of_origin: 'Malaysia',
      b2c: true,
      b2c_uom_id: 4,
      b2c_unit_per_oom: '1',
      b2c_increment_qty: 1,
      b2c_unit_price: '19.44',
      b2c_market_unit_price: '50',
      b2c_total_price: '0',
      b2c_total_market_price: '250',
      b2c_pooling_qty: 0,
      b2c_packaging: '(5 KG)',
      b2c_weight: '5',
      b2c_oom_id: 4,
      is_b2c_pooling: false,
      description:
        'Chickens come live from Malaysia and slaughtered in \r\nSingapore on the morning of collection, delivered straight from the slaughterhouses in our cold trucks',
      is_slack_notifiable: false,
      active: true,
      created_at: '2020-03-01T06:00:00.000Z',
      updated_at: '2021-05-05T14:59:55.000Z',
      product: {
        id: 115,
        tenant_id: 1,
        name: 'Chicken Breast Fillet',
        image: '1da496c8-57c0-4e0a-a99d-48b113ce79d7',
        category_id: 2,
        voucherify_id: null,
        active: true,
        created_at: '2020-03-01T06:00:00.000Z',
        updated_at: '2020-09-17T12:25:51.000Z',
        tenant: {
          id: 1,
          registration_number: 'R-45678',
          merchant_id: null,
          tookan_team_id: null,
          tax_registration_number: 'T-0123',
          tax_rate: '7',
          building_name: null,
          street_name: null,
          unit_number: null,
          email: 'orders@thetreedots.com',
          first_name: 'Jiacai',
          last_name: 'Lau',
          logo:
            'https://treedots-core-test-public-cf912b1.s3.ap-southeast-1.amazonaws.com/supplier-logos/Treedots.png',
          lead_days: 2,
          commission_rate: '1.25',
          email_notification: 1,
          class_id: 2,
          default_credit_card_term: 0,
          customer: [
            {
              id: 2222,
              name: 'Treedots',
              alias_name: 'TREEDOT',
              account_number: null,
              password: null,
              is_private: null,
              group_id: null,
              customer_type_id: 3,
              collection_type_id: null,
              profile: 'Wholesale',
              halal_products: false,
              beef_products: false,
              cod: false,
              credit_term: 0,
              payment_type: 1,
              delivery_instruction: 'place in front \r\nof my house',
              delivery_charge: '0',
              minimum_order: '290',
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
    pool_item: [],
    hub: {
      id: 2246,
      name: '122 Simei Street 1 - Morier - B2C',
      alias_name: 'Simei',
      account_number: 'B1842',
      password: null,
      is_private: null,
      group_id: null,
      customer_type_id: 2,
      collection_type_id: null,
      profile: 'Other',
      halal_products: true,
      beef_products: false,
      cod: false,
      credit_term: 7,
      payment_type: 0,
      delivery_instruction: null,
      delivery_charge: '0',
      minimum_order: '200',
      hub: true,
      active: true,
      xero_id: '013f3616-e6a3-4a84-8ff8-c7780c72dc30',
      voucherify_id: null,
      direction: null,
      hub_delivery_fee: null,
      hub_can_delivery: false,
      whatsapp_link: 'https://chat.whatsapp.com/IIS0a2zhifW2DeXvQ1inf0',
      storecove_id: null,
      peppol_id: null,
      tenant_id: 1,
      peppol_scheme_id: null
    },
    pre_order: {
      id: 47586,
      order_status_id: -1,
      payment_b2c_id: 38,
      po_number: '-',
      standalone: null,
      delivery_date: '2021-09-11T00:00:00.000Z',
      delivery_time: null,
      stripe_transaction_id: null,
      spree_id: 12312278,
      charge_date: '2021-09-08T00:00:00.000Z',
      close_date: '2021-09-09T00:00:00.000Z',
      payment_date: '2021-09-01T00:00:00.000Z',
      payment_status_id: 3,
      created_at: '2021-09-01T18:54:56.000Z',
      updated_at: '2021-09-01T18:54:57.000Z',
      last_user_id: 2208,
      b2b_order_id: null,
      description: 'local test',
      active: true,
      token: null,
      voucher_discount_type: null,
      voucher_discount: null,
      total_charged: '157.1937',
      notification_status: false
    },
    user: {
      id: 2208,
      email: 'umar@thetreedots.com',
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
      stripe_customer_id: 'cus_IrhTffDIa8YNYo',
      stripe_card_id: 'card_1ItPqgHzlMR8SHJILXrE7Zv6',
      tookan_fleet_id: null,
      language: null,
      date_created: null,
      active: true
    }
  }
] as PreOrderItem[];

async function getCollectionPointStatus(tenantId, hubId, status, keyword) {
  try {
    const params = `tenantId:[${tenantId}]`;
    if (tenantId && hubId && status) {
      params.concat(`, hubId: [${hubId}], status: ${status}`);
    } else if (tenantId && hubId && !status) {
      params.concat(`, hubId: [${hubId}]`);
    } else if (tenantId && !hubId && status) {
      params.concat(`, status: ${status}`);
    } else if (tenantId && !hubId && keyword) {
      params.concat(`, keyword: ${keyword}`);
    }
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query{
        getCollectionPointStatus(${params}){
          CollectionPointStatusHeader {
            collection_point_name
            supplier
            total_buyer
            total_Purchase
            minimum_order
            completion
            delivery_date
            details {
              sku
              pooling
              quantity
              in_progress
              outstanding
              buyer_info {
                full_name
                mobile
                total_order
                total_price
                pooling_status
              }
            }
          }
          total_rows
          total_page   
        }
      }
      `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can see all collection point status data by tenant', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreeData);
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(dummyPreOrderItem);
    const result = await getCollectionPointStatus([1], null, null, null);
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: [
          {
            collection_point_name: expect.any(String),
            completion: expect.any(Number),
            details: expect.any(Array),
            minimum_order: expect.any(Number),
            supplier: expect.any(String),
            total_Purchase: expect.any(Number),
            total_buyer: expect.any(Number)
          }
        ],
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
  it('user cant see all collection point status data if tenant not available', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(
      dummyHubSpreeData.filter((x) => x.tenant_id === 2)
    );
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(
      dummyPreOrderItem.filter((x) => x.sku.product.tenant.id === 2)
    );
    const result = await getCollectionPointStatus([2], null, null, null);
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: expect.any(Array),
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
  it('user can see all collection point status data by tenant, hub, status', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(
      dummyHubSpreeData.filter((x) => x.tenant_id === 1 && x.hub_id === 2246 && x.Status === 0)
    );
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(
      dummyPreOrderItem.filter((x) => x.sku.product.tenant.id === 1 && x.customer_buyer_id === 2246)
    );
    const result = await getCollectionPointStatus([1], [2246], 0, null); //0 status open
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: [
          {
            collection_point_name: expect.any(String),
            completion: expect.any(Number),
            details: expect.any(Array),
            minimum_order: expect.any(Number),
            supplier: expect.any(String),
            total_Purchase: expect.any(Number),
            total_buyer: expect.any(Number)
          }
        ],
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
  it('user can see all collection point status data by tenant, hub', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(
      dummyHubSpreeData.filter((x) => x.tenant_id === 1 && x.hub_id === 2246)
    );
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(
      dummyPreOrderItem.filter((x) => x.sku.product.tenant.id === 1 && x.customer_buyer_id === 2246)
    );
    const result = await getCollectionPointStatus([1], [2246], null, null);
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: [
          {
            collection_point_name: expect.any(String),
            completion: expect.any(Number),
            details: expect.any(Array),
            minimum_order: expect.any(Number),
            supplier: expect.any(String),
            total_Purchase: expect.any(Number),
            total_buyer: expect.any(Number)
          }
        ],
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
  it('user can see all collection point status data by tenant, status', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(
      dummyHubSpreeData.filter((x) => x.tenant_id === 1 && x.Status === 0)
    );
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(
      dummyPreOrderItem.filter((x) => x.sku.product.tenant.id === 2)
    );
    const result = await getCollectionPointStatus([1], null, 0, null); //0 status open
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: [
          {
            collection_point_name: expect.any(String),
            completion: expect.any(Number),
            details: expect.any(Array),
            minimum_order: expect.any(Number),
            supplier: expect.any(String),
            total_Purchase: expect.any(Number),
            total_buyer: expect.any(Number)
          }
        ],
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
  it('user can filter collection point status data by search', async () => {
    ctx.prisma.hubSpreeData.findMany.mockResolvedValueOnce(
      dummyHubSpreeData.filter((x) => x.tenant_id === 1)
    );
    ctx.prisma.preOrderItem.findMany.mockResolvedValueOnce(
      dummyPreOrderItem.filter((x) => x.sku.product.tenant.id === 1)
    );
    const result = await getCollectionPointStatus([1], null, null, 'Simei');
    expect(result).toMatchObject({
      getCollectionPointStatus: {
        CollectionPointStatusHeader: [
          {
            collection_point_name: '122 Simei Street 1 - Morier - B2C',
            completion: expect.any(Number),
            details: expect.any(Array),
            minimum_order: expect.any(Number),
            supplier: expect.any(String),
            total_Purchase: expect.any(Number),
            total_buyer: expect.any(Number)
          }
        ],
        total_page: expect.any(Number),
        total_rows: expect.any(Number)
      }
    });
  });
});
