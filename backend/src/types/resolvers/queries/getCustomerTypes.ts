import { booleanArg, queryField } from 'nexus';

export const getCustomerTypes = queryField((t) => {
  t.list.field('getCustomerTypes', {
    type: 'CustomerType',
    args: {
      active: booleanArg()
    },
    resolve: (_, { active }, context) => {
      return context.prisma.customerType.findMany({
        where: {
          active: active
        },
        orderBy: { id: 'asc' }
      });
    }
  });
});
