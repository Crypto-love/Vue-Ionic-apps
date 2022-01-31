import { mutationField, nonNull, arg } from 'nexus';

export const updateSpreeData = mutationField('updateSpreeData', {
  type: 'HubSpreeData',
  args: {
    data: nonNull(
      arg({
        type: 'InputSpreeUpdate'
      })
    )
  },
  resolve: async (_parent, { data }, ctx) => {
    const { advocate_id, hub_id, tenant_id, delivery_date, start_date, end_date } = data;

    const checkSpree = await ctx.prisma.hubSpreeData.findFirst({
      where: {
        hub_id: hub_id,
        tenant_id: tenant_id,
        delivery_date: delivery_date,
        Status: 0,
        active: true
      }
    });

    if (checkSpree) {
      //check preOrder table
      const preOrder = await ctx.prisma.preOrder.findMany({
        where: { spree_id: checkSpree.id }
      });
      if (preOrder) {
        await ctx.prisma.preOrder.updateMany({
          data: { close_date: end_date },
          where: { spree_id: checkSpree.id }
        });

        //check pool table
        const pool = await ctx.prisma.pool.findMany({
          where: { spree_id: checkSpree.id }
        });
        if (pool) {
          await ctx.prisma.pool.updateMany({
            data: { close_date: end_date },
            where: { spree_id: checkSpree.id }
          });
        }
      }
      return ctx.prisma.hubSpreeData.update({
        data: {
          advocate_id: advocate_id,
          end_date: end_date
        },
        where: { id: checkSpree.id }
      });
    } else {
      return ctx.prisma.hubSpreeData.create({
        data: {
          advocate_id: advocate_id,
          hub_id: hub_id,
          tenant_id: tenant_id,
          delivery_date: delivery_date,
          start_date: start_date,
          end_date: end_date,
          Status: 0,
          active: true
        }
      });
    }
  }
});
