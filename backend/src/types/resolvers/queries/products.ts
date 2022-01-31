import { booleanArg, intArg, queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';
import { UserInputError } from 'apollo-server-express';

export const products = queryField((t) => {
  t.list.field('products', {
    type: 'Product',
    args: {
      mainCategory: intArg(),
      subCategory: intArg(),
      active: booleanArg(),
      buyerId: intArg(),
      page: intArg(),
      perPage: intArg(),
      tenantCustomerId: intArg(),
      hubId: intArg()
    },
    resolve: async (
      _,
      { active, mainCategory, subCategory, buyerId, page, perPage, tenantCustomerId, hubId },
      context
    ) => {
      let tenantId = undefined;
      const curentDateTime: any = new Date();
      curentDateTime.setHours(curentDateTime.getHours() + 8);
      // Track browse page clevertap
      if (mainCategory && subCategory) {
        const credential = getUserCredentials(context);
        const categories = await context.prisma.mainCategory.findMany({ where: { active: true } });
        const categoriesSelected = categories.filter((a) => a.id === mainCategory);
        const subCategoriesSelected = categories.filter((a) => a.id === subCategory);
        if (categoriesSelected.length > 0 && subCategoriesSelected.length > 0) {
          context.clevertap.uploadEvents([
            {
              identity: `${credential.userId}`,
              name: 'Select Category',
              data: {
                'category name': categoriesSelected[0].name || null,
                'sub-category name': subCategoriesSelected[0].name || null
              }
            }
          ]);
        }
      }
      if (hubId) {
        const spree = await context.prisma.hubSpreeData.findMany({
          where: {
            hub_id: hubId,
            end_date: {
              gte: curentDateTime
            },
            active: true,
            Status: 0
          },
          select: {
            tenant_id: true
          },
          distinct: ['tenant_id']
        });
        if (spree) {
          tenantId = spree.length ? spree.map((x) => x.tenant_id) : undefined;
        } else {
          throw new UserInputError('Tenant not found');
        }
      }
      if (tenantCustomerId) {
        const tenantCustomer = await context.prisma.customer.findFirst({
          where: {
            id: tenantCustomerId, //filter for tenants not for hubs dont add hub = true
            active: true
          }
        });

        if (tenantCustomer) {
          tenantId = tenantCustomer.tenant_id ? tenantCustomer.tenant_id : undefined;
        } else {
          throw new UserInputError('Tenant not found');
        }
      }
      const userCountryId = await context.prisma.user.findUnique({
        where: {
          id: buyerId
        },
        select: {
          country_id: true
        }
      });

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 10;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      const products = await context.prisma.product.findMany({
        where: {
          id: {
            gt: 0
          },
          active: active,
          skus: {
            some: {
              id: {
                gt: 0
              },
              active: true,
              b2c: true,
              inventories: {
                some: {
                  product_type_id: 1
                  // active: true,
                  // OR: [{ quantity: { gt: 0 } }, { quantity: -1 }],
                  // NOT: {
                  //   quantity: 0
                  // }
                }
              }
            }
          },
          tenant: {
            customer: {
              some: {
                customer_type_id: 3,
                active: true,
                addresses: {
                  some: {
                    country_id: userCountryId.country_id
                  }
                }
              }
            }
          },
          tenant_id: {
            in: tenantId
          },
          categories: {
            main_category_id: mainCategory,
            sub_category_id: subCategory
          }
        },
        include: {
          skus: {
            where: {
              b2c: true,
              active: true
            }
          }
        },
        take: take,
        skip: skip
      });
      //TODO: Maybe need to consider to apply this logic in the prisma itself rather than like this
      return products.filter((product) => {
        return product.skus.length > 0;
      });
    }
  });
});
