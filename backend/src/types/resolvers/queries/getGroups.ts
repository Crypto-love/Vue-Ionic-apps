import { booleanArg, queryField } from 'nexus';

export const getGroups = queryField((t) => {
  t.list.field('getGroups', {
    type: 'Group',
    args: {
      active: booleanArg()
    },
    resolve: (_, { active }, context) => {
      return context.prisma.group.findMany({
        where: {
          active: active
        },
        orderBy: { id: 'asc' }
      });
    }
  });
});
