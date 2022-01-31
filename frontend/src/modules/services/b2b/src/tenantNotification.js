import { Api, Helper } from '../../share/index';
import { env, twilio_dev_number } from 'src/config';

const helper = new Helper();

export function sendSmsOrder({ phone, orderNumber, customer, token }) {
  if (phone) {
    let text = `Order Number #${orderNumber} / Customer Name ${customer}.\n`;
    text += `Click link below to more detail, confirm, and update order.\n`;
    text += token ? `${window.location.origin}/confirmation-order?token=${token}` : window.location.origin;

    Api.add('tw_Messages.json', {
      Body: text,
      To: env == 'development' ? twilio_dev_number : helper.getPhoneString(phone)
    });
  }
}

export function sendWhatsAppOrder({ phone, orderNumber, customer, token }) {
  if (phone) {
    const to = env == 'development' ? twilio_dev_number : helper.getPhoneString(phone);
    const url = token
      ? `${window.location.origin}/confirmation-order?token=${token}`
      : window.location.origin;

    Api.add('tw_Messages.json', {
      To: `whatsapp:${to}`,
      Body: `You’ve got an order from *${customer}*

Click link below to view and confirm the order.
${url}`
    });
  }
}

export function sendEmailOrder({ email, orderNumber, customer, token }) {
  if (email) {
    const url = token
      ? `${window.location.origin}/confirmation-order?token=${token}`
      : window.location.origin;
    const title = `Order Number #${orderNumber}`;
    let message = `<html><body>`;
    message += `<table>
                      <tr>
                        <td>Order Number</td>
                        <td>&ensp;: </td>
                        <td><strong>#${orderNumber}</strong></td>
                      </tr>
                      <tr>
                        <td>Customer Name</td>
                        <td>&ensp;: </td>
                        <td><strong>${customer}</strong></td>
                      </tr>
                    </table>
                    <br/>
                    Please click button below to confirm order. <br/>
                    <a
                      href="${url}"
                      target="_blank"
                      style="background-color: #04565A; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; letter-spacing: 1px;">
                    Confirmation Page
                    </a>
                    <br/><br/>
                    Visit below link if button is not showing.
                    <br/>
                    ${url}`;
    message += `</body></html>`;

    Api.post('e_mail', {
      to: email,
      subject: title,
      html: message
    });
  }
}

export const tenantNotification = {
  sendSmsOrder,
  sendWhatsAppOrder,
  sendEmailOrder
};
