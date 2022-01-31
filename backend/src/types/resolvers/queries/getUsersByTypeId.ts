import { intArg, queryField } from 'nexus';

export const getUsersByTypeId = queryField((t) => {
  t.list.field('getUsersByTypeId', {
    type: 'User',
    args: {
      userTypeId: intArg()
    },
    resolve: (_parent, { userTypeId }, context) => {
      let queryArgs = {};

      queryArgs = {
        take: 500
      };

      if (userTypeId != null) {
        queryArgs = {
          where: { user_type_id: userTypeId },
          ...queryArgs
        };
      }

      return context.prisma.user.findMany(queryArgs);
    }
  });
});
