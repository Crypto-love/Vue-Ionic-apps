import { intArg, stringArg, queryField, list } from 'nexus';

export const getB2COrderList = queryField((t) => {
  t.field('getB2COrderList', {
    type: 'B2COrderListPagination',
    args: {
      deliveryDate: stringArg(),
      hubIdList: list(intArg()),
      tenantIdList: list(intArg()),
      status: stringArg(),
      orderId: intArg(),
      page: intArg(),
      perPage: intArg()
    },
    resolve: async (
      _,
      { deliveryDate, hubIdList, tenantIdList, status, orderId, page, perPage },
      context
    ) => {
      const res: any = [];
      // const days = 40; //only get data last two months
      // const date = new Date();
      // const sixtyPastDay = new Date(date.setTime(date.getTime() - days * 24 * 60 * 60 * 1000));
      // sixtyPastDay.setHours(sixtyPastDay.getHours() + 8); // set timezone to SG
      // const whereDeliveryDate = deliveryDate ? deliveryDate : undefined;
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 10;

      let skip = 0;
      if (page > 1) skip = page * take - take;

      totalData = await context.prisma.preOrder.count({
        where: {
          // id: orderId,
          order_status: {
            name: status
          },
          delivery_date: deliveryDate ? deliveryDate : undefined,
          pre_order_item: {
            some: {
              // order_id: orderId,
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
                in: [-2, -1, 11, 12, 13, 14, 17]
              }
            }
          },
          paymentB2c: {
            id: orderId
          }
        },
        orderBy: { id: 'desc' }
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const getPreOrders = await context.prisma.preOrder.findMany({
        where: {
          // id: orderId,
          order_status: {
            name: status
          },
          delivery_date: deliveryDate ? deliveryDate : undefined,
          pre_order_item: {
            some: {
              // order_id: orderId,
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
                in: [-2, -1, 11, 12, 13, 14, 17]
              }
            }
          },
          paymentB2c: {
            id: orderId
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
          paymentB2c: true,
          order_status: true,
          user: true
        },
        take: take,
        skip: skip,
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
          order_id_payment_b2c: order.payment_b2c_id,
          stripe_transaction_id: order.stripe_transaction_id,
          paymentB2c: order.paymentB2c,
          status_id: order.order_status_id,
          status: order.order_status.name,
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
          alias_name: order.pre_order_item[0].hub.alias_name || '',
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

      const parsed = [];
      res.map((a) => {
        if (!a.order_id_payment_b2c) {
          parsed.push({
            order_id: `${a.order_id}X`,
            child: [
              {
                ...a,
                paymentB2c: {
                  id: 1,
                  order_total: a.prices + a.taxes,
                  discount_amount: null,
                  voucher_code: '',
                  voucher_discount_type: '',
                  voucher_discount: null,
                  voucher_minimum_amount: null,
                  stripe_transaction_id: a.stripe_transaction_id,
                  status: 0,
                  active: 0,
                  created_date: new Date(),
                  description: '',
                  payment_transaction_id: a.payment_transaction_id
                }
              }
            ]
          });
        } else {
          const idx = parsed.findIndex((b) => b.order_id === a.order_id_payment_b2c);
          if (idx !== -1) {
            parsed[idx].child.push(a);
          } else {
            parsed.push({
              order_id: a.order_id_payment_b2c,
              child: [a]
            });
          }
        }
      });
      return {
        b2c_order_list: parsed,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});
