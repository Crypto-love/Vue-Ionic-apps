import { booleanArg, queryField, intArg } from 'nexus';

export const getSkuDeals = queryField((t) => {
  t.list.field('getSkuDeals', {
    type: 'SkuDeal',
    args: {
      skuId: intArg(),
      active: booleanArg()
    },
    resolve: (_parent, { skuId, active }, context) => {
      return context.prisma.skuDeal.findMany({
        where: {
          sku_id: skuId,
          active: active
        }
      });
    }
  });
});
