import { booleanArg, queryField } from 'nexus';

export const allMenus = queryField((t) => {
  t.list.field('allMenus', {
    type: 'Menu',
    args: {
      active: booleanArg()
    },
    resolve: (_parent, args, context) => {
      return context.prisma.menu.findMany({
        where: { active: args.active || undefined }
      });
    }
  });
});
