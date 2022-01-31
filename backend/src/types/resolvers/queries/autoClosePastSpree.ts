import { queryField } from 'nexus';

export const autoCloseAllPastSpree = queryField((t) => {
  t.field('autoCloseAllPastSpree', {
    type: 'Boolean',
    resolve: async (_parent, _, ctx) => {
      const now = new Date();
      const hubSprees = await ctx.prisma.hubSpreeData.findMany({
        where: {
          Status: 0,
          end_date: {
            gte: now
          }
        }
      });

      if (hubSprees.length > 0) {
        await Promise.all(
          hubSprees.map((hubSpree) => {
            return ctx.prisma.hubSpreeData.update({
              data: {
                Status: 1
              },
              where: {
                id: hubSpree.id
              }
            });
          })
        );
        return true;
      } else {
        return false;
      }
    }
  });
});
