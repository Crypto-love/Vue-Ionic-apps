import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, arg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns status add Invoice Payment
 * @param invoice_id
 * @param xero_account_id
 * @param xero_account_name
 * @param amount
 * @param user_id
 * @param user_name
 * @param reference_number
 * @param log_description
 * @return status success (true or error)
 * */
export const addInvoicePayment = mutationField('addInvoicePayment', {
  type: 'Boolean',
  args: {
    item: nonNull(
      arg({
        type: 'AddInvoicePaymentInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const {
      invoice_id,
      xero_account_id,
      xero_account_name,
      amount,
      user_id,
      user_name,
      reference_number,
      log_description
    } = item;

    /** Check is invoice_id already exist or not in payment */
    const existingPayment = await ctx.prisma.payment.findFirst({
      where: {
        invoice_id
      }
    });

    if (existingPayment) {
      throw new UserInputError('This invoice payment is already exist.');
    } else {
      await ctx.prisma.payment.create({
        data: {
          invoice_id,
          xero_account_id,
          xero_account_name,
          amount,
          reference_number,
          created_by: user_id
        }
      });
    }

    return true;
  }
});
