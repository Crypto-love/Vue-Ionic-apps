import { arg, mutationField, nonNull } from 'nexus';
import { getUserCredentials } from '../../utils/auth';
import { UserInputError } from 'apollo-server-errors';
import { Context } from 'context';

/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns cart
 * @param cart_id
 * @param sku_id
 * @param price
 * @param order_quantity
 * @param order_weight
 * @return cart
 * */
export const addItemToCart = mutationField('addItemToCart', {
  type: 'Cart',
  args: {
    item: nonNull(
      arg({
        type: 'CartItemInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    /** Get cart */
    const credential = getUserCredentials(ctx);

    // split cart items by tenant_id
    let cart = await ctx.prisma.cart.findFirst({
      where: {
        user_id: credential.userId
        // customer_id: item.customer_id,
      }
    });

    const customer = await ctx.prisma.customer.findFirst({
      where: {
        id: item.customer_id,
        customer_type_id: 2, // Customer
        hub: credential.buyerType === 2 ? true : false,
        active: true
      }
    });
    if (!customer) throw new UserInputError(credential.buyerType === 2 ? 'Invalid Hub' : 'Invalid Company');
    /** If cart doesn't exist, create a new one */
    if (!cart) {
      cart = await ctx.prisma.cart.create({
        data: {
          user_id: credential.userId,
          customer_id: item.customer_id ? item.customer_id : null
        }
      });
    }
    /** Check is item already exist in cart */
    const existingItem = await ctx.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        sku_id: item.sku_id
      }
    });

    if (existingItem) {
      await ctx.prisma.cartItem.update({
        data: {
          price: item.price,
          order_quantity: existingItem.order_quantity + item.order_quantity,
          order_weight: Number(existingItem.order_weight) + Number(item.order_weight)
        },
        where: {
          id: existingItem.id
        }
      });
    } else {
      await ctx.prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          sku_id: item.sku_id,
          price: item.price,
          order_quantity: item.order_quantity,
          order_weight: item.order_weight
        }
      });
    }

    /* Track CleverTap event */
    trackAddToCartEvent(ctx, item, cart.user_id);

    return cart;
  }
});

async function trackAddToCartEvent(context: Context, arg: any, userId: number) {
  // find the item supplies
  const user = await context.prisma.user.findUnique({
    where: { id: userId }
  });
  const sku = await context.prisma.sku.findUnique({
    where: { id: arg.sku_id },
    include: { product: true }
  });
  const product = await context.prisma.product.findUnique({
    where: { id: sku.product_id },
    include: { tenant: true, categories: true }
  });
  const mainCategory = await context.prisma.mainCategory.findFirst({
    where: { id: product.categories.main_category_id },
    select: { name: true }
  });
  const subCategory = await context.prisma.subCategory.findFirst({
    where: { id: product.categories.sub_category_id },
    select: { name: true }
  });

  await context.clevertap.uploadEvents([
    {
      identity: user.email,
      name: 'Add to cart',
      data: {
        user_name: user.username,
        product_sku_id: arg.sku_id,
        product_name: sku.name,
        selling_price: sku.price,
        market_price: sku.market_unit_price,
        product_qty: arg.order_quantity,
        product_supplier: arg.name,
        groupbuy_item: sku.is_b2c_pooling,
        // groupbuy_progress: '',
        groupbuy_qty: sku.b2c_pooling_qty,
        // discounted_item: '',
        // discount_amount: '',
        // top_picks_item: '',
        // volume_deal_item: '',
        product_category: mainCategory.name,
        product_sub_category: subCategory.name,
        halal: sku.halal
      }
    }
  ]);
}
