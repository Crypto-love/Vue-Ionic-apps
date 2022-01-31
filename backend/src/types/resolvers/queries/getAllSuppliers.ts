import { intArg, nonNull, queryField, stringArg } from 'nexus';

export const getAllSuppliers = queryField((t) => {
  t.list.field('getAllSuppliers', {
    type: 'Customer',
    args: {
      collectionPointId: nonNull(intArg()),
      countryId: nonNull(intArg()),
      keyword: stringArg()
    },
    resolve: async (_, { collectionPointId, countryId, keyword }, ctx) => {
      const getTaggedSupplier = await ctx.prisma.customerTenant.findMany({
        where: {
          customer_id: collectionPointId,
          active: true
        },
        distinct: ['id']
      });
      return ctx.prisma.customer.findMany({
        where: {
          tenant_id:
            getTaggedSupplier.length > 0
              ? {
                  notIn: getTaggedSupplier.map((x) => x.tenant_id)
                }
              : undefined,
          name: {
            contains: keyword
          },
          active: true,
          customer_type_id: 3, // supplier,
          addresses: {
            some: {
              country_id: countryId
            }
          },
          Product: {
            some: {
              skus: {
                some: {
                  b2c: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
    }
  });
});
