import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, floatArg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * approve quotation
 *
 * @remarks
 *
 * @param action_type
 * @param user_id
 * @param unit_price
 * @param price
 * @param quotation_id
 * @param approve
 * @returns list quotation
 *
 */
export const approveQuotation = mutationField('approveQuotation', {
  type: 'Boolean',
  args: {
    action_type: nonNull(intArg()),
    user_id: nonNull(intArg()),
    unit_price: nonNull(floatArg()),
    price: nonNull(floatArg()),
    quotation_id: nonNull(intArg()),
    approve: nonNull(intArg())
  },
  resolve: async (_parent, { action_type, user_id, unit_price, price, quotation_id, approve }, ctx) => {
    const quotation = await ctx.prisma.quotation.findFirst({
      where: {
        id: quotation_id
      }
    });
    if (!quotation) throw new UserInputError('Quotation not found');

    const { customer_buyer_id, sku_id } = quotation;

    if (!customer_buyer_id) throw new UserInputError('Quotation not found');

    const customer = await ctx.prisma.customer.findFirst({
      where: { id: customer_buyer_id }
    });

    const { account_number } = customer;
    if (account_number) {
      if (action_type === 0) {
        const priceData = await ctx.prisma.price.findFirst({
          where: { id: sku_id }
        });
        const original_price = parseFloat(priceData.price.valueOf());

        const user = await ctx.prisma.user.findFirst({
          where: { id: user_id }
        });
        const user_type_id = user.user_type_id;

        if (user_type_id == 7 && original_price > price) {
          await ctx.prisma.quotation.update({
            data: {
              unit_price,
              price,
              quoted_by: user_id,
              quoted_at: new Date()
            },
            where: {
              id: quotation_id
            }
          });
        } else {
          await ctx.prisma.quotation.update({
            data: {
              unit_price,
              price,
              quoted_by: approve === 1 ? user_id : null,
              quoted_at: approve === 1 ? new Date() : null,
              last_user_id: user_id,
              status: approve ? true : false
            },
            where: {
              id: quotation_id
            }
          });
          if (approve === 1) {
            await ctx.prisma.price.create({
              data: {
                sku_id,
                account_number,
                customer_buyer_id,
                price,
                last_user_id: user_id,
                description: 'Quoted from quotation'
              }
            });
          }
        }
      } else if (action_type === 1) {
        await ctx.prisma.quotation.update({
          data: {
            last_user_id: user_id,
            status: approve ? true : false
          },
          where: {
            id: quotation_id
          }
        });
        if (approve === 1) {
          await ctx.prisma.price.create({
            data: {
              sku_id,
              account_number,
              customer_buyer_id,
              price,
              last_user_id: user_id,
              description: 'Quoted from quotation'
            }
          });
        }
      }
    }
    return true;
  }
});
