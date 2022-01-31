import { Customer } from '@treedots/prisma';
import { intArg, queryField, stringArg } from 'nexus';

export const getAllSupplierDashboardAdmin = queryField((t) => {
  t.field('getAllSupplierDashboardAdmin', {
    type: 'CustomerServerPagination',
    args: {
      supplierId: intArg(),
      page: intArg(),
      perPage: intArg(),
      keyword: stringArg()
    },
    resolve: async (_, { supplierId, page, perPage, keyword }, ctx) => {
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 15;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      const supplierList = await ctx.prisma.customer.findMany({
        where: {
          customer_type_id: 3,
          tenant_id: {
            not: null
          }
        },
        distinct: ['id']
      });
      const supplierFilter =
        supplierId === 0 && !keyword
          ? {
              id: {
                in: supplierList.map((x) => x.id)
              },
              customer_type_id: 3 // supplier,
            }
          : keyword
          ? {
              name: {
                contains: keyword
              },
              customer_type_id: 3
            }
          : {
              id: supplierId,
              customer_type_id: 3 // supplier,
            };

      totalData = await ctx.prisma.customer.count({
        where: supplierFilter,
        orderBy: {
          name: 'asc'
        }
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;
      const customer = await ctx.prisma.customer.findMany({
        where: supplierFilter,
        orderBy: {
          name: 'asc'
        },
        include: {
          tenant: true,
          addresses: {
            where: {
              id: {
                gt: 0
              }
            },
            include: {
              country: true
            }
          }
        },
        take: take,
        skip: skip
      });
      return {
        Customer: customer,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});
