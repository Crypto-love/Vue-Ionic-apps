import { intArg, queryField } from 'nexus';

export const getHours = queryField((t) => {
  t.list.field('getHours', {
    type: 'Hour',
    args: {
      customerId: intArg()
    },
    resolve: (_, { customerId }, context) => {
      return context.prisma.hour.findMany({
        where: {
          customer_id: customerId
        },
        orderBy: { day_id: 'asc' }
      });
    }
  });
});
