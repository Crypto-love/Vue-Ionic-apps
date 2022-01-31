import { queryField, intArg } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getAllCartByUserId = queryField((t) => {
  t.field('getAllCartByUserId', {
    type: 'CartWithDeliveryAndMOV',
    args: {
      hubId: intArg()
    },
    resolve: async (_, { hubId }, ctx) => {
      const credential = getUserCredentials(ctx);

      /** Get cart */
      const carts = await ctx.prisma.cart.findMany({
        where: {
          user_id: credential.userId
        },
        include: {
          items: {
            include: {
              sku: {
                include: {
                  product: {
                    include: {
                      tenant: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      // group card by supplies
      const cartItems = [];
      for (let i = 0; i < carts.length; i++) {
        const cart = carts[i];
        for (let j = 0; j < cart.items.length; j++) {
          const item: any = Object.assign({}, cart.items[j]);
          // check the item in inventories
          const inventories = await ctx.prisma.inventory.findMany({
            where: {
              sku_id: item.sku.id,
              product_type_id: 1 // Sale
            },
            select: {
              quantity: true
            }
          });

          item.item_quantity = 0;
          inventories.map((i) => {
            if (i.quantity === -1) item.item_quantity = -1;
            if (i.quantity !== -1 && item.item_quantity !== -1) item.item_quantity += i.quantity;
          });

          // group by item base on the supplier
          const supplier = item.sku.product.tenant;
          const existedSupplier = cartItems.find((o) => o.supplier.id === supplier.id);
          if (existedSupplier) {
            existedSupplier['items'].push(item);
          } else {
            cartItems.push({
              supplier,
              items: [item]
            });
          }
        }
      }

      // get active sprees
      const spreesCondition = {
        active: true,
        Status: 0
      };

      if (hubId) spreesCondition['hub_id'] = hubId;
      const sprees = await ctx.prisma.hubSpreeData.findMany({
        where: spreesCondition,
        select: {
          hub_id: true,
          delivery_date: true,
          start_date: true,
          end_date: true,
          tenant_id: true
        },
        distinct: ['tenant_id'],
        orderBy: {
          delivery_date: 'asc'
        }
      });

      const listOfTenantId = [...new Set(sprees.map((spree) => spree.tenant_id))];

      const tenant = await ctx.prisma.customer.findMany({
        where: {
          tenant_id: {
            in: listOfTenantId
          },
          customer_type_id: 3
        },
        select: {
          alias_name: true,
          name: true,
          minimum_order: true,
          tenant_id: true
        }
      });
      const active_sprees = sprees.map((item) =>
        Object.assign(
          {},
          item,
          tenant.find((t) => t.tenant_id === item.tenant_id)
        )
      );

      return {
        active_sprees,
        cart_items: cartItems
      };
    }
  });
});
