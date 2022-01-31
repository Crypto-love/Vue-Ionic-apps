import { intArg, queryField } from 'nexus';

export const getPersons = queryField((t) => {
  t.list.field('getPersons', {
    type: 'Person',
    args: {
      customerId: intArg()
    },
    resolve: (_, { customerId }, context) => {
      return context.prisma.person.findMany({
        where: {
          customer_id: customerId
        },
        orderBy: { id: 'asc' }
      });
    }
  });
});
