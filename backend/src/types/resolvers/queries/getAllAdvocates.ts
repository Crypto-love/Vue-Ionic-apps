import { intArg, list, queryField, stringArg } from 'nexus';

export const getAllAdvocates = queryField((t) => {
  t.field('getAllAdvocates', {
    type: 'AdvocateUserPagination',
    args: {
      page: intArg(),
      perPage: intArg(),
      keyword: stringArg(),
      advocateId: intArg(),
      statusList: list(intArg())
    },
    resolve: async (_parent, { page, perPage, keyword, advocateId, statusList }, ctx) => {
      let pendingApprovalPD = undefined;
      let pendingVerificationCP = undefined;
      let pendingVerificationBA = undefined;

      if (statusList) {
        pendingApprovalPD = [];
        statusList.includes(0) ? pendingApprovalPD.push(0) : undefined;
        statusList.includes(1) ? pendingApprovalPD.push(1) : undefined;
        statusList.includes(2) ? pendingApprovalPD.push(2) : undefined;
        pendingApprovalPD = pendingApprovalPD.length > 0 ? pendingApprovalPD : undefined;
        pendingVerificationCP = statusList.includes(3) ? false : undefined;
        pendingVerificationBA = statusList.includes(4) ? false : undefined;
      }

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
              }
            ],
            user_type_id: {
              in: [6, 11]
            },
            country: {
              id: {
                gt: 0
              }
            },
            UserCustomer: {
              some: {
                customer: {
                  customer_type_id: 2,
                  active: true,
                  hub: true,
                  address: {
                    some: {
                      country_id: {
                        gt: 0
                      }
                    }
                  }
                }
              }
            },
            bankDetails:
              pendingVerificationBA === false
                ? {
                    some: {
                      user_id: {
                        gt: 0
                      },
                      active: pendingVerificationBA
                    }
                  }
                : undefined
          }
        : {
            id: advocateId,
            user_type_id: {
              in: [6, 11]
            },
            status_approval: pendingApprovalPD
              ? {
                  in: pendingApprovalPD
                }
              : undefined,
            country: {
              id: {
                gt: 0
              }
            },
            UserCustomer: {
              some: {
                customer: {
                  customer_type_id: 2,
                  active: true,
                  hub: true,
                  address: {
                    some: {
                      country_id: {
                        gt: 0
                      }
                    }
                  }
                },
                active: pendingVerificationCP === false ? false : undefined
              }
            },
            bankDetails:
              pendingVerificationBA === false
                ? {
                    some: {
                      user_id: {
                        gt: 0
                      },
                      active: pendingVerificationBA
                    }
                  }
                : undefined
          };
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 10;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      totalData = await ctx.prisma.user.count({
        where: filter
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const advocateUser = await ctx.prisma.user.findMany({
        where: filter,
        orderBy: { id: 'desc' },
        take: take,
        skip: skip
      });

      for (let index = 0; index < advocateUser.length; index++) {
        const advocate = advocateUser[index];

        const checkCP = await ctx.prisma.userCustomer.count({
          where: {
            user_id: advocate.id,
            active: false
          }
        });

        const checkBA = await ctx.prisma.bankDetail.count({
          where: {
            active: false,
            user_id: advocate.id
          }
        });
        if (checkBA > 0 && advocate.status_approval == 1) {
          await ctx.prisma.user.update({ data: { status_approval: 4 }, where: { id: advocate.id } });
        }
        if (checkCP > 0 && advocate.status_approval == 1) {
          await ctx.prisma.user.update({ data: { status_approval: 3 }, where: { id: advocate.id } });
        }
      }
      return {
        advocate_users: advocateUser,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});

export const getAdvocateNewRequestCount = queryField((t) => {
  t.field('getAdvocateNewRequestCount', {
    type: 'AdvocateNewRequestCount',
    resolve: async (_parent, _args, ctx) => {
      const totalNewHost = await ctx.prisma.user.count({
        where: {
          user_type_id: {
            in: [6, 11]
          },
          status_approval: 0,
          country: {
            id: {
              gt: 0
            }
          },
          UserCustomer: {
            some: {
              customer: {
                customer_type_id: 2,
                active: true,
                hub: true,
                address: {
                  some: {
                    country_id: {
                      gt: 0
                    }
                  }
                }
              }
            }
          }
        }
      });

      const totalNewCP = await ctx.prisma.userCustomer.count({
        where: {
          user: {
            user_type_id: {
              in: [6, 11]
            }
          },
          customer: {
            customer_type_id: 2,
            active: true,
            hub: true
          },
          active: false
        }
      });

      const totalNewBA = await ctx.prisma.bankDetail.count({
        where: {
          active: false,
          user: {
            user_type_id: {
              in: [6, 11]
            },
            UserCustomer: {
              some: {
                customer: {
                  customer_type_id: 2,
                  active: true,
                  hub: true
                }
              }
            }
          }
        }
      });

      return {
        new_hosts: totalNewHost ? totalNewHost : 0,
        new_collection_points: totalNewCP ? totalNewCP : 0,
        new_bank_accounts: totalNewBA ? totalNewBA : 0
      };
    }
  });
});
