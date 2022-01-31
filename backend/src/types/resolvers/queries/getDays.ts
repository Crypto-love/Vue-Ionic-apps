import { booleanArg, queryField } from 'nexus';

export const getDays = queryField((t) => {
  t.list.field('getDays', {
    type: 'Day',
    args: {
      active: booleanArg()
    },
    resolve: (_, { active }, context) => {
      return context.prisma.day.findMany({
        where: {
          active: active
        },
        orderBy: { id: 'asc' }
      });
    }
  });
});
