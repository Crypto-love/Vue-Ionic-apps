import { queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getUserCustomers = queryField((t) => {
  t.field('getUserCustomers', {
    type: 'UserCustomerList',
    resolve: async (_parent, _, context) => {
      const credentials = getUserCredentials(context);
      const getData = await context.prisma.userCustomer.findMany({
        where: {
          user_id: credentials.userId,
          customer: {
            hub: true,
            active: true
          },
          user: {
            user_type_id: {
              in: [6, 11]
            }
          }
        },
        include: {
          user: true,
          customer: true
        }
      });
      if (getData.length > 0) {
        return {
          user_id: getData[0].user_id,
          customer: getData.map((x) => x.customer)
        };
      }
      return {
        user_id: credentials.userId,
        customer: []
      };
    }
  });
});
