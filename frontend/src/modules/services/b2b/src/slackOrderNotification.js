import { Api } from '../../share/index';
import { production, env } from 'src/config';

export default async function (order) {
  if (!production) return;

  let items = order.items
    .map(
      (x) =>
        `- ${x.sku} (${x.quantity} x $${(
          Number(x.total_price) +
          Number(x.total_price) * (Number(x.tax_rate) / 100)
        ).toFixed(2)})`
    )
    .join('\n');
  const slack_payload = {
    type: 'home',
    text: `${order.customer} place an Order`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Order No #${order.id}* (PROCESSING)`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Order By*: ${order.buyer_name}\n*Customer*: ${order.customer}\n`
          },
          {
            type: 'mrkdwn',
            text: `*Delivery Date*: ${order.delivery_date}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Items*:\n${items}`
        }
      },
      {
        type: 'divider'
      }
    ]
  };

  Api.add(`${env === 'production' ? 's_sales-order' : 's_dev-sales-order'}`, slack_payload);
}
