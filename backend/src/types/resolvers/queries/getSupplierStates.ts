import { intArg, queryField } from 'nexus';

export const getSupplierStates = queryField((t) => {
  t.list.field('getSupplierStates', {
    type: 'SupplierState',
    args: {
      customer_id: intArg()
    },
    resolve: (_, { customer_id }, context) => {
      return context.prisma.supplierState.findMany({
        where: { supplier_id: customer_id || undefined }
      });
    }
  });
});

export const getSupplierStatesPagination = queryField((t) => {
  t.field('getSupplierStatesPagination', {
    type: 'SupplierStatePagination',
    args: {
      customer_id: intArg(),
      page: intArg(),
      perPage: intArg()
    },
    resolve: async (_, { customer_id, page, perPage }, context) => {
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 5;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      totalData = await context.prisma.supplierState.count({
        where: { supplier_id: customer_id }
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const allSupplierState = await context.prisma.supplierState.findMany({
        where: { supplier_id: customer_id },
        take: take,
        skip: skip
      });

      return {
        all_supplier_states: allSupplierState,
        total_rows: totalData ? totalData : 0,
        total_pages: totalPage ? totalPage : 0
      };
    }
  });
});
