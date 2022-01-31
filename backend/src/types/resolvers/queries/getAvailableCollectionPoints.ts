import { intArg, nonNull, queryField } from 'nexus';

export const getAvailableCollectionPoints = queryField((t) => {
  t.list.field('getAvailableCollectionPoints', {
    type: 'HubSpreeData',
    args: {
      product_id: nonNull(intArg())
    },
    resolve: async (_, { product_id }, ctx) => {
      return await ctx.prisma.hubSpreeData.findMany({
        where: {
          active: true,
          Status: 0,
          tenant: {
            Product: {
              some: {
                id: product_id
              }
            }
          }
        },
        // Is this needed?
        // add t.model.Product() to models/Tenant.ts if needed
        include: {
          tenant: {
            include: {
              Product: true
            }
          }
        },
        distinct: ['hub_id']
      });
    }
  });
});
