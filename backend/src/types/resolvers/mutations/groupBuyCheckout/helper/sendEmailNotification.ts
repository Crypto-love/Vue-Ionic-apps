import dayjs from 'dayjs';
import { Context } from 'context';
import { isMov } from './checkMOVData';
import { sendEmail } from '../../../../services';
import { getImageUrl } from '../../../../utils/image';
import { getCurrencySymbol } from '../../../../utils/currency';
import helper from './index';

export const sendEmailOrderDeliveryDateConfirmed = async (
  context: Context,
  data: any = []
): Promise<boolean> => {
  /*
   * NOTIFICATION: Order Delivery Date Confirmed
   */
  const { preOrderData, paymentB2c, spreeData, userId } = data;

  if (await isMov(spreeData, null, context)) {
    const user = await context.prisma.user.findUnique({
      where: { id: userId },
      include: { country: true }
    });
    const supplierName = await context.prisma.customer.findFirst({
      where: {
        tenant_id: preOrderData.tenant_id,
        customer_type_id: 3,
        active: true
      },
      select: { name: true, alias_name: true }
    });
    const { hubName, hubAliasName, hubAddress } = await helper.getHubDetail(context, spreeData.hub_id);
    const preOrdersData = preOrderData.preOrders ? preOrderData.preOrders : [];
    const orderItems = preOrdersData.map((preOrder) => ({
      imgUrl: getImageUrl(preOrder.sku.image ? preOrder.sku.image : null),
      itemName: preOrder.sku.name,
      price: preOrder.price,
      quantity: preOrder.order_quantity
    }));
    const currency = user.country.currency_code;
    const currencySymbol = getCurrencySymbol(currency);

    const templateData = {
      name: `${user.first_name} ${user.last_name}`,
      order_id: preOrderData.id,
      supplier_name: supplierName.name ? supplierName.name : supplierName.alias_name,
      payment_id: paymentB2c.id,
      collection_point_date: `${dayjs(spreeData.delivery_date).format('ddd, DD MMMM YYYY')}`,
      collection_point_name: `${hubAliasName ? hubAliasName : hubName}`,
      collection_point_address: hubAddress,
      currency_symbol: currencySymbol,
      total_order_amount: '',
      orderItems: orderItems
    };
    await sendEmail({
      to: user.email,
      dynamic_template_data: templateData,
      template_id: 'd-182defdc426f4ac4a625896267c54dbe'
    });
    const notificationTemplate = {
      sender_user_id: 2,
      target_user_id: userId,
      topic: `${userId}-${process.env.NODE_ENV}`,
      title: `📦 Order Collection Date is confirmed!`,
      message: `Your order ${templateData.order_id} is ready for collection on ${templateData.collection_point_date} at Collection Point: ${templateData.collection_point_name}, ${templateData.collection_point_address}. You will receive updates on what time to pick up your items from your collection point rep on the day of collection. Chat with your collection point rep via our app if you have any questions regarding order collection! 💬`
    };
    await sendNotification(context.firebase, notificationTemplate);
  }

  return true;
};

export const sendEmailOrderConfirmation = async (
  context: Context,
  data: {
    preOrderList: Array<any>;
    totalAmountToCharge: number;
    paymentB2c: Record<string, unknown>;
    userId: number;
  }
): Promise<boolean> => {
  /*
   * NOTIFICATION: Order Confirmation Status
   */
  const user = await context.prisma.user.findUnique({
    where: { id: data.userId },
    include: { country: true }
  });
  const currency = user.country.currency_code;
  const currencySymbol = getCurrencySymbol(currency);
  const { preOrderList, paymentB2c, totalAmountToCharge } = data;
  const paymentB2CId = Number(paymentB2c['id']);
  const paymentData = await context.prisma.paymentB2c.findUnique({
    where: {
      id: paymentB2CId
    }
  });
  const getHubId = (): number => {
    let hubId;
    for (const list of preOrderList) {
      if (list?.spreeData?.hub_id) {
        hubId = list.spreeData.hub_id;
        break;
      }
    }
    return Number(hubId);
  };
  const hubId = await getHubId();
  const orderList = await Promise.all(
    preOrderList.map(async (list) => ({
      supplier_name: await supplierName(context, list.spreeData.tenant_id),
      package_no: list.id,
      collection_point_date: `${dayjs(list.delivery_date).format('ddd, DD MMMM YYYY')}`,
      items: orderItems(list.cartItems)
    }))
  );
  const { hubName, hubAliasName, hubAddress } = await helper.getHubDetail(context, hubId);
  const emailTemplate = {
    name: `${user.first_name} ${user.last_name}`,
    payment_id: paymentB2c['id'],
    total_order_amount: Number(totalAmountToCharge).toFixed(2),
    currency_symbol: currencySymbol,
    currency: currency,
    voucher_discount_amount:
      Number(paymentData.discount_amount) > 0 ? Number(paymentData.discount_amount).toFixed(2) : null,
    collection_point_name: `${hubAliasName ? hubAliasName : hubName}`,
    collection_point_address: hubAddress,
    items: orderList
  };
  await sendEmail({
    to: user.email,
    dynamic_template_data: emailTemplate,
    template_id: 'd-0ad092cb94064ebd8e5117cf55c7cc92'
  });
  const notificationTemplate = {
    sender_user_id: 2,
    target_user_id: data.userId,
    topic: `${data.userId}-${process.env.NODE_ENV}`,
    title: `👌Order Received!`,
    message: `Payment for your order ${paymentB2CId} is successful. You will receive updates on when to pick up your items when group buy orders achieve minimum value at your collection point. For enquiries, chat with your collection point rep via our app! 💬`,
    payload: JSON.stringify({ payment_b2c_id: paymentB2CId })
  };
  await sendNotification(context.firebase, notificationTemplate);
  return true;
};

export const sendEmailCompletedPool = async (
  context: Context,
  preOrderItemId: number,
  userId: number
): Promise<boolean> => {
  /*
   * NOTIFICATION: Order Item has been canceled
   */
  // find user into
  const user = await context.prisma.user.findUnique({
    where: { id: userId },
    include: { country: true }
  });

  // fetch all related preorder item
  const relatedPoolItems = await context.prisma.poolItems.findFirst({
    where: { pre_order_item_id: preOrderItemId },
    select: {
      pool: {
        select: {
          pool_item: {
            select: {
              pre_order_item_id: true
            }
          }
        }
      }
    }
  });

  // fetch all related item to send out the email
  for (let i = 0; i < relatedPoolItems.pool.pool_item.length; i++) {
    const item = relatedPoolItems.pool.pool_item[i];
    // find preorder item info
    const preOrderItem = await context.prisma.preOrderItem.findUnique({
      where: { id: item.pre_order_item_id },
      include: {
        pre_order: {
          include: {
            paymentB2c: true
          }
        },
        sku: {
          include: {
            product: true
          }
        }
      }
    });

    // find supplier
    const spree = await context.prisma.hubSpreeData.findUnique({
      where: { id: preOrderItem.pre_order.spree_id },
      select: { tenant_id: true }
    });

    // find tenant id
    const tenantId = spree ? spree.tenant_id : preOrderItem.sku.product.tenant_id;

    // get customer info base on hub sprees
    const customer = await context.prisma.customer.findFirst({
      where: {
        tenant_id: tenantId,
        customer_type_id: 3
      },
      select: {
        id: true,
        name: true
      }
    });

    // get customer info
    if (customer) {
      const templateParams = {
        name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
        item_name: preOrderItem.sku.name,
        order_no: preOrderItem.pre_order.paymentB2c
          ? preOrderItem.pre_order.paymentB2c.id
          : preOrderItem.pre_order.id,
        supplier_name: customer.name,
        package_no: preOrderItem.pre_order.id,
        currency_code: user.country.currency_symbol,
        item_price: preOrderItem.sale_unit_price,
        item_quantity: preOrderItem.total_qty,
        image_url: getImageUrl(
          preOrderItem.sku.image ? preOrderItem.sku.image : preOrderItem.sku.product.image
        )
      };

      await sendEmail({
        to: user.email,
        dynamic_template_data: templateParams,
        template_id: 'd-779ec61c46394accb029a4737d742347'
      });
      const notificationTemplate = {
        sender_user_id: 2,
        target_user_id: userId,
        topic: `${userId}-${process.env.NODE_ENV}`,
        title: `👏 Your Pooling item is successful!`,
        message: `Yay! Your group has successfully pooled ${templateParams.item_name} item together! You will receive updates on when to pick up your item once the collection date for your order is confirmed. Chat with your collection point rep if you have any questions regarding your order! 💬`
      };
      await sendNotification(context.firebase, notificationTemplate);
    }
  }

  return true;
};

const orderItems = (data) => {
  return data.map((item) => ({
    imgUrl: getImageUrl(item.sku.image ? item.sku.image : null),
    itemName: item.sku.name,
    price: item.price,
    quantity: item.order_quantity
  }));
};
const supplierName = async (context, tenantId) => {
  const data = await context.prisma.customer.findFirst({
    where: {
      tenant_id: tenantId,
      customer_type_id: 3,
      active: true
    },
    select: { name: true, alias_name: true }
  });
  return data.name ? data.name : data.alias_name;
};
const sendNotification = async (firebase, message) => {
  await firebase.sendNotification(message);
};
