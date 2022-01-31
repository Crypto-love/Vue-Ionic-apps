import { booleanArg, intArg, list, nonNull, queryField, stringArg } from 'nexus';

export const getSupplierUsers = queryField((t) => {
  t.field('getSupplierUsers', {
    type: 'SupplierUserPagination',
    args: {
      active: booleanArg(),
      country: stringArg(),
      userType: nonNull(list(intArg())), // 6 for buyer, 11 for advocate, 1 for titan internal users, 2 for supplier admin users
      buyerType: intArg(), //1 for B2B, 2 for B2C, null for advocate, titan internal users and supplier admin users
      page: intArg(),
      perPage: intArg(),
      keyword: stringArg(),
      supplierId: intArg() //use to load internal supplier users
    },
    resolve: async (_, { active, country, userType, buyerType, page, perPage, keyword, supplierId }, ctx) => {
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 10;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      const filter = keyword
        ? {
            OR: [
              {
                first_name: {
                  contains: keyword
                }
              },
              {
                last_name: {
                  contains: keyword
                }
              },
              {
                mobile: {
                  contains: keyword
                }
              }
            ],
            userType: {
              id: {
                in: userType // only show buyer here
              },
              active: true
            },
            buyer_type: buyerType
          }
        : {
            active: active,
            country: {
              description: country,
              active: true
            },
            userType: {
              id: {
                in: userType
              },
              active: true
            },
            buyer_type: buyerType,
            UserCustomer: supplierId
              ? {
                  some: {
                    customer_id: supplierId,
                    active: true
                  }
                }
              : undefined
          };

      totalData = await ctx.prisma.user.count({
        where: filter
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const getSupplierUsers = await ctx.prisma.user.findMany({
        where: filter,
        orderBy: { id: 'desc' },
        take: take,
        skip: skip
      });

      return {
        supplier_users: getSupplierUsers,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});

export const getSupplierUserDetails = queryField((t) => {
  t.field('getSupplierUserDetails', {
    type: 'User',
    args: {
      userId: nonNull(intArg())
    },
    resolve: async (_, { userId }, ctx) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: userId
        }
      });
    }
  });
});

export const getAllCampaigns = queryField((t) => {
  t.list.field('getAllCampaigns', {
    type: 'Campaign',
    args: {
      active: booleanArg()
    },
    resolve: async (_, { active }, ctx) => {
      return ctx.prisma.campaign.findMany({
        where: {
          active: active
        }
      });
    }
  });
});
