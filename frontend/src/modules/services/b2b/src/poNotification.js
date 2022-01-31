import { Api, generatePurchaseOrder, getDateCode, getCustomString, Helper } from '../../share/index';
import { production, twilio_dev_number } from 'src/config';

const helper = new Helper();

/**
 *
 * @param {number | string} orderId
 * @returns {Promise<any>}
 */
export default async function (orderId) {
  let res = await Api.exec('p_order_download_po', [orderId], 'read');
  if (!res.status) throw new Error(res.message);

  for (const data of res.data) {
    /**
     * If customer's company doesn't have pic, hence it doesnt have phone number,
     * Then Check for b2b user who created this orders, and use his/her phone number instead
     */
    if (!data.phone) {
      const userId = data.order_items[0].user_id;
      res = await Api.get('users', `id = ${userId}`);
      if (!res.status) throw new Error(res.message);
      if (res.data[0].mobile && res.data[0].buyer_type === 1) {
        data.phone = res.data[0].mobile;
        data.pic_first_name = res.data[0].first_name;
      } else {
        throw new Error("This customer doesn't have any contact person");
      }
    }

    data.is_treedots = data.tenant_id === 1;
    data.grand_total =
      !data.order_items || data.order_items.length === 0
        ? 0
        : helper.getMoneyString(
            data.order_items
              .map((v) => Number(v.total_price) + Number(v.tax))
              .reduce((total, v) => total + v, 0)
              .toFixed(2)
          );
    data.order_items.forEach((item) => {
      item.amount_sgd = helper.displayPrice(item.amount_sgd);
      item.unit_price = `${helper.displayPrice(item.unit_price)} / ${item.uom}`;
      item.tax = helper.displayPrice(item.tax);
      item.total_price = helper.displayPrice(item.total_price);
    });

    const pdfRes = await Api.add('pdf_purchase_order', {
      payload: data,
      options: {
        format: 'A4',
        margin: {
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px'
        }
      },
      output: data.order_number
    }).then((res) => {
      // Transform the promise result here before saving the result to pdfRes
      if (!res.status) throw new Error(`Generate PDF Error: ${res.message}`);
      return res.data[0];
    });

    /** Preprocess the data */
    data.url = pdfRes;
    data.delivery_date = getCustomString(data.delivery_date);
    data.phone = helper.getPhoneString(data.phone);

    sendWA(data)
      .then(() => console.log('WA Sent to', data.attention))
      .catch((err) => {});
  }

  return true;
}

/**
 *
 * @param {any} payload
 * @returns {Promise<any>}
 */
const sendWA = async (payload) => {
  const Body = getWaTemplate(payload);

  let To = `whatsapp:${twilio_dev_number}`;
  if (production) {
    To = `whatsapp:${payload.phone}`;
  }

  const res = await Api.add('tw_Messages.json', {
    Body,
    To
  });
  if (!res.status) throw new Error(res.message);
  if (res.data.length === 0) throw new Error('No Feedback from Twilio');
  if (res.data[0].status !== 'queued') {
    throw new Error(res.data[0].message);
  }
  return res;
};

/**
 *
 * @param {any} payload - PO Data
 * @returns {string}
 *
 *
 * Refer to message template at https://www.twilio.com/console/sms/whatsapp/senders/XEd9180ebd8202dc9930aea8b672598fc5
 *
 * Please, please, please, check for the WHITE SPACE, like space or enter.
 * Or you will have a bad time
 */
const getWaTemplate = ({ pic_first_name, phone, delivery_date, tenant_name, grand_total, url }) => {
  return `Hi ${pic_first_name} - ${phone} , we have received your order for ${tenant_name} via TreeDots for delivery on ${delivery_date}
The total amount for the order will be ${grand_total}
Please click the link below for the Purchase Order created.
${url}
Any issues/queries, please contact us or the respective Supplier for more information.

您好，感谢您购买 ${tenant_name} 的产品。
我们已收到您的订单。货物将在${delivery_date} 送到。
此订单的总数额是 ${grand_total} 。
您可以点击一下链接查看订单.
${url}
若有任何疑问，请联系我们或相关供应商以获取更多信息`;
};
