import { booleanArg, queryField } from 'nexus';

export const allUsers = queryField((t) => {
  t.list.field('allUsers', {
    type: 'User',
    args: {
      active: booleanArg()
    },
    resolve: (_parent, args, context) => {
      return context.prisma.user.findMany({
        where: { active: args.active || undefined },
        take: 500
      });
    }
  });
});
