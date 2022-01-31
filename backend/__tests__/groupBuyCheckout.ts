// import { Cart, HubSpreeData, Inventory, Pool, PreOrder, PreOrderItem } from '@treedots/prisma';
// import { createTestContext } from './__helper';
// import { setPreOrderData } from '../src/types/resolvers/mutations/groupBuyCheckout/helper';

/**
 * Background:
 * This unit test script is used to test scenarios for GroupBuy Checkout (B2C) mutation.
 * But, because of there is a complicated issue related to GraphQL Nexus, Prisma, and Nexus's plugin:
 * Nexus Plugin Prisma(https://github.com/graphql-nexus/nexus-plugin-prisma/).
 * The issue is our GroupBuyCheckout mutation using a GroupBy feature which is
 * a preview feature in Prisma 2.18. And currently our Prisma is updated to 2.19,
 * there is a bug where Prisma already release the feature (declared it outside preview in 2.19),
 * but the prisma's client will declare it as an error when they run throught the GroupBy feature
 * when it's not regisgtered as a preview feature in schema.prisma. And because of this also make the
 * unit test will throw error. This issue actually solved and fixed in Prisma 2.20.1,
 * but because Nexus Plugin Prisma still can't support Prisma 2.20.1 and they are still revamping their
 * plugin and will not update the plugin soon. We don't have any choice except to skip the
 * unit test temporary when we are running.
 * (https://github.com/graphql-nexus/nexus-plugin-prisma/issues/1039#issuecomment-768979934)
 * TODO:
 * [] Waiting for the Nexus Plugin is updated
 * [] Update the unit test once the Nexus Plugin is updated
 * Note:
 * Commented all the code to make sure this code not executed when the unit test run. Need to uncomment later.
 */
describe('ensure that', () => {
  it.todo('can order non-pooling item(s)');
  it.todo('can order pooling item(s)');
  it.todo('can order non-pooling item(s) and pooling item(s)');
});

/*
const userInfo = {
  userId: 2208,
  userTypeId: 6,
  buyerType: 2,
  country: {
    id: 193,
    name: 'Singapore',
    description: '',
    currency_code: 'SGD',
    currency_symbol: 'S$',
    active: true
  }
};
const spreeData = [
  {
    "id": 77,
    "advocate_id": 2,
    "hub_id": 1807,
    "tenant_id": 1,
    "delivery_date": new Date("2021-04-10"),
    "start_date": new Date("2021-03-16 20:20:20"),
    "end_date": new Date("2021-04-06 20:20:20"),
    "Status": 0,
    "active": true
  }
] as HubSpreeData[]
const poolingItem = {
  "user_id": 2094,
  "customer_id": 1807,
  "items": [
    {
      "id": "67ad469e-6350-4807-9b85-856832dfb77b",
      "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
      "sku_id": 1025,
      "price": "120.33",
      "order_quantity": 14,
      "order_weight": "11",
      "created_at": "2021-03-28T20:18:22.000Z",
      "updated_at": "2021-03-28T20:18:22.000Z",
      "sku": {
        "id": 1025,
        "b2c_unit_price": "10",
        "tax_rate": "5",
        "is_b2c_pooling": true,
        "b2c_pooling_qty": 5,
        "product": {
          "tenant": {
            "id": 1,
            "registration_number": "R-45678",
            "tax_registration_number": "T-0123",
            "tax_rate": "0",
            "building_name": null,
            "street_name": null,
            "unit_number": null,
            "email": "orders@thetreedots.com",
            "first_name": "Jiacai",
            "last_name": "Lau",
            "email_notification": 1,
            "class_id": 2,
            "default_credit_card_term": 0
          }
        }
      }
    }
  ]
} as unknown as Cart
const nonPoolingItem = {
  "user_id": 2094,
  "customer_id": 1807,
  "items":[
    {
      "id": "cdbcd112-b38d-4ed9-b7f4-a7eace55f110",
      "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
      "sku_id": 1026,
      "price": "12",
      "order_quantity": 1000,
      "order_weight": "1300",
      "created_at": "2021-04-01T17:25:49.000Z",
      "updated_at": "2021-04-01T17:25:49.000Z",
      "sku": {
        "id": 1026,
        "b2c_unit_price": "12.1234",
        "tax_rate": "0",
        "is_b2c_pooling": false,
        "b2c_pooling_qty": 0,
        "product": {
          "tenant": {
            "id": 1,
            "registration_number": "R-45678",
            "tax_registration_number": "T-0123",
            "tax_rate": "0",
            "building_name": null,
            "street_name": null,
            "unit_number": null,
            "email": "orders@thetreedots.com",
            "first_name": "Jiacai",
            "last_name": "Lau",
            "email_notification": 1,
            "class_id": 2,
            "default_credit_card_term": 0
          }
        }
      }
    }
  ]
} as unknown as Cart
const poolingAndNonPoolingItems = {
  "user_id": 2094,
  "customer_id": 1807,
  "items": [
    {
      "id": "67ad469e-6350-4807-9b85-856832dfb77b",
      "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
      "sku_id": 1025,
      "price": "120.33",
      "order_quantity": 14,
      "order_weight": "11",
      "created_at": "2021-03-28T20:18:22.000Z",
      "updated_at": "2021-03-28T20:18:22.000Z",
      "sku": {
        "id": 1025,
        "b2c_unit_price": "10",
        "tax_rate": "5",
        "is_b2c_pooling": true,
        "b2c_pooling_qty": 5,
        "product": {
          "tenant": {
            "id": 1,
            "registration_number": "R-45678",
            "tax_registration_number": "T-0123",
            "tax_rate": "0",
            "building_name": null,
            "street_name": null,
            "unit_number": null,
            "email": "orders@thetreedots.com",
            "first_name": "Jiacai",
            "last_name": "Lau",
            "email_notification": 1,
            "class_id": 2,
            "default_credit_card_term": 0
          }
        }
      }
    },
    {
      "id": "cdbcd112-b38d-4ed9-b7f4-a7eace55f110",
      "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
      "sku_id": 1026,
      "price": "12",
      "order_quantity": 1000,
      "order_weight": "1300",
      "created_at": "2021-04-01T17:25:49.000Z",
      "updated_at": "2021-04-01T17:25:49.000Z",
      "sku": {
        "id": 1026,
        "b2c_unit_price": "12.1234",
        "tax_rate": "0",
        "is_b2c_pooling": false,
        "b2c_pooling_qty": 0,
        "product": {
          "tenant": {
            "id": 1,
            "registration_number": "R-45678",
            "tax_registration_number": "T-0123",
            "tax_rate": "0",
            "building_name": null,
            "street_name": null,
            "unit_number": null,
            "email": "orders@thetreedots.com",
            "first_name": "Jiacai",
            "last_name": "Lau",
            "email_notification": 1,
            "class_id": 2,
            "default_credit_card_term": 0
          }
        }
      }
    }
  ]
} as unknown as Cart
const inventories = [
  {
    "id": 1007,
    "customer_id": 7,
    "sku_id": 2426,
    "product_type_id": 2,
    "expired_at": null,
    "unit_price": "0",
    "unit_amount": "1",
    "price": "0",
    "quantity": 999,
    "logistic_type": null,
    "rank": 0,
    "default_sku": false,
    "par_level": "0",
    "min_qty": "0",
    "description": null,
    "active": true,
    "created_at": new Date("2020-04-19T22:05:01.000Z"),
    "updated_at": new Date("2020-04-19T22:05:01.000Z")
  },
  {
    "id": 1025,
    "customer_id": 7,
    "sku_id": 2444,
    "product_type_id": 2,
    "expired_at": null,
    "unit_price": "0",
    "unit_amount": "2",
    "price": "0",
    "quantity": 999,
    "logistic_type": null,
    "rank": 0,
    "default_sku": false,
    "par_level": "0",
    "min_qty": "0",
    "description": null,
    "active": true,
    "created_at": new Date("2020-04-19T22:05:01.000Z"),
    "updated_at": new Date("2020-04-19T22:05:01.000Z")
  },
  {
    "id": 1026,
    "customer_id": 7,
    "sku_id": 2445,
    "product_type_id": 2,
    "expired_at": null,
    "unit_price": "0",
    "unit_amount": "2",
    "price": "0",
    "quantity": 999,
    "logistic_type": null,
    "rank": 0,
    "default_sku": false,
    "par_level": "0",
    "min_qty": "0",
    "description": null,
    "active": true,
    "created_at": new Date("2020-04-19T22:05:01.000Z"),
    "updated_at": new Date("2020-04-19T22:05:01.000Z")
  }
] as unknown as Inventory[]
const preOrderReturn = {
  "id": 15,
  "order_status_id": -2,
  "po_number": "-",
  "standalone": null,
  "delivery_date": new Date("2021-04-10T00:00:00.000Z"),
  "delivery_time": null,
  "stripe_transaction_id": null,
  "charge_date": new Date("2021-04-16T00:00:00.000Z"),
  "close_date": new Date("2021-04-06T00:00:00.000Z"),
  "payment_date": null,
  "payment_status_id": null,
  "created_at": new Date("2021-04-09T16:28:06.000Z"),
  "updated_at": new Date("2021-04-09T09:28:06.000Z"),
  "last_user_id": 2094,
  "description": "",
  "active": true,
  "token": null
} as PreOrder
const preOrderItems = [
  {
    "id": 1,
    "order_id": 1,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-07T17:52:49.000Z",
    "updated_at": "2021-04-07T10:52:49.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 1,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdZ0AHzlMR8SHJINMeh70LM",
      "charge_date": "2021-04-14T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": null,
      "payment_status_id": 3,
      "created_at": "2021-04-07T17:52:49.000Z",
      "updated_at": "2021-04-07T17:52:51.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 4,
    "order_id": 2,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-07T17:52:54.000Z",
    "updated_at": "2021-04-07T10:52:54.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 2,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdZ0FHzlMR8SHJIYkoy9xaw",
      "charge_date": "2021-04-14T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": null,
      "payment_status_id": 3,
      "created_at": "2021-04-07T17:52:54.000Z",
      "updated_at": "2021-04-07T17:52:56.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 7,
    "order_id": 3,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T10:35:06.000Z",
    "updated_at": "2021-04-08T03:35:06.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 3,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1Idoe7HzlMR8SHJIkHroz2nR",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T10:35:06.000Z",
      "updated_at": "2021-04-08T10:35:08.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 10,
    "order_id": 4,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T10:35:32.000Z",
    "updated_at": "2021-04-08T03:35:32.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 4,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdoeXHzlMR8SHJI3ZU8L7nv",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T10:35:32.000Z",
      "updated_at": "2021-04-08T10:35:34.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 13,
    "order_id": 5,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T12:26:39.000Z",
    "updated_at": "2021-04-08T05:26:39.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 5,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdqO4HzlMR8SHJIi3lKHmjG",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T12:26:39.000Z",
      "updated_at": "2021-04-08T12:26:41.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 16,
    "order_id": 6,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T12:28:24.000Z",
    "updated_at": "2021-04-08T05:28:24.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 6,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdqPmHzlMR8SHJIK6WAadtk",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T12:28:24.000Z",
      "updated_at": "2021-04-08T12:28:27.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 19,
    "order_id": 7,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T12:28:57.000Z",
    "updated_at": "2021-04-08T05:28:57.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 7,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdqQIHzlMR8SHJISjISa4Zm",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T12:28:57.000Z",
      "updated_at": "2021-04-08T12:28:59.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 22,
    "order_id": 8,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T14:40:15.000Z",
    "updated_at": "2021-04-08T07:40:15.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 8,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": "pi_1IdsTNHzlMR8SHJITmdfwzCr",
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": "2021-04-08T00:00:00.000Z",
      "payment_status_id": 3,
      "created_at": "2021-04-08T14:40:15.000Z",
      "updated_at": "2021-04-08T14:40:18.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  },
  {
    "id": 25,
    "order_id": 9,
    "sku_id": 1025,
    "product_type_id": 2,
    "user_id": 2094,
    "driver_collect_user_id": null,
    "driver_delivery_user_id": null,
    "customer_seller_id": 7,
    "customer_buyer_id": 1807,
    "group_id": null,
    "invoice_id": null,
    "amount_qty": 2,
    "total_qty": 14,
    "origin_unit_price": "10",
    "sale_unit_price": "10",
    "total_price": "140",
    "tax": "0.05",
    "discount": "0",
    "original_sale_unit_price": "10",
    "original_total_price": "140",
    "original_tax": "0.05",
    "sku_deal_id": null,
    "cod": null,
    "created_at": "2021-04-08T14:48:28.000Z",
    "updated_at": "2021-04-08T07:48:28.000Z",
    "last_user_id": 2094,
    "description": null,
    "active": true,
    "order_item_status_id": -2,
    "status_note": null,
    "pre_order": {
      "id": 9,
      "order_status_id": -2,
      "po_number": "-",
      "standalone": null,
      "delivery_date": "2021-04-10T00:00:00.000Z",
      "delivery_time": null,
      "stripe_transaction_id": null,
      "charge_date": "2021-04-15T00:00:00.000Z",
      "close_date": "2021-04-06T00:00:00.000Z",
      "payment_date": null,
      "payment_status_id": null,
      "created_at": "2021-04-08T14:48:28.000Z",
      "updated_at": "2021-04-08T07:48:28.000Z",
      "last_user_id": 2094,
      "description": "",
      "active": true,
      "token": null
    }
  }
] as unknown as PreOrderItem[]
const preOrderItemsReturnNonPooling = {
  "id": 51,
  "order_id": 18,
  "sku_id": 1026,
  "product_type_id": 2,
  "user_id": 2094,
  "driver_collect_user_id": null,
  "driver_delivery_user_id": null,
  "customer_seller_id": 7,
  "customer_buyer_id": 1807,
  "group_id": null,
  "invoice_id": null,
  "amount_qty": 2,
  "total_qty": 1000,
  "origin_unit_price": "12.1234",
  "sale_unit_price": "12.1234",
  "total_price": "12123.4",
  "tax": "0",
  "discount": "0",
  "original_sale_unit_price": "12.1234",
  "original_total_price": "12123.4",
  "original_tax": "0",
  "sku_deal_id": null,
  "cod": null,
  "created_at": "2021-04-09T16:38:36.000Z",
  "updated_at": "2021-04-09T09:38:36.000Z",
  "last_user_id": 2094,
  "description": null,
  "active": true,
  "order_item_status_id": -2,
  "status_note": null
} as unknown as PreOrderItem
const preOrderItemGroupBy = [
  {
    "sku_id": 1007,
    "sum": {
      "total_price": "74",
      "tax": "0"
    }
  },
  {
    "sku_id": 1025,
    "sum": {
      "total_price": "140",
      "tax": "0.05"
    }
  },
  {
    "sku_id": 1026,
    "sum": {
      "total_price": "12123.4",
      "tax": "0"
    }
  }
] as unknown as PreOrderItem[]
const setPreOrderDataResponse = [
  {
    "id": 77,
    "advocate_id": 2,
    "hub_id": 1807,
    "tenant_id": 1,
    "delivery_date": "2021-04-10T00:00:00.000Z",
    "start_date": "2021-03-16T20:20:20.000Z",
    "end_date": "2021-04-06T20:20:20.000Z",
    "Status": 0,
    "active": true,
    "preOrders": [
      {
        "id": "67ad469e-6350-4807-9b85-856832dfb77b",
        "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
        "sku_id": 1025,
        "price": "120.33",
        "order_quantity": 14,
        "order_weight": "11",
        "created_at": "2021-03-28T20:18:22.000Z",
        "updated_at": "2021-03-28T20:18:22.000Z",
        "sku": {
          "id": 1025,
          "b2c_unit_price": "10",
          "tax_rate": "5",
          "is_b2c_pooling": true,
          "b2c_pooling_qty": 5,
          "product": {
            "tenant": {
              "id": 1,
              "registration_number": "R-45678",
              "tax_registration_number": "T-0123",
              "tax_rate": "0",
              "building_name": null,
              "street_name": null,
              "unit_number": null,
              "email": "orders@thetreedots.com",
              "first_name": "Jiacai",
              "last_name": "Lau",
              "email_notification": 1,
              "class_id": 2,
              "default_credit_card_term": 0
            }
          }
        },
        "inventory": {
          "id": 1025,
          "customer_id": 7,
          "sku_id": 2444,
          "product_type_id": 2,
          "expired_at": null,
          "unit_price": "0",
          "unit_amount": "2",
          "price": "0",
          "quantity": 999,
          "logistic_type": null,
          "rank": 0,
          "default_sku": false,
          "par_level": "0",
          "min_qty": "0",
          "description": null,
          "active": true,
          "created_at": "2020-04-19T22:05:01.000Z",
          "updated_at": "2020-04-19T22:05:01.000Z"
        },
        "user_id": 2094,
        "hub_id": 1807,
        "tenant_id": 1,
        "delivery_date": "2021-04-10T00:00:00.000Z",
        "order_status_id": -2,
        "order_item_status_id": -2,
        "total_price": 140,
        "total_tax": 0.05,
        "pre_order_item_id": 56,
        "total_qty": 14,
        "poolItemData": {
          "id": 86,
          "pool_id": 69,
          "qty": 1,
          "user_id": 2094,
          "pre_order_item_id": 56
        }
      },
      {
        "id": "cdbcd112-b38d-4ed9-b7f4-a7eace55f110",
        "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
        "sku_id": 1026,
        "price": "12",
        "order_quantity": 1000,
        "order_weight": "1300",
        "created_at": "2021-04-01T17:25:49.000Z",
        "updated_at": "2021-04-01T17:25:49.000Z",
        "sku": {
          "id": 1026,
          "b2c_unit_price": "12.1234",
          "tax_rate": "0",
          "is_b2c_pooling": false,
          "b2c_pooling_qty": 0,
          "product": {
            "tenant": {
              "id": 1,
              "registration_number": "R-45678",
              "tax_registration_number": "T-0123",
              "tax_rate": "0",
              "building_name": null,
              "street_name": null,
              "unit_number": null,
              "email": "orders@thetreedots.com",
              "first_name": "Jiacai",
              "last_name": "Lau",
              "email_notification": 1,
              "class_id": 2,
              "default_credit_card_term": 0
            }
          }
        },
        "inventory": {
          "id": 1026,
          "customer_id": 7,
          "sku_id": 2445,
          "product_type_id": 2,
          "expired_at": null,
          "unit_price": "0",
          "unit_amount": "2",
          "price": "0",
          "quantity": 999,
          "logistic_type": null,
          "rank": 0,
          "default_sku": false,
          "par_level": "0",
          "min_qty": "0",
          "description": null,
          "active": true,
          "created_at": "2020-04-19T22:05:01.000Z",
          "updated_at": "2020-04-19T22:05:01.000Z"
        },
        "user_id": 2094,
        "hub_id": 1807,
        "tenant_id": 1,
        "delivery_date": "2021-04-10T00:00:00.000Z",
        "order_status_id": -2,
        "order_item_status_id": -2,
        "total_price": 12123.4,
        "total_tax": 0,
        "pre_order_item_id": null,
        "total_qty": 1000
      },
      {
        "id": "cdbcd112-b38d-4ed9-b7f4-a7eace55f1b9",
        "cart_id": "4920b362-36a6-455f-b70f-77f30d2a35a0",
        "sku_id": 1007,
        "price": "11.2345",
        "order_quantity": 4,
        "order_weight": "10",
        "created_at": "2021-04-01T15:03:32.000Z",
        "updated_at": "2021-04-01T15:03:32.000Z",
        "sku": {
          "id": 1007,
          "b2c_unit_price": "18.5",
          "tax_rate": "0",
          "is_b2c_pooling": true,
          "b2c_pooling_qty": 5,
          "product": {
            "tenant": {
              "id": 1,
              "registration_number": "R-45678",
              "tax_registration_number": "T-0123",
              "tax_rate": "0",
              "building_name": null,
              "street_name": null,
              "unit_number": null,
              "email": "orders@thetreedots.com",
              "first_name": "Jiacai",
              "last_name": "Lau",
              "email_notification": 1,
              "class_id": 2,
              "default_credit_card_term": 0
            }
          }
        },
        "inventory": {
          "id": 1007,
          "customer_id": 7,
          "sku_id": 2426,
          "product_type_id": 2,
          "expired_at": null,
          "unit_price": "0",
          "unit_amount": "1",
          "price": "0",
          "quantity": 999,
          "logistic_type": null,
          "rank": 0,
          "default_sku": false,
          "par_level": "0",
          "min_qty": "0",
          "description": null,
          "active": true,
          "created_at": "2020-04-19T22:05:01.000Z",
          "updated_at": "2020-04-19T22:05:01.000Z"
        },
        "user_id": 2094,
        "hub_id": 1807,
        "tenant_id": 1,
        "delivery_date": "2021-04-10T00:00:00.000Z",
        "order_status_id": -2,
        "order_item_status_id": -2,
        "total_price": 74,
        "total_tax": 0,
        "pre_order_item_id": 58,
        "total_qty": 4,
        "poolItemData": {
          "id": 88,
          "pool_id": 70,
          "qty": 1,
          "user_id": 2094,
          "pre_order_item_id": 58
        }
      }
    ],
    "preOrderId": 20
  }
]
jest.mock('../src/types/resolvers/mutations/groupBuyCheckout/helper', () => ({
  setPreOrderData: jest.fn()
}))
const context = createTestContext(userInfo);
async function groupBuyCheckout(
  tenantId: number,
  hubId: number,
  userId: number,
  currency: String,
  stripe_customer_id: String,
  stripe_card_id: String
) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
    mutation groupBuyCheckout {
      groupBuyCheckout(
        tenantId: ${tenantId},
        hubId: ${hubId},
        userId: ${userId},
        currency:"${currency}",
        stripe_customer_id:"${stripe_customer_id}",
        stripe_card_id:"${stripe_card_id}"
      ){
        id
        advocate_id
        hub_id
        payment_status_id
        preOrderId
        Status
        active
      }
    }
  `);
  } catch (error) {
    return error.response || error;
  }
}
describe('ensure that', () => {
  it('can order non-pooling item(s)', async() => {
    const prismaX = context.prisma;
    prismaX.hubSpreeData.findMany.mockResolvedValueOnce(spreeData);
    prismaX.cart.findFirst.mockResolvedValueOnce(nonPoolingItem);
    prismaX.inventory.findMany.mockResolvedValueOnce(inventories);
    (setPreOrderData as jest.Mock).mockResolvedValueOnce(setPreOrderDataResponse);
    prismaX.preOrderItem.groupBy.mockResolvedValueOnce(preOrderItemGroupBy)
    // prismaX.preOrder.create.mockResolvedValueOnce(preOrderReturn)
    // prismaX.preOrderItem.findMany.mockResolvedValueOnce(preOrderItems)
    // prismaX.pool.findFirst.mockResolvedValueOnce(poolData)
    const result = await groupBuyCheckout(
      1,
      1807,
      2094,
      "SGD",
      "cus_INhVN8SM1JOHe2",
      "card_1IDlvgHzlMR8SHJI3lp24BoB"
    )
    expect(result).toMatchObject({
      "groupBuyCheckout": [
        {
          "id": expect.any(Number),
          "advocate_id": expect.any(Number),
          "hub_id": expect.any(Number),
          "payment_status_id": expect.any(String),
          "preOrderId": expect.any(Number),
          "Status": expect.any(Number),
          "active": expect.any(Boolean)
        }
      ]
    })
    // return true
  });
  it('can order pooling item(s)', async() => {
    return true
  });
  it('can order non-pooling item(s) and pooling item(s)', async() =>{
    return true
  })
})
*/
