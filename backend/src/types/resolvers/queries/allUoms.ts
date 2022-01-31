import { booleanArg, queryField } from 'nexus';

export const allUoms = queryField((t) => {
  t.list.field('allUoms', {
    type: 'Uom',
    args: {
      active: booleanArg()
    },
    resolve: (_parent, args, context) => {
      return context.prisma.uom.findMany({
        where: { active: args.active || undefined }
      });
    }
  });
});
