import { queryField, stringArg } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const searchProducts = queryField((t) => {
  t.list.field('searchProducts', {
    type: 'Product',
    args: {
      keyword: stringArg()
    },
    resolve: async (_, { keyword }, context) => {
      if (keyword.length < 3) {
        throw new Error('Minimum 3 letters');
        return [];
      }

      const credential = getUserCredentials(context);
      const user = await context.prisma.user.findFirst({
        where: { id: credential.userId },
        select: { country_id: true }
      });

      const products = await context.prisma.product.findMany({
        where: {
          name: {
            contains: keyword
          },
          id: {
            gt: 0
          },
          active: true,
          skus: {
            some: {
              b2c: true,
              id: {
                gt: 0
              },
              active: true
            }
          },
          tenant: {
            customer: {
              some: {
                customer_type_id: 3,
                active: true,
                addresses: {
                  some: {
                    country_id: user.country_id
                  }
                }
              }
            }
          }
        },
        include: {
          skus: {
            where: {
              NOT: [
                {
                  b2c: false
                },
                {
                  b2c: null
                }
              ],
              b2c: true,
              active: true
            }
          }
        }
      });
      //TODO: Maybe need to consider to apply this logic in the prisma itself rather than like this
      return products.filter((product) => {
        return product.skus.length > 0;
      });
    }
  });
});
