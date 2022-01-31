import { booleanArg, queryField, intArg, list } from 'nexus';

export const getTenantHubs = queryField((t) => {
  t.list.field('getTenantHubs', {
    type: 'CustomerTenant',
    args: {
      tenantId: list(intArg()),
      hubId: list(intArg()),
      active: booleanArg()
    },
    resolve: (_parent, { tenantId, hubId, active }, context) => {
      return context.prisma.customerTenant.findMany({
        where: {
          tenant_id: {
            in: tenantId
          },
          customer_id: {
            in: hubId
          },
          active: active,
          customer: {
            customer_type_id: 2,
            hub: true,
            active: active
          }
        }
      });
    }
  });
});
