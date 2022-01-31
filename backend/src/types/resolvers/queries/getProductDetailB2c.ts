import { UserInputError } from 'apollo-server-express';
import { intArg, nonNull, queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getProductDetailB2c = queryField((t) => {
  t.field('getProductDetailB2c', {
    type: 'ProductDetail',
    args: {
      product_id: nonNull(intArg()),
      product_type_id: intArg()
    },
    resolve: async (_parent, { product_id, product_type_id }, context) => {
      const product = await context.prisma.product.findUnique({
        where: { id: product_id },
        include: {
          tenant: true,
          categories: {
            select: {
              main_categories: { select: { name: true } },
              sub_categories: { select: { name: true } }
            }
          }
        }
      });

      if (!product) throw new UserInputError('Product not found');

      const skus = await context.prisma.sku.findMany({
        where: {
          product_id: product_id,
          b2c: true,
          active: true,
          inventories: {
            some: {
              product_type_id: product_type_id
              //     active: true,
              //     OR: [{ quantity: { gt: 0 } }, { quantity: -1 }],
              //     customer_tenant: {
              //       tenant_id: product.tenant_id
              //     }
            }
          }
        }
      });

      const customer = await context.prisma.customer.findFirst({
        where: { customer_type_id: 3, tenant_id: product.tenant_id },
        select: { name: true, alias_name: true }
      });

      const amounts = new Array<number>();
      const marketPrices = new Array<number>();
      const prices = new Array<number>();
      const skuId = new Array<number>();
      const items = new Array<string>();
      const qty = new Array<string>();
      const discountedItem = new Array<string>();
      const discountAmount = new Array<number>();
      const supplier = new Array<string>();
      const halal = new Array<string>();
      skus.forEach((sku) => {
        const marketPrice = Number(sku.b2c_market_unit_price) * Number(sku.b2c_unit_per_oom);
        const salePrice = Number(sku.b2c_unit_price) * Number(sku.b2c_unit_per_oom);
        amounts.push(Number(sku.b2c_unit_per_oom));
        marketPrices.push(marketPrice);
        prices.push(salePrice);
        skuId.push(sku.id);
        items.push(sku.is_b2c_pooling ? 'pooling' : 'non pooling');
        qty.push(`${sku.b2c_pooling_qty}`);
        discountedItem.push(marketPrice > salePrice ? 'yes' : 'no');
        discountAmount.push(marketPrice - salePrice);
        supplier.push(customer?.name ? customer?.name : customer?.alias_name);
        halal.push(sku.halal ? 'halal' : 'non halal');
      });

      const volumeDealItem = new Array<string>();
      for (const sku of skus) {
        const skuDeal = await context.prisma.skuDeal.findFirst({
          where: { sku_id: sku.id },
          select: { id: true }
        });
        volumeDealItem.push(skuDeal ? 'yes' : 'no');
      }

      const credential = getUserCredentials(context);

      context.clevertap.uploadEvents([
        {
          identity: credential.userId,
          name: 'View Product',
          data: {
            'product sku id': skuId.join(),
            'product name': product.name,
            'product selling price': prices.join(),
            'product market price': marketPrices.join(),
            'product supplier': supplier.join(),
            'groupbuy item': items.join(),
            'groupbuy progress': '',
            'groupbuy qty': qty.join(),
            'discounted item': discountedItem.join(),
            'discount amount': discountAmount.join(),
            'top picks item': '',
            'volume deal item': volumeDealItem.join(),
            'product category': product.categories?.main_categories?.name,
            'product sub-category': product.categories?.sub_categories?.name,
            halal: halal.join()
          }
        }
      ]);

      return {
        id: product.id,
        name: product.name,
        image: product.image,
        tax_rate: product.tenant.tax_rate,
        max_amount: Math.max(...amounts),
        max_market_price: Math.max(...marketPrices),
        max_price: Math.max(...prices),
        min_amount: Math.min(...amounts),
        min_market_price: Math.min(...marketPrices),
        min_price: Math.min(...prices),
        skus: skus
      };
    }
  });
});
