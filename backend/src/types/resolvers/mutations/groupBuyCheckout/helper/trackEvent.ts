import dayjs from 'dayjs';
import { Context } from 'context';
import { getNewDate } from '../../../../utils/dateTime';
import { getCurrencySymbol } from '../../../../utils/currency';
import { getImageUrl } from '../../../../utils/image';
import helper from './index';

export const trackEvent = async (eventName: string, ctx: Context, data: any = []): Promise<boolean> => {
  const user = await ctx.prisma.user.findFirst({
    where: { id: data.userId },
    select: { first_name: true, last_name: true, email: true, mobile: true }
  });
  const symbol = getCurrencySymbol(data.currency);
  let eventData;
  if (eventName === 'Charged') eventData = await orderSuccessful(ctx, user, { ...data, symbol });
  else if (eventName === 'Click Checkout' || eventName === 'Order Submitted')
    eventData = await orderSubmitted(ctx, user, { ...data, symbol });
  if (eventData !== 'undefined') {
    await ctx.clevertap.uploadEvents([
      {
        identity: user.email,
        name: eventName,
        data: eventData
      }
    ]);
  }
  if (eventName === 'Charged') {
    const preOrderItems = await ctx.prisma.preOrderItem.findMany({
      where: { user_id: data.userId, order_item_status_id: { in: [-1, -2, 11] } },
      select: { order_id: true, total_price: true, tax: true }
    });
    const preOrderIds = [...new Set(preOrderItems.map((x: { order_id: number }) => x.order_id))];
    const totalSales = preOrderItems.reduce((a, b) => {
      return a + (Number(b.total_price) + Number(b.tax));
    }, 0);
    await ctx.clevertap.uploadProfiles([
      {
        identity: user.email,
        data: {
          Total_Number_Of_Purchases: preOrderIds.length,
          Total_Number_Of_Purchase_Items: preOrderItems.length,
          Total_Sales_LTV: Number(Number(totalSales).toFixed(2))
        }
      }
    ]);
  }
  return true;
};

const orderSuccessful = async (ctx, user, data: any): Promise<any> => {
  const { preOrderData, spreeData, totalAmountToCharge, symbol, currency, paymentB2cId } = data;
  const { hubName, hubAliasName, hubAddress } = await helper.getHubDetail(ctx, spreeData.hub_id);
  const preOrder = preOrderData.cartItems;

  const paymentData = await ctx.prisma.paymentB2c.findUnique({
    where: {
      id: paymentB2cId
    }
  });

  const items = [];
  const productItems = [];
  for (const item of preOrder) {
    const imageUrl = item.sku.image ? getImageUrl(item.sku.image) : getImageUrl(item.sku.product.image);
    const cust = await ctx.prisma.customer.findFirst({
      where: { customer_type_id: 3, tenant_id: item.tenant_id, active: true },
      select: { name: true }
    });
    items.push({
      'product name': item.sku.name,
      'product qty': item.order_quantity,
      'product selling price': `${item.sku.b2c_unit_price}`,
      'product market price': `${item.sku.b2c_market_unit_price}`,
      'product variation': `${item.sku.b2c_weight} ${item.sku.b2c_oom.name}`,
      'product subtotal': `${item.sku.b2c_unit_price * item.order_quantity + item.tax}`,
      'product supplier': cust?.name,
      'product image': imageUrl,
      'product sku id': item.sku.id,
      'groupbuy item': item.sku.is_b2c_pooling ? 'Pooling Item' : '',
      halal: item.sku.halal ? 'halal' : 'non-halal'
    });

    // ! deprecated per TREE-1015, because there is code logic flow revamp, Order Confirmation Status
    // productItems.push({
    //   product_sku_name: item.sku.name,
    //   product_qty: item.order_quantity,
    //   product_subtotal: Number(`${item.sku.b2c_unit_price * item.order_quantity + item.tax}`).toFixed(2),
    //   product_image: imageUrl
    // });
  }

  // sendgrid email nofitication
  // ! deprecated per TREE-1015, because there is code logic flow revamp, Order Confirmation Status
  // await sendEmail({
  //   to: user.email,
  //   dynamic_template_data: {
  //     name: `${user.first_name} ${user.last_name}`,
  //     order_id: paymentB2cId,
  //     estimated_collection_date: `${dayjs(spreeData.delivery_date).format('ddd, DD MMMM YYYY')}`,
  //     collection_point_name: `${hubAliasName ? hubAliasName : hubName}`,
  //     collection_point_address: hubAddress,
  //     currency_symbol: symbol,
  //     total_order_amount: Number(totalAmountToCharge).toFixed(2),
  //     voucher_discount_amount: Number(paymentData.discount_amount).toFixed(2),
  //     products: productItems
  //   },
  //   template_id: 'd-753caf9e092843cc819bafa611b4c652'
  // });

  return {
    from: 'order successful',
    'user name': `${user.first_name} ${user.last_name}`,
    'phone number': `${user.mobile}`,
    'order id': `${paymentB2cId}`,
    'order date': dayjs(preOrderData.start_date).format('DD MMMM YYYY'),
    'collection details': ``,
    'collection delivery date': `${dayjs(spreeData.delivery_date).format('DD MMMM YYYY')}`,
    'collection start date': `${dayjs(spreeData.start_date).format('DD MMMM YYYY')}`,
    'estimated collection date': `${dayjs(spreeData.end_date).format('DD MMMM YYYY')}`,
    'estimated delivery dates': `${dayjs(spreeData.start_date).format('DD MMMM YYYY')} or ${dayjs(
      spreeData.end_date
    ).format('DD MMMM YYYY')} (${dayjs(spreeData.start_date).format('h A')} - ${dayjs(
      spreeData.end_date
    ).format('h A')})`,
    'collection point name': `${hubAliasName ? hubAliasName : hubName}`,
    'collection point address': hubAddress,
    'voucher amount applied': Number(Number(paymentData.discount_amount).toFixed(2)),
    'voucher code': paymentData.voucher_code,
    'voucher discount type': paymentData.voucher_discount_type,
    'voucher discount': Number(Number(paymentData.voucher_discount).toFixed(2)),
    'voucher minimum amount': Number(Number(paymentData.voucher_minimum_amount).toFixed(2)),
    'payment method': 'Card',
    'payment date': dayjs(getNewDate()).format('DD MMMM YYYY'),
    'order total amount': Number(Number(totalAmountToCharge).toFixed(2)),
    'currency code': currency,
    'currency symbol': symbol,
    Items: items
  };
};

const orderSubmitted = async (ctx, user, data: any): Promise<any> => {
  const { items, spreeData, total_order, symbol, currency } = data;
  const { hubName, hubAliasName, hubAddress } = await helper.getHubDetail(ctx, spreeData.hub_id);

  const skuId = new Array<string>();
  const name = new Array<string>();
  const sellingPrice = new Array<string>();
  const marketPrice = new Array<string>();
  const qty = new Array<string>();
  const variation = new Array<string>();
  const subtotal = new Array<string>();
  const taxAmount = new Array<string>();
  const groupbuyItem = new Array<string>();
  const discountedItem = new Array<string>();
  const halal = new Array<string>();
  items.forEach(async (item) => {
    skuId.push(item.sku_id);
    name.push(item.sku.name);
    sellingPrice.push(`${item.sku.b2c_unit_price}`);
    marketPrice.push(`${item.sku.b2c_market_unit_price}`);
    qty.push(item.order_quantity);
    variation.push(`${item.sku.b2c_weight} ${item.sku.b2c_oom.name}`);
    subtotal.push(`${item.total_price}`);
    taxAmount.push(`${item.total_tax}`);
    groupbuyItem.push(item.sku.is_b2c_pooling ? 'Pooling Item' : 'Non Pooling Item');
    discountedItem.push(`-${item.discounted}%`);
    halal.push(item.sku.halal ? 'halal' : 'non-halal');
  });

  const supplier = new Array<string>();
  const volumeDealItem = new Array<string>();
  for (const item of items) {
    const customerTenant = await ctx.prisma.customerTenant.findFirst({
      where: { tenant_id: item.tenant_id },
      select: { customer_id: true }
    });
    const cust = await ctx.prisma.customer.findFirst({
      where: { customer_type_id: 3, id: customerTenant?.customer_id },
      select: { name: true }
    });
    supplier.push(cust?.name);
    const skuDeal = await ctx.prisma.skuDeal.findFirst({
      where: { sku_id: item.sku_id }
    });
    volumeDealItem.push(skuDeal ? 'yes' : 'no');
  }

  return {
    'user name': `${user.first_name} ${user.last_name}`,
    'product sku id': skuId.join(),
    'product name': name.join(),
    'product selling price': sellingPrice.join(),
    'product market price': marketPrice.join(),
    'product qty': qty.join(),
    'product variation': variation.join(),
    'product subtotal': subtotal.join(),
    'product supplier': supplier.join(),
    'voucher amount applied': '',
    'payment method': 'Card',
    'payment date': dayjs(getNewDate()).format('DD MMMM YYYY'),
    'order total amount': total_order,
    'tax amount': taxAmount.join(),
    'collection point name': `${hubAliasName ? hubAliasName : hubName}`,
    'collection point address': hubAddress,
    'groupbuy item': groupbuyItem.join(),
    'discounted item': discountedItem.join(),
    'top picks item': '',
    'volume deal item': volumeDealItem.join(),
    halal: halal.join(),
    'currency code': currency,
    'currency symbol': symbol
  };
};
