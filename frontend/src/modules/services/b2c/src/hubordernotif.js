import { Api, Notice } from '../../share/index';
import { env } from 'src/config';

export async function slacknotif(customer, hub, item, status_id = -2) {
  let status = status_id == 13 ? '(CANCELLED)' : '';
  let header = `notification for hub order${status}`;
  let message = `notification for hub order${status} \r\n
Customer name: ${customer}
Hub:  ${hub}
Item: \r\n`;

  item.forEach((orderitem) => {
    message += orderitem.sku + ' x' + orderitem.order_qty + '\r\n';
  });

  const payload = {
    type: 'text',
    text: header,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };

  // let pr = Api.add(`${env === 'production'? 's_b2c-orders' : 's_dev-b2c-orders'}`, payload);
  let pr = Api.add(`${env === 'production' ? 's_staging-notifications' : 's_dev-b2c-orders'}`, payload);
  const s_result = await pr;

  if (!s_result.status) {
    Notice.error(s_result.message);
    return;
  }
  if (s_result.data.length <= 0) {
    Notice.error('Error gess');
    return;
  }

  Notice.ok('Notif Send');
}
