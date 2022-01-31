import { intArg, nonNull, queryField } from 'nexus';

export const getAllSupplierByCPId = queryField((t) => {
  t.field('getAllSupplierByCPId', {
    type: 'CustomerTenantPagination',
    args: {
      CollectionPointId: nonNull(intArg()),
      page: intArg(),
      perPage: intArg()
    },
    resolve: async (_, { CollectionPointId, page, perPage }, ctx) => {
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 5;

      let skip = 0;
      if (page > 1) skip = page * take - take;
      totalData = await ctx.prisma.customerTenant.count({
        where: {
          customer_id: CollectionPointId,
          active: true
        }
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const customerTenants = await ctx.prisma.customerTenant.findMany({
        where: {
          customer_id: CollectionPointId,
          active: true
        },
        take: take,
        skip: skip,
        orderBy: { id: 'asc' }
      });

      return {
        supplier_list: customerTenants,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});
