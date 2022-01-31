import { queryField, intArg, nonNull } from 'nexus';

export const getAvailableCollectionPointByTenant = queryField((t) => {
  t.list.field('getAvailableCollectionPointByTenant', {
    type: 'Customer',
    args: {
      tenantId: nonNull(intArg())
    },
    resolve: async (_, { tenantId }, { prisma }) => {
      const openSprees = await prisma.hubSpreeData.findMany({
        where: {
          tenant_id: tenantId,
          Status: 0,
          active: true,
          end_date: { gte: new Date() }
        },
        select: { hub_id: true }
      });
      const hubIds = openSprees.map((v) => v.hub_id);

      if (!hubIds.length) return [];

      return prisma.customer.findMany({
        where: {
          id: { in: hubIds }
        },
        include: {
          persons: { where: { active: true } }
        }
      });
    }
  });
});
