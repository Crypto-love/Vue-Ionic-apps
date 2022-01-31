import { booleanArg, queryField } from 'nexus';

export const allUserTypes = queryField((t) => {
  t.list.field('allUserTypes', {
    type: 'UserType',
    args: {
      active: booleanArg()
    },
    resolve: (_parent, args, context) => {
      return context.prisma.userType.findMany({
        where: { active: args.active || undefined }
      });
    }
  });
});
