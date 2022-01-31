import { intArg, nonNull, queryField } from 'nexus';
import * as _ from 'lodash';
import { getUserCredentials } from '../../utils/auth';

export const getGroupBuyProducts = queryField((t) => {
  t.list.field('getGroupBuyProducts', {
    type: 'GroupBuyProducts',
    args: {
      hubId: intArg(),
      countryId: nonNull(intArg())
    },
    resolve: async (_parent, { hubId, countryId }, context) => {
      const currentDateTime: any = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 8);
      const sprees = await context.prisma.hubSpreeData.findMany({
        where: {
          hub_id: hubId,
          active: true,
          Status: 0,
          start_date: {
            lte: currentDateTime
          },
          end_date: {
            gte: currentDateTime
          },
          hub: {
            active: true,
            customer_type_id: 2,
            addresses: {
              some: {
                country_id: countryId
              }
            },
            hub: true
          },
          tenant: {
            customer: {
              some: {
                active: true,
                customer_type_id: 3,
                addresses: {
                  some: {
                    country_id: countryId
                  }
                }
              }
            }
          }
        },
        select: {
          tenant_id: true
        },
        distinct: ['tenant_id']
      });
      const listOfTenantInSprees = sprees.map((spree) => spree.tenant_id);
      const credential = getUserCredentials(context);
      const user = await context.prisma.user.findFirst({
        where: { id: credential.userId },
        select: { first_name: true, last_name: true, email: true }
      });
      if (credential.userId) {
        context.clevertap.uploadEvents([
          { identity: user.email, name: 'Click home page', data: { properties: 'gropbuy' } }
        ]);
      }

      const products = await context.prisma.product.findMany({
        where: {
          active: true,
          id: {
            gt: 0
          },
          tenant_id: {
            in: listOfTenantInSprees
          },
          skus: {
            some: {
              id: {
                gt: 0
              },
              active: true,
              b2c: true,
              is_b2c_pooling: true,
              inventories: {
                some: {
                  product_type_id: 1,
                  active: true
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
      const filteredProductWithoutEmptySKUS = products.filter((product) => {
        return product.skus.length > 0;
      });

      if (products.length > 0) {
        const shuffledProducts = _.shuffle(filteredProductWithoutEmptySKUS).slice(0, 20);
        shuffledProducts.forEach((product) => {
          const amounts = new Array<number>();
          const marketPrices = new Array<number>();
          const prices = new Array<number>();
          product.skus.forEach((sku) => {
            amounts.push(Number(sku.b2c_unit_per_oom));
            marketPrices.push(Number(sku.b2c_market_unit_price) * Number(sku.b2c_unit_per_oom));
            prices.push(Number(sku.b2c_unit_price) * Number(sku.b2c_unit_per_oom));
          });
          product['max_amount'] = Math.max(...amounts);
          product['max_market_price'] = Math.max(...marketPrices);
          product['max_price'] = Math.max(...prices);
          product['min_amount'] = Math.min(...amounts);
          product['min_market_price'] = Math.min(...marketPrices);
          product['min_price'] = Math.min(...prices);
          product['discount'] = Math.abs(getDiscount(product));
        });
        return shuffledProducts;
      }
      return [];
    }
  });
});

function getDiscount(item) {
  let minDiscount = 0;
  let maxDiscount = 0;

  if (Number(item.min_market_price) > Number(item.min_price)) {
    minDiscount =
      ((Number(item.min_market_price) - Number(item.min_price)) / Number(item.min_market_price)) * 100;
  }

  if (item.max_market_price > item.max_price) {
    maxDiscount =
      ((Number(item.max_market_price) - Number(item.max_price)) / Number(item.max_market_price)) * 100;
  }

  if (Number(item.min_market_price) == Number(item.max_market_price)) {
    return Number(minDiscount.toFixed(2));
  }

  return Number((minDiscount - maxDiscount).toFixed(2));
}
