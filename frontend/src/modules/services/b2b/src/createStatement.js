import dayjs from 'dayjs';
import { Api, Helper } from '../../share/index';
import { production, twilio_dev_number, env } from 'src/config';

const helper = new Helper();

/**
 *
 * @param {any[]} row
 * @param {string} sender
 * @returns {Promise<Boolean>}
 */
export async function createStatement(row, sender) {
  const statuses = ['AUTHORISED'];
  const contactIds = [row.xero_id || row.xero_customer_id];
  const invoices = await Api.xero('getInvoices', [null, null, null, null, null, contactIds, statuses]);
  if (!invoices.status) throw new Error(invoices.message);
  if (invoices.data.length < 1) throw new Error('No data to send!');

  let items = invoices.data[0].invoices
    .filter((x) => x.date < new Date().toISOString())
    .map((x) => {
      return {
        date: getCustomString(x.date),
        invoice: x.invoiceNumber,
        reference: x.reference,
        duedate: getCustomString(x.dueDate),
        amount: x.amountDue,
        paid: x.amountPaid,
        balance: x.amountDue - x.amountPaid
      };
    });

  if (items.length <= 0) throw new Error('No over due invoices!');

  let total_overdue = items.map((x) => x.amount).reduce((a, b) => a + b, 0);
  let total_current = items.map((x) => x.paid).reduce((a, b) => a + b, 0);
  let total_balance = total_overdue - total_current;

  /* format moneystring */
  items = items.map((x) => {
    return {
      date: x.date,
      invoice: x.invoice,
      reference: x.reference,
      duedate: x.duedate,
      amount: getMoneyString(x.amount),
      paid: getMoneyString(x.paid),
      balance: getMoneyString(x.balance)
    };
  });

  const customerDetail = await Api.get('v_customer_statements', `id=${row.id}`);
  if (!customerDetail.status) throw new Error('Invalid Customers!');
  if (customerDetail.data.length <= 0) throw new Error('There are no available PICs!');

  for (let customer of customerDetail.data) {
    const payload = {
      buyer_name: customer.buyer_name,
      attention: customer.attention,
      address: customer.address,
      account_number: customer.account_number,
      phone: helper.getPhoneString(customer.phone),
      statement_date: getCustomString(new Date().toISOString()),
      total_overdue: getMoneyString(total_overdue),
      total_current: getMoneyString(total_current),
      total_balance: getMoneyString(total_balance),
      items: items,
      url: null
    };

    const pdfRes = await Api.add('pdf_statement', {
      payload,
      options: {
        format: 'A4'
      },
      output: `${payload.account_number}_${getDateCode(new Date().toISOString())}`
    }).then((res) => {
      // Transform the promise result here before saving the result to pdfRes
      if (!res.status) throw new Error(`Generate PDF Error: ${res.message}`);
      return res.data[0];
    });

    await Api.exec('p_statements', [
      payload.phone,
      sender,
      pdfRes,
      JSON.stringify(payload).replace(/'/g, "\\'")
    ]).then((res) => {
      if (!res.status) throw new Error(res.message);
      return res.data[0];
    });

    payload.url = pdfRes;

    // Send whatsapp without awaiting, we use this until Promise.allSettled is available to use
    // We don't care if wa is sucessfully sent or not, so we just console.log the result
    sendWhatsApp(payload)
      .then(() => {})
      .catch((err) => {});
  }

  return true;
}

/**
 *
 * @param {any} data
 * @returns {Promise<any>}
 */
async function sendWhatsApp(data) {
  /**
   * Refer to message template at https://www.twilio.com/console/sms/whatsapp/senders/XEd9180ebd8202dc9930aea8b672598fc5
   * Please, please, please, check for the WHITE SPACE, like space or enter
   * Or you will have a bad time
   */
  const Body = `Hi, ${data.attention}. Thanks for ordering with TreeDots.

We'd like to remind you of your outstanding balance for ${data.buyer_name}

You have an overdue amount of ${data.total_overdue}

Please kindly make payment to DBS 074-902992-7 or cheque to TreeDots Enterprise (Private Limited).

If you have already made the payment, please kindly ignore this automated message.

Please click the link below for statement:
${data.url}

You may download our app for quicker and better ordering, or even extend your credit terms by including your corporate/personal credit card to charge the transactions to your credit/debit card instead.

Any issues/queries, please contact us or your salesperson for more information.

您好，感谢您购买 TreeDots 的产品。

我们想在此提醒您的欠款已经到期了。

您的欠款数额是 ${data.total_overdue}。

您可以通过银行转账 - DBS 074-902992-7，或支票付款 - TreeDots Enterprise Private Limited。

如果您已经付帐，请不用在意这段讯息。

您也可以点击一下链接查看账目表。
${data.url}

您也可以在以下的网址下载我们的手机软件。

通过我们的手机软件，您可以轻易的下订单，以信用卡付费方式来延长您的贷款期限。

若有任何问题，请您联系我们或您最亲近的销售员。

Download the APP today 今天就下载我们的APP!
https://www.thetreedots.com/download
`;

  let To = `whatsapp:${twilio_dev_number}`;
  if (production && env === 'production') {
    To = `whatsapp:${data.phone}`;
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

  const resData = res.data[0];
  resData.attention = data.attention;

  return resData;
}

function getCustomString(date) {
  return dayjs(date).format('DD MMM YYYY');
}
function getDateCode(date) {
  return dayjs(date).format('YYYYMMDDHHMM');
}
function getMoneyString(value) {
  let formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  return formatter.format(value);
}
