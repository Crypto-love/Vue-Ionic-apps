import { intArg, nonNull, queryField } from 'nexus';
import * as helper from './helper/';

export const getAllProducts = queryField((t) => {
  t.field('getAllProducts', {
    type: 'ProductHome',
    args: {
      hubId: intArg(),
      countryId: nonNull(intArg())
    },
    resolve: async (_parent, { hubId, countryId }, context) => {
      const listOfTenantInSprees = await helper.TenantListData(hubId, countryId, context.prisma);
      // get Top Picks
      const topPicks = await helper.topPickProductData(listOfTenantInSprees, context.prisma);
      // getDiscounts
      const hotTopDiscounts = await helper.ProductDiscountData(listOfTenantInSprees, context.prisma);
      // Group buy
      const groupBuy = await helper.groupByProductData(listOfTenantInSprees, context.prisma);
      // suppliers
      const suppliers = await helper.supplierData(listOfTenantInSprees, context.prisma);
      // GetAllCategories
      const categories = await helper.categoryData(context.prisma);

      return {
        top_picks: topPicks,
        discounts: hotTopDiscounts,
        group_buy: groupBuy,
        suppliers: suppliers,
        categories: categories
      };
    }
  });
});
