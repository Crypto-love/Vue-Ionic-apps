import { intArg, nonNull, queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getHotDiscountProductsB2C = queryField((t) => {
  t.list.field('getHotDiscountProductsB2C', {
    type: 'ProductWithHotDiscount',
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
      const products = await context.prisma.product.findMany({
        where: {
          id: {
            gt: 0
          },
          active: true,
          tenant_id: {
            in: listOfTenantInSprees
          },
          skus: {
            some: {
              id: {
                gt: 0
              },
              b2c: true,
              active: true,
              inventories: {
                some: {
                  product_type_id: 1,
                  active: true
                  // OR: [{ quantity: { gt: 0 } }, { quantity: -1 }] // want to show OUT OFF STOCK on FE
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
      products.forEach((product) => {
        const skus = product.skus;
        const amounts = new Array<number>();
        const marketPrices = new Array<number>();
        const prices = new Array<number>();
        skus.forEach((sku) => {
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
        const discount = getDiscount(product);
        product['discount'] = Math.abs(discount);
      });
      const filteredProducts = products.filter((product) => product['discount'] > 0);
      const sortedAndFilteredProduct = filteredProducts.sort((a, b) => b['discount'] - a['discount']);

      const credential = getUserCredentials(context);
      const user = await context.prisma.user.findFirst({
        where: { id: credential.userId },
        select: { email: true }
      });
      if (user.email) {
        context.clevertap.uploadEvents([
          { identity: user.email, name: 'Click home page', data: { properties: 'discount' } }
        ]);
      }

      //TODO: Maybe need to consider to apply this logic in the prisma itself rather than like this
      const filteredProductWithoutEmptySKUS = await sortedAndFilteredProduct.filter((product) => {
        return product.skus.length > 0;
      });
      return filteredProductWithoutEmptySKUS.slice(0, 30);
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
