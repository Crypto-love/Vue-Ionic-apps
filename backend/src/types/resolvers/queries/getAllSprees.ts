import { booleanArg, intArg, queryField, stringArg } from 'nexus';

export const getAllSprees = queryField((t) => {
  t.list.field('getAllSprees', {
    type: 'HubSpreeData',
    args: {
      status: intArg(),
      active: booleanArg(),
      currentTime: stringArg(),
      hubId: intArg(),
      tenantId: intArg(),
      deliveryDate: stringArg()
    },
    resolve: (_, { status, active, currentTime, hubId, tenantId, deliveryDate }, context) => {
      return context.prisma.hubSpreeData.findMany({
        where: {
          Status: status,
          active: active,
          start_date: {
            gt: currentTime
          },
          hub_id: hubId,
          tenant_id: tenantId,
          delivery_date: {
            equals: deliveryDate
          }
        }
      });
    }
  });
});
