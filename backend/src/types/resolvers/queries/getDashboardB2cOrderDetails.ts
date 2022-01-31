import { intArg, stringArg, queryField, list } from 'nexus';

export const getB2COrderdetails = queryField((t) => {
  t.list.field('getB2COrderdetails', {
    type: 'B2COrderDetails',
    args: {
      tenantId: intArg(),
      orderId: intArg()
    },
    resolve: async (_, { tenantId, orderId }, context) => {
      const res: any = [];
      const getPreOrderItems = await context.prisma.preOrderItem.findMany({
        where: {
          order_id: orderId,
          sku: {
            product: {
              tenant_id: tenantId
            }
          },
          order_item_status_id: {
            in: [-2, -1, 11, 12, 13, 14, 17]
          }
        },
        include: {
          pre_order: true,
          order_item_status: true,
          sku: {
            include: {
              product: {
                include: {
                  tenant: true
                }
              },
              b2c_oom: true,
              b2c_uom: true
            }
          }
        }
      });
      for (const preOrderItem of getPreOrderItems) {
        res.push({
          active: preOrderItem.active,
          amount_qty: preOrderItem.amount_qty,
          close_date: preOrderItem.pre_order.close_date,
          id: preOrderItem.id,
          item_status: preOrderItem.order_item_status.name,
          logistic_type: null,
          oom: preOrderItem.sku.b2c_oom.name,
          order_id: preOrderItem.order_id,
          order_item_id: preOrderItem.id,
          order_item_status_id: preOrderItem.order_item_status_id,
          order_status_id: preOrderItem.pre_order.order_status_id,
          price: preOrderItem.sale_unit_price,
          price_total: preOrderItem.total_price,
          product: preOrderItem.sku.product.name,
          quantity: preOrderItem.total_qty,
          sku: preOrderItem.sku.name,
          sku_id: preOrderItem.sku_id,
          tax: preOrderItem.tax,
          tax_rate:
            Number(preOrderItem.sku.tax_rate) > 0
              ? preOrderItem.sku.tax_rate
              : preOrderItem.sku.product.tenant.tax_rate,
          tenant_id: preOrderItem.sku.product.tenant.id
        });
      }
      return res;
    }
  });
});
