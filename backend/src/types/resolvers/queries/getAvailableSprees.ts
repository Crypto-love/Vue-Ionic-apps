import { intArg, queryField } from 'nexus';

export const getAvailableSprees = queryField((t) => {
  t.list.field('getAvailableSprees', {
    type: 'HubSpreeData',
    args: {
      hubId: intArg(),
      tenantId: intArg()
    },
    resolve: (_, { hubId, tenantId }, { prisma }) => {
      return prisma.hubSpreeData.findMany({
        where: {
          Status: 0,
          active: true,
          end_date: {
            gte: new Date()
          },
          hub_id: hubId !== null ? hubId : undefined,
          tenant_id: tenantId !== null ? tenantId : undefined
        }
      });
    }
  });
});
