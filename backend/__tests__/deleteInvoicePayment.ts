import { Payment, User } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { testData } from './__testData';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const ctx = createTestContext(userInfo);

async function deleteInvoicePayment(id: number, user_id: number, user_name: string, log_description: string) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
        mutation {
          deleteInvoicePayment(id: ${id}, user_id: ${user_id}, user_name: "${user_name}", log_description: "${log_description}")
          {
            invoice_id
            paid_amount
          }
        }`);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('User not found', async () => {
    const item = {
      id: 1,
      user_id: -1,
      user_name: 'fve',
      log_description: 'few'
    };
    ctx.prisma.payment.findFirst.mockResolvedValueOnce({
      id: 1
    } as Payment);
    ctx.prisma.user.findFirst.mockResolvedValueOnce(null);
    const result = await deleteInvoicePayment(item.id, item.user_id, item.user_name, item.log_description);

    expect(result).toMatchObject({
      errors: [
        {
          message: 'User not found'
        }
      ]
    });
  });

  it('Payment not found', async () => {
    const item = {
      id: -1,
      user_id: 1,
      user_name: 'fve',
      log_description: 'few'
    };
    ctx.prisma.payment.findFirst.mockResolvedValueOnce(null);
    ctx.prisma.user.findFirst.mockResolvedValueOnce({
      id: 1
    } as User);
    const result = await deleteInvoicePayment(item.id, item.user_id, item.user_name, item.log_description);

    expect(result).toMatchObject({
      errors: [
        {
          message: 'Payment not found'
        }
      ]
    });
  });
});
