import { Api } from '../../share/index';

async function sendRequest(row) {
  if (row) {
    const title = `Request Product`;
    let message = `<html><body>`;
    message += `<table>
                      <tr>
                        <td>Suplier Name</td>
                        <td>&ensp;: </td>
                        <td><strong>#${row.suplier_name}</strong></td>
                      </tr>
                      <tr>
                        <td>Product Sku Name</td>
                        <td>&ensp;: </td>
                        <td><strong>${row.product_sku_name}</strong></td>
					  </tr>
					  <tr>
					    <td>Price</td>
                        <td>&ensp;: </td>
                        <td><strong>${row.price}</strong></td>
                      </tr>
                      <tr>
					    <td>Price</td>
                        <td>&ensp;: </td>
                        <td><strong>${row.remarks}</strong></td>
                      </tr>
                    </table>
                    <p>Customer Name : ${row.customer_name} <br> Email : ${row.customer_email}</p>
                    <br/><br/>
                   `;
    message += `</body></html>`;

    const send = Api.post('e_mail', {
      to: 'support@thetreedots.com',
      subject: title,
      html: message
    });

    return send;
  }
}

export const ProductRequest = {
  sendRequest
};
