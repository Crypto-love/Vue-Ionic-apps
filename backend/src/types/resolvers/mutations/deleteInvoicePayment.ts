import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, arg, stringArg, intArg } from 'nexus';
import { v1 as uuidv1 } from 'uuid';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Return invoice_id , payment amount
 * @params id
 * @params user_id
 * @params user_name
 * @params log_description
 * @return invoice_id , payment amount
 * */

export const deleteInvoicePayment = mutationField('deleteInvoicePayment', {
  type: 'deleteInvoicePaymentRes',
  args: {
    id: nonNull(intArg()),
    user_id: nonNull(intArg()),
    user_name: nonNull(stringArg()),
    log_description: nonNull(stringArg())
  },
  resolve: async (_parent, { id, user_id, user_name, log_description }, ctx) => {
    let payment = await ctx.prisma.payment.findFirst({
      where: { id }
    });
    if (!payment) throw new UserInputError('Payment not found');

    const user = await ctx.prisma.user.findFirst({
      where: { id: user_id }
    });
    if (!user) throw new UserInputError('User not found');

    payment = await ctx.prisma.payment.update({
      data: {
        active: 0,
        updated_by: user_id
      },
      where: { id }
    });

    const { invoice_id } = payment;

    const payments = await ctx.prisma.payment.aggregate({
      sum: {
        amount: true
      },
      where: {
        invoice_id,
        active: 1
      }
    });
    const total_paid = payments.sum.amount;

    const invoice = await ctx.prisma.invoice.findFirst({
      where: { id: invoice_id }
    });

    let status_id = 3;
    if (invoice.amount <= total_paid) status_id = 1;
    else if (invoice.amount > total_paid) status_id = 2;

    await ctx.prisma.invoice.update({
      data: {
        cod_paid_amount: total_paid,
        resync_status: 1,
        status_id
      },
      where: { id: invoice_id }
    });

    const uuid = await uuidv1();
    await ctx.prisma.financeOperation.create({
      data: {
        uuid,
        invoice_id: invoice_id,
        user_id: user_id,
        user_name: user_name,
        description: log_description
      }
    });

    return {
      invoice_id,
      paid_amount: total_paid ? total_paid : 0
    };
  }
});
