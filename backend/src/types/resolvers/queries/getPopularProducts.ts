import { intArg, nonNull, queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getPopularProducts = queryField((t) => {
  t.list.field('getPopularProducts', {
    type: 'PopularProduct',
    args: {
      collection_point: intArg(),
      countryId: nonNull(intArg())
    },
    resolve: async (_, { collection_point, countryId }, context) => {
      const currentDateTime: any = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 8);
      const days = 14;
      const date = new Date();
      const sevenPastDay = new Date(date.setTime(date.getTime() - days * 24 * 60 * 60 * 1000));
      const timeNow = sevenPastDay.toISOString();
      const sprees = await context.prisma.hubSpreeData.findMany({
        where: {
          hub_id: collection_point,
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
      const skusListData = await context.prisma.preOrderItem.groupBy({
        by: ['sku_id'],
        sum: {
          total_qty: true
        },
        where: {
          sku: {
            active: true,
            b2c: true,
            product: {
              tenant_id: {
                in: listOfTenantInSprees
              }
            }
          },
          pre_order: {
            delivery_date: {
              gte: timeNow
            }
          }
        },
        orderBy: {
          _sum: {
            total_qty: 'desc'
          }
        },
        take: 20
      });
      const sku = await context.prisma.sku.findMany({
        where: {
          id: {
            in: skusListData.map((x: any) => x.sku_id)
          }
        },
        include: {
          product: true
        }
      });
      const product = await context.prisma.product.findMany({
        where: {
          id: {
            in: sku.map((x: any) => x.product_id)
          }
        }
      });

      const credential = getUserCredentials(context);
      const user = await context.prisma.user.findFirst({
        where: { id: credential.userId },
        select: { email: true }
      });
      if (user.email) {
        context.clevertap.uploadEvents([
          { identity: user.email, name: 'Click home page', data: { properties: 'top picks' } }
        ]);
      }

      for (let index = 0; index < product.length; index++) {
        const data: any = product[index];
        const skus = sku.filter((x) => x.product_id === data.id);
        const skuData = skus[0];
        data.total_order = skusListData.filter((x) => x.sku_id === skuData.id).map((y) => y.sum.total_qty)[0];

        /* Calculate discount */
        const amounts = new Array<number>();
        const marketPrices = new Array<number>();
        const prices = new Array<number>();
        skus.forEach((sku) => {
          amounts.push(Number(sku.b2c_unit_per_oom));
          marketPrices.push(Number(sku.b2c_market_unit_price) * Number(sku.b2c_unit_per_oom));
          prices.push(Number(sku.b2c_unit_price) * Number(sku.b2c_unit_per_oom));
        });
        product[index]['max_amount'] = Math.max(...amounts);
        product[index]['max_market_price'] = Math.max(...marketPrices);
        product[index]['max_price'] = Math.max(...prices);
        product[index]['min_amount'] = Math.min(...amounts);
        product[index]['min_market_price'] = Math.min(...marketPrices);
        product[index]['min_price'] = Math.min(...prices);
        product[index]['discount'] = Math.abs(getDiscount(product[index]));
      }

      return await product.sort((a: any, b: any) => b.total_order - a.total_order);
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
