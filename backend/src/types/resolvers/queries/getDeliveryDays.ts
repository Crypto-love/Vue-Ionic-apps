import { intArg, queryField } from 'nexus';

export const getDeliveryDays = queryField((t) => {
  t.list.field('getDeliveryDays', {
    type: 'DeliveryDay',
    args: {
      tenantCustomerId: intArg()
    },
    resolve: (_, { tenantCustomerId }, context) => {
      return context.prisma.deliveryDay.findMany({
        where: {
          customer_id: tenantCustomerId
        },
        orderBy: { day_id: 'asc' }
      });
    }
  });
});
