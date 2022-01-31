import { booleanArg, intArg, stringArg, queryField, list, nullable } from 'nexus';

export const getB2COrders = queryField((t) => {
  t.list.field('getB2COrders', {
    type: 'B2COrder',
    args: {
      deliveryDate: stringArg(),
      hubIdList: list(intArg()),
      tenantIdList: list(intArg()),
      status: stringArg(),
      orderId: intArg()
    },
    resolve: async (_, { deliveryDate, hubIdList, tenantIdList, status, orderId }, context) => {
      const res: any = [];
      const days = 40; //only get data last two months
      const date = new Date();
      const sixtyPastDay = new Date(date.setTime(date.getTime() - days * 24 * 60 * 60 * 1000));
      sixtyPastDay.setHours(sixtyPastDay.getHours() + 8); // set timezone to SG
      const whereDeliveryDate = deliveryDate ? deliveryDate : { gte: sixtyPastDay };
      const getPreOrders = await context.prisma.preOrder.findMany({
        where: {
          id: orderId,
          order_status: {
            name: status
          },
          delivery_date: whereDeliveryDate,
          pre_order_item: {
            some: {
              customer_buyer_id: {
                in: hubIdList
              },
              sku: {
                product: {
                  tenant_id: {
                    in: tenantIdList
                  }
                }
              },
              order_item_status_id: {
                in: [-2, -1, 11, 12, 13, 17]
              }
            }
          }
        },
        include: {
          pre_order_item: {
            select: {
              total_price: true,
              tax: true,
              sku_id: true,
              order_item_status_id: true,
              customer_buyer_id: true,
              sku: {
                include: {
                  product: {
                    include: {
                      tenant: {
                        include: {
                          customer: {
                            take: 1,
                            where: {
                              tenant_id: {
                                not: null
                              },
                              customer_type_id: 3,
                              active: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              hub: true
            }
          },
          order_status: true,
          user: true
        },
        orderBy: { id: 'desc' }
      });
      for (const order of getPreOrders) {
        const totalPrice = order.pre_order_item
          .filter((x) => !'12,13,17'.includes(x.order_item_status_id.toString()))
          .reduce((a: any, b: any) => {
            return a + Number(b.total_price);
          }, 0);
        const tax = order.pre_order_item
          .filter((x) => !'12,13,17'.includes(x.order_item_status_id.toString()))
          .reduce((a: any, b: any) => {
            return a + Number(b.tax);
          }, 0);
        res.push({
          order_id: order.id,
          status_id: order.order_status_id,
          status: order.order_status ? order.order_status.name : 'Order Status Not Valid',
          delivery_date: order.delivery_date.toISOString().replace('T', ' ').replace('Z', ''),
          delivery_time: null,
          order_date: order.created_at.toISOString().replace('T', ' ').replace('Z', ''),
          info: '['.concat(
            order.user.first_name,
            ' ',
            order.user.last_name,
            ' ',
            order.created_at.toISOString().replace('T', ' ').replace('Z', ''),
            ' ]'
          ),
          user_id: order.user.id,
          customer_buyer_id: order.pre_order_item[0].customer_buyer_id,
          customer: order.pre_order_item[0].hub.name,
          alias_name: order.pre_order_item[0].hub.alias_name,
          items: [...new Set(order.pre_order_item.map((x) => x.sku_id))].length,
          prices: totalPrice,
          taxes: tax,
          description: order.description,
          standalone: order.standalone,
          po_number: order.po_number,
          active: order.active,
          tenant_id: order.pre_order_item[0].sku.product.tenant_id,
          tenant_name:
            order.pre_order_item[0].sku.product.tenant.customer.length > 0
              ? order.pre_order_item[0].sku.product.tenant.customer[0].name
              : 'tenant name N/A',
          hub: order.pre_order_item[0].hub.hub,
          user_name: order.user.username
            ? order.user.username
            : order.user.first_name.concat(' ', order.user.last_name),
          mobile: order.user.mobile,
          delivery_method: 'Self Collection',
          delivery_fee: 0
        });
      }
      return res;
    }
  });
});
