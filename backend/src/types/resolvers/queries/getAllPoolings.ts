import { intArg, queryField, stringArg } from 'nexus';

export const getAllPoolings = queryField((t) => {
  t.list.field('getAllPoolings', {
    type: 'PoolUserData',
    args: {
      skuId: intArg(),
      hubId: intArg(),
      deliveryDate: stringArg()
    },
    resolve: async (_, { skuId, hubId, deliveryDate }, context) => {
      const ret = [];
      let oldUserId, newUserId;
      let i = 0;

      const orderItemData = await context.prisma.preOrderItem.findMany({
        where: {
          customer_buyer_id: hubId,
          pre_order: {
            delivery_date: deliveryDate
          },
          sku: {
            id: skuId
          }
        },
        include: {
          pre_order: {
            select: {
              delivery_date: true
            }
          },
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              mobile: true
            }
          },
          sku: {
            select: {
              is_b2c_pooling: true,
              b2c_pooling_qty: true
            }
          },
          pool_item: {
            select: {
              user_id: true,
              qty: true,
              pool: {
                select: {
                  is_fullfilled: true,
                  pool_qty: true
                }
              }
            }
          }
        },
        orderBy: {
          user_id: 'asc'
        }
      });
      orderItemData.forEach((data) => {
        newUserId = data.user_id;
        if (newUserId !== oldUserId) {
          oldUserId = newUserId;
          const itemType = data.sku.is_b2c_pooling ? 'pooling' : 'nonPooling';
          const nonPoolingQty =
            orderItemData.filter((x) => x.user_id === data.user_id && !x.sku.is_b2c_pooling).length > 0
              ? orderItemData
                  .filter((x) => x.user_id === data.user_id && !x.sku.is_b2c_pooling)
                  .map((x) => x.total_qty)
                  .reduce((a, b) => {
                    return a + b;
                  })
              : 0;
          const poolData =
            orderItemData.filter((x) => x.user_id === data.user_id && x.sku.is_b2c_pooling).length > 0
              ? orderItemData
                  .filter((x) => x.user_id === data.user_id && x.sku.is_b2c_pooling)
                  .map((x) => x.pool_item)
                  .reduce((a, b) => {
                    {
                      return [...a, ...b];
                    }
                  })
              : [];
          const successFullyPooled =
            poolData.filter((x) => x.pool.is_fullfilled).length > 0
              ? poolData
                  .filter((x) => x.pool.is_fullfilled)
                  .map((x) => x.qty)
                  .reduce((x, y) => {
                    return x + y;
                  })
              : 0;
          const pendingPooled =
            poolData.filter((x) => !x.pool.is_fullfilled).length > 0
              ? poolData
                  .filter((x) => !x.pool.is_fullfilled)
                  .map((x) => x.qty)
                  .reduce((x, y) => {
                    return x + y;
                  })
              : 0;
          ret[i] = {
            full_name: data.user.first_name.concat(' ', data.user.last_name),
            mobile: data.user.mobile,
            item_type: itemType,
            pooling_qty: data.sku.b2c_pooling_qty,
            non_pooling_qty: nonPoolingQty,
            successfully_pooled: successFullyPooled,
            pending_pooling: pendingPooled
          };
          i++;
        }
      });
      return ret;
    }
  });
});
