import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, stringArg, list } from 'nexus';
import { VDeliveryDays } from 'types/models/Delivery';

/* TODO: TESTING AND WIRING TO FRONTEND
 * Return list delivery day
 * @params items list delivery day
 * @params mode
 * @return list delivery day
 * */

export const deliveryDaysAdd = mutationField('deliveryDaysAdd', {
  type: list('VDeliveryDays'),
  args: {
    items: nonNull(list('DeliveryDayInput')),
    mode: nonNull(stringArg())
  },
  resolve: async (_parent, { items, mode }, ctx) => {
    const customerIds = [];
    for await (const item of items) {
      const { customer_id, day_id, id } = item;

      const c = await ctx.prisma.deliveryDay.count({
        where: {
          customer_id,
          day_id
        }
      });

      if (c === 0 && mode === 'add') {
        const dd = await ctx.prisma.deliveryDay.create({
          data: {
            customer_id,
            day_id
          }
        });
        if (!dd) throw new UserInputError('Can not create delivery day');
        customerIds.push(dd.id);
      } else if (mode === 'delete') {
        const deliveryDay = await ctx.prisma.deliveryDay.findFirst({
          where: {
            customer_id,
            day_id,
            id
          }
        });
        if (!deliveryDay) throw new UserInputError('Delivery day not found');

        await ctx.prisma.deliveryDay.delete({
          where: { id }
        });
      }
    }

    let result: typeof VDeliveryDays[];
    if (customerIds.length > 0)
      result = await ctx.prisma.$queryRaw<
        typeof VDeliveryDays[]
      >`SELECT * FROM v_delivery_days WHERE id IN (${customerIds.join(',')}})`;

    return result;
  }
});
