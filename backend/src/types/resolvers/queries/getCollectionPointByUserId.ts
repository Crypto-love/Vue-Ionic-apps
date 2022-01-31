import { intArg, queryField } from 'nexus';

export const getCollectionPointByUserId = queryField((t) => {
  t.list.field('getCollectionPointByUserId', {
    type: 'UserCustomer',
    args: {
      userId: intArg()
    },
    resolve: async (_, { userId }, ctx) => {
      return ctx.prisma.userCustomer.findMany({
        where: {
          user_id: userId,
          customer: {
            customer_type_id: 2,
            hub: true,
            active: true,
            address: {
              some: {
                active: true,
                is_default: true
              }
            }
          }
        }
      });
    }
  });
});
