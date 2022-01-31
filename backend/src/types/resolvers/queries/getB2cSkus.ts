import { booleanArg, intArg, nonNull, queryField } from 'nexus';

export const getB2cSkus = queryField((t) => {
  t.list.field('getB2cSkus', {
    type: 'Sku',
    args: {
      tenantId: nonNull(intArg()),
      isPooling: booleanArg()
    },
    resolve: (_, { tenantId, isPooling }, context) => {
      return context.prisma.sku.findMany({
        where: {
          active: true,
          b2c: true,
          is_b2c_pooling: isPooling == null ? undefined : isPooling,
          product: {
            active: true,
            tenant_id: tenantId
          },
          inventories: {
            some: {
              active: true
            }
          }
        },
        include: {
          inventories: true,
          product: {
            include: {
              tenant: true
            }
          }
        }
      });
    }
  });
});
