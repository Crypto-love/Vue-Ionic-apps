import { Api } from '../../share/index';
import dayjs from 'dayjs';
import * as Store from '../../../../store/index';

function GetTotalPrice(items) {
  var total = 0;
  items.forEach((svalue, sindex) => {
    total += Number(svalue.total_price) + Number(svalue.total_tax);
  });
  return total.toFixed(2);
}

export function sendEmailCharge(credential, order, last4) {
  if (credential.email) {
    const state = Store.default.state;

    const title = `[TreeDots] Order Confirmation for Order ${order.order_id}`;
    let message = `<html><body>`;
    message += `Dear ${credential.first_name + ' ' + credential.last_name},<br/ >
                Your order has been submitted and will take 1 working day to process after spree closed.<br/><br/>
                Order Items : <br/>`;
    order.items.forEach((fValue, fIndex) => {
      message += `<strong>${fValue.order_qty} x ${fValue.name}</strong> <br/>`;
    });
    message += `<br/><table>
                      <tr>
                        <td>Order Number</td>
                        <td>&ensp;: </td>
                        <td><strong>${order.order_id}</strong></td>
                      </tr>
                      <tr>
                        <td>Customer Name</td>
                        <td>&ensp;: </td>
                        <td><strong>${credential.first_name + ' ' + credential.last_name}</strong></td>
                      </tr>
                      <tr>
                        <td>Created Date</td>
                        <td>&ensp;: </td>
                        <td><strong>${dayjs().format('DD MMMM YYYY hh:mm:ss')}</strong></td>
                      </tr>
                      <tr>
                        <td>Amount Authorized</td>
                        <td>&ensp;: </td>
                        <td><strong>${state.currency_symbol} ${GetTotalPrice(order.items)}</strong></td>
                      </tr>
					            <tr>
                        <td>Paid via Card ending with </td>
                        <td>&ensp;</td>
                        <td><strong>${last4}.</strong></td>
                      </tr>
                    </table>
                    <br/>
                    Please note that this charge is a holding charge. The order amount will be updated when orders are processed and promotion prices are applied. You will receive a payment receipt once payment has been confirmed.
                    <br/><br/>
                    For any enquiries, please contact us at hello@thetreedots.com or +65 3138 4846.
                   `;
    message += `</body></html>`;

    Api.post('e_mail', {
      to: credential.email,
      subject: title,
      html: message
    });
  }
}

export const emailNotification = {
  sendEmailCharge
};
