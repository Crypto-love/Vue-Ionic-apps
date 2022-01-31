import { PreOrderItem } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';
import stripeHelper from '../src/types/services/payment/stripe';

const context = createTestContext(dummyB2cUser);
const dummRequestData = {
  customerBuyerId: 1807,
  preOrderItemId: 13,
  newTotalQty: 5
};
const dummyPreOrderItem = ({
  id: 13,
  order_id: 7,
  sku_id: 1007,
  product_type_id: 2,
  user_id: 2208,
  driver_collect_user_id: null,
  driver_delivery_user_id: null,
  customer_seller_id: 7,
  customer_buyer_id: 1807,
  group_id: null,
  invoice_id: null,
  amount_qty: 1,
  total_qty: 13,
  origin_unit_price: '40.5432',
  sale_unit_price: '40.5432',
  total_price: '243.2592',
  tax: '0',
  discount: '0',
  original_sale_unit_price: '40.5432',
  original_total_price: '527.0616',
  original_tax: '0',
  sku_deal_id: null,
  cod: null,
  created_at: '2021-04-08T18:22:26.000Z',
  updated_at: '2021-05-03T12:18:24.000Z',
  last_user_id: 2208,
  description: null,
  active: true,
  order_item_status_id: -2,
  status_note: null,
  pre_order: {
    id: 7,
    order_status_id: -2,
    po_number: '-',
    standalone: null,
    delivery_date: '2021-05-03T00:00:00.000Z',
    delivery_time: null,
    stripe_transaction_id: 'pi_1IdvwMHzlMR8SHJINIdE5qfv',
    spree_id: null,
    charge_date: '2021-04-15T00:00:00.000Z',
    close_date: '2021-04-30T00:00:00.000Z',
    payment_date: null,
    payment_status_id: 3,
    created_at: '2021-04-08T18:22:26.000Z',
    updated_at: '2021-04-19T16:31:32.000Z',
    last_user_id: 2208,
    description: '',
    active: true,
    token: null,
    paymentB2c: {
      id: 1,
      stripe_transaction_id: '123'
    }
  },
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
    b2c_unit_price: '40.5432',
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
    updated_at: '2021-04-06T16:17:51.000Z',
    product: {
      tenant: {
        tax_rate: 7
      }
    }
  },
  user: dummyB2cUser
} as unknown) as PreOrderItem;
const dummyPreOrderItemNotFound = null;
const dummyPreOrderItemQtyNotSmaller = ({
  id: 13,
  order_id: 7,
  sku_id: 1007,
  product_type_id: 2,
  user_id: 2208,
  driver_collect_user_id: null,
  driver_delivery_user_id: null,
  customer_seller_id: 7,
  customer_buyer_id: 1807,
  group_id: null,
  invoice_id: null,
  amount_qty: 1,
  total_qty: 5,
  origin_unit_price: '40.5432',
  sale_unit_price: '40.5432',
  total_price: '243.2592',
  tax: '0',
  discount: '0',
  original_sale_unit_price: '40.5432',
  original_total_price: '527.0616',
  original_tax: '0',
  sku_deal_id: null,
  cod: null,
  created_at: '2021-04-08T18:22:26.000Z',
  updated_at: '2021-05-03T12:18:24.000Z',
  last_user_id: 2208,
  description: null,
  active: true,
  order_item_status_id: -2,
  status_note: null,
  pre_order: {
    id: 7,
    order_status_id: -2,
    po_number: '-',
    standalone: null,
    delivery_date: '2021-05-03T00:00:00.000Z',
    delivery_time: null,
    stripe_transaction_id: 'pi_1IdvwMHzlMR8SHJINIdE5qfv',
    spree_id: null,
    charge_date: '2021-04-15T00:00:00.000Z',
    close_date: '2021-04-30T00:00:00.000Z',
    payment_date: null,
    payment_status_id: 3,
    created_at: '2021-04-08T18:22:26.000Z',
    updated_at: '2021-04-19T16:31:32.000Z',
    last_user_id: 2208,
    description: '',
    active: true,
    token: null
  },
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
    b2c_unit_price: '40.5432',
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
    updated_at: '2021-04-06T16:17:51.000Z'
  },
  user: dummyB2cUser
} as unknown) as PreOrderItem;
const dummyExecuteTransaction = [
  {
    id: 13,
    order_id: 7,
    sku_id: 1007,
    product_type_id: 2,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 1807,
    group_id: null,
    invoice_id: null,
    amount_qty: 1,
    total_qty: 5,
    origin_unit_price: '40.5432',
    sale_unit_price: '40.5432',
    total_price: '202.716',
    tax: '0',
    discount: '0',
    original_sale_unit_price: '40.5432',
    original_total_price: '527.0616',
    original_tax: '0',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-04-08T18:22:26.000Z',
    updated_at: '2021-05-03T13:04:24.000Z',
    last_user_id: 2208,
    description: null,
    active: true,
    order_item_status_id: -2,
    status_note: null
  },
  {
    id: 36,
    order_id: 7,
    sku_id: 1007,
    product_type_id: 2,
    user_id: 2208,
    driver_collect_user_id: null,
    driver_delivery_user_id: null,
    customer_seller_id: 7,
    customer_buyer_id: 1807,
    group_id: null,
    invoice_id: null,
    amount_qty: 1,
    total_qty: 1,
    origin_unit_price: '40.5432',
    sale_unit_price: '40.5432',
    total_price: '40.5432',
    tax: '0',
    discount: '0',
    original_sale_unit_price: '40.5432',
    original_total_price: '527.0616',
    original_tax: '0',
    sku_deal_id: null,
    cod: null,
    created_at: '2021-05-03T06:04:25.000Z',
    updated_at: '2021-05-03T06:04:25.000Z',
    last_user_id: 1807,
    description: null,
    active: false,
    order_item_status_id: 13,
    status_note: 'Refund for Order Item #13 of Order #7'
  }
];
const dummyStripeResponse = {
  httpStatus: 200,
  id: 're_1ImutLHzlMR8SHJIXMbKqCpI',
  object: 'refund',
  amount: 4054,
  balance_transaction: 'txn_1ImutLHzlMR8SHJIc2h1w2WD',
  charge: 'ch_1IdvwMHzlMR8SHJIKNhhWwjY',
  created: 1620021867,
  currency: 'sgd',
  metadata: {},
  payment_intent: 'pi_1IdvwMHzlMR8SHJINIdE5qfv',
  reason: null,
  receipt_number: null,
  source_transfer_reversal: null,
  status: 'succeeded',
  transfer_reversal: null
};
const dummyResponseSuccess = {
  updatePreOrderItemB2CDashboard: [
    {
      id: 13,
      order_id: 7,
      sku_id: 1007,
      product_type_id: 2,
      user_id: 2208,
      driver_collect_user_id: null,
      driver_delivery_user_id: null,
      customer_buyer_id: 1807,
      customer_seller_id: 7,
      group_id: null,
      invoice_id: null,
      amount_qty: 1,
      total_qty: 5,
      origin_unit_price: 40.5432,
      sale_unit_price: 40.5432,
      total_price: 202.716,
      tax: 0,
      discount: 0,
      original_sale_unit_price: 40.5432,
      original_total_price: 527.0616,
      original_tax: 0,
      sku_deal_id: null,
      cod: null,
      created_at: '2021-04-08T18:22:26.000Z',
      updated_at: '2021-05-03T13:04:24.000Z',
      last_user_id: 2208,
      description: null,
      order_item_status_id: -2,
      status_note: null,
      active: true
    },
    {
      id: 36,
      order_id: 7,
      sku_id: 1007,
      product_type_id: 2,
      user_id: 2208,
      driver_collect_user_id: null,
      driver_delivery_user_id: null,
      customer_buyer_id: 1807,
      customer_seller_id: 7,
      group_id: null,
      invoice_id: null,
      amount_qty: 1,
      total_qty: 1,
      origin_unit_price: 40.5432,
      sale_unit_price: 40.5432,
      total_price: 40.5432,
      tax: 0,
      discount: 0,
      original_sale_unit_price: 40.5432,
      original_total_price: 527.0616,
      original_tax: 0,
      sku_deal_id: null,
      cod: null,
      created_at: '2021-05-03T06:04:25.000Z',
      updated_at: '2021-05-03T06:04:25.000Z',
      last_user_id: 1807,
      description: null,
      order_item_status_id: 13,
      status_note: 'Refund for Order Item #13 of Order #7',
      active: false
    }
  ]
};
const dummyResponseItemNotFound = {
  errors: [{ message: 'Item not found' }],
  data: { updatePreOrderItemB2CDashboard: null }
};
const dummyResponseItemQtyNotSmaller = {
  errors: [{ message: 'Only can update the order if the new requested qty is different and smaller' }],
  data: { updatePreOrderItemB2CDashboard: null }
};

async function updatePreOrderItemB2CDashboard(
  customerBuyerId: number,
  preOrderItemId: number,
  newTotalQty: number
) {
  try {
    const result = await context.client.setHeader('Authorization', context.token).request(
      `
        mutation {
          updatePreOrderItemB2CDashboard (customerBuyerId: ${customerBuyerId}, preOrderItemId: ${preOrderItemId}, newTotalQty: ${newTotalQty}) {
            id
            order_id
            sku_id
            product_type_id
            user_id
            driver_collect_user_id
            driver_delivery_user_id
            customer_buyer_id
            customer_seller_id
            group_id
            invoice_id
            amount_qty
            total_qty
            origin_unit_price
            sale_unit_price
            total_price
            tax
            discount
            original_sale_unit_price
            original_total_price
            original_tax
            sku_deal_id
            cod
            created_at
            updated_at
            last_user_id
            description
            order_item_status_id
            status_note
            active
          }
        }
      `
    );
    return result;
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('admin or staff can update qty of an order into smaller qty', async () => {
    context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItem);
    context.prisma.$transaction.mockResolvedValueOnce(dummyExecuteTransaction);
    stripeHelper.refundPaymentIntent = jest.fn().mockReturnValue(dummyStripeResponse);
    const result = await updatePreOrderItemB2CDashboard(
      dummRequestData.customerBuyerId,
      dummRequestData.preOrderItemId,
      dummRequestData.newTotalQty
    );
    expect(result).toMatchObject(dummyResponseSuccess);
  });
  it("admin or staff can' update qty of an order because item is not found", async () => {
    context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItemNotFound);
    const result = await updatePreOrderItemB2CDashboard(
      dummRequestData.customerBuyerId,
      dummRequestData.preOrderItemId,
      dummRequestData.newTotalQty
    );
    expect(result).toMatchObject(dummyResponseItemNotFound);
  });
  it("admin or staff can' update qty of an order because the qty isn't smaller", async () => {
    context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItemQtyNotSmaller);
    const result = await updatePreOrderItemB2CDashboard(
      dummRequestData.customerBuyerId,
      dummRequestData.preOrderItemId,
      dummRequestData.newTotalQty
    );
    expect(result).toMatchObject(dummyResponseItemQtyNotSmaller);
  });
});
