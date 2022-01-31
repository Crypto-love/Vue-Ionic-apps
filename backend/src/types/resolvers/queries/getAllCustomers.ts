import { booleanArg, queryField, intArg, nonNull, stringArg } from 'nexus';

export const getAllCustomers = queryField((t) => {
  t.list.field('getAllCustomers', {
    type: 'Customer',
    args: {
      tenantId: intArg(),
      hubId: intArg(),
      active: booleanArg(),
      customer_type_id: intArg(),
      countryId: intArg(),
      bussinessUserId: intArg(),
      keyword: stringArg(),
      hub: booleanArg() //true for collection points, false for merchants
    },
    resolve: async (
      _parent,
      { tenantId, hubId, active, customer_type_id, countryId, bussinessUserId, keyword, hub },
      context
    ) => {
      const isHub = hub === undefined ? false : hub;

      const getTaggedCustomers = bussinessUserId
        ? await context.prisma.userCustomer.findMany({
            where: {
              user_id: bussinessUserId,
              active: true,
              customer: {
                customer_type_id: 2,
                active: true,
                hub: false
              }
            }
          })
        : [];
      const filter =
        hubId || getTaggedCustomers.length > 0
          ? {
              OR: [
                hubId
                  ? {
                      id: hubId
                    }
                  : undefined,
                getTaggedCustomers.length > 0
                  ? {
                      id: {
                        notIn: getTaggedCustomers.map((x) => x.customer_id)
                      }
                    }
                  : undefined
              ],
              active: active,
              customer_type_id: customer_type_id,
              hub: isHub,
              address: countryId
                ? {
                    some: {
                      active: true,
                      is_default: true,
                      country_id: countryId
                    }
                  }
                : undefined
            }
          : keyword
          ? {
              name: {
                contains: keyword
              },
              active: active,
              customer_type_id: customer_type_id,
              hub: isHub,
              address: countryId
                ? {
                    some: {
                      active: true,
                      is_default: true,
                      country_id: countryId
                    }
                  }
                : undefined
            }
          : {
              tenant_id: tenantId,
              active: active,
              customer_type_id: customer_type_id,
              hub: isHub,
              address: countryId
                ? {
                    some: {
                      active: true,
                      is_default: true,
                      country_id: countryId
                    }
                  }
                : undefined
            };
      const customer = await context.prisma.customer.findMany({
        where: filter
      });
      return customer;
    }
  });
});

export const getAllCustomerByBusinessUserId = queryField((t) => {
  t.list.field('getAllCustomerByBusinessUserId', {
    type: 'UserCustomer',
    args: {
      businessUserId: nonNull(intArg())
    },
    resolve: async (_, { businessUserId }, ctx) => {
      return ctx.prisma.userCustomer.findMany({
        where: {
          user_id: businessUserId,
          active: true,
          customer: {
            customer_type_id: 2,
            active: true,
            hub: false
          }
        }
      });
    }
  });
});
