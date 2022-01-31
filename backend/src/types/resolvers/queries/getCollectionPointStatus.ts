import { intArg, list, nonNull, queryField, stringArg } from 'nexus';

export const getCollectionPointStatus = queryField((t) => {
  t.field('getCollectionPointStatus', {
    type: 'CollectionPointStatusPagination',
    args: {
      tenantId: nonNull(list(intArg())),
      hubId: list(intArg()),
      status: intArg(),
      page: intArg(),
      perPage: intArg(),
      keyword: stringArg()
    },
    resolve: async (_, { tenantId, hubId, status, page, perPage, keyword }, context) => {
      const ret: any = [];
      let totalData = undefined;
      let totalPage = undefined;

      if (!page || (page && page <= 0)) page = 1;

      let take = perPage;
      if (!perPage || (perPage && perPage <= 0)) take = 25;

      let skip = 0;
      if (page > 1) skip = page * take - take;
      totalData = await context.prisma.hubSpreeData.count({
        where: {
          active: true,
          Status: status,
          tenant_id: {
            in: tenantId
          },
          OR: [
            {
              hub_id: {
                in: hubId
              }
            },
            {
              OR: [
                {
                  hub: {
                    name: {
                      contains: keyword
                    }
                  }
                },
                {
                  tenant: {
                    customer: {
                      some: {
                        customer_type_id: 3,
                        active: true,
                        name: {
                          contains: keyword
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      });
      totalPage = take !== 0 ? Math.ceil(totalData / take) : 1;

      const getActiveSpree = await context.prisma.hubSpreeData.findMany({
        where: {
          active: true,
          tenant_id: {
            in: tenantId
          },
          OR: [
            {
              hub_id: {
                in: hubId
              }
            },
            {
              OR: [
                {
                  hub: {
                    name: {
                      contains: keyword
                    }
                  }
                },
                {
                  tenant: {
                    customer: {
                      some: {
                        customer_type_id: 3,
                        active: true,
                        name: {
                          contains: keyword
                        }
                      }
                    }
                  }
                }
              ]
            }
          ]
        },
        include: {
          hub: true,
          tenant: {
            include: {
              customer: {
                where: {
                  customer_type_id: 3,
                  active: true
                },
                take: 1
              }
            }
          }
        },
        orderBy: { id: 'desc' },
        skip: skip,
        take: take
      });

      const getData = await context.prisma.preOrderItem.findMany({
        where: {
          active: true,
          pre_order: {
            order_status_id: {
              in: [-1, -2, 11, 14, 16]
            },
            delivery_date: {
              in: getActiveSpree.map((x) => x.delivery_date)
            }
          },
          order_item_status_id: {
            in: [-1, -2, 11, 14, 16]
          },
          sku: {
            product: {
              tenant_id: {
                in: tenantId
              }
            }
          }
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  tenant: {
                    include: {
                      customer: {
                        where: {
                          customer_type_id: 3,
                          active: true
                        },
                        take: 1
                      }
                    }
                  }
                }
              }
            }
          },
          pool_item: {
            include: {
              pool: true
            }
          },
          hub: true,
          pre_order: true,
          user: true
        },
        orderBy: [{ order_id: 'desc' }, { customer_buyer_id: 'asc' }, { sku_id: 'asc' }]
      });

      if (getActiveSpree.length > 0) {
        for (const Spreedata of getActiveSpree) {
          ret.push({
            collection_point_name: Spreedata.hub.name,
            supplier: Spreedata.tenant.customer[0].name,
            total_buyer: 0,
            total_Purchase: 0,
            minimum_order: Spreedata.tenant.customer[0].minimum_order,
            completion: 0,
            delivery_date: new Date(Spreedata.delivery_date).toISOString(),
            details: []
          });
        }
      }

      let index = 0;
      if (getData.length > 0) {
        for (const hubData of ret) {
          const hubFilter: any = getData.filter(
            (x) =>
              x.hub.name === hubData.collection_point_name &&
              new Date(x.pre_order.delivery_date).toISOString() ===
                new Date(hubData.delivery_date).toISOString()
          );
          const totalBuyer = [...new Set(hubFilter.map((x) => x.user_id))].length;
          const totalNonPooling: number = hubFilter
            .filter((x) => x.sku.is_b2c_pooling === false)
            .map((x) => {
              return { total_price: x.total_price, tax: x.tax };
            })
            .reduce((a, b) => {
              return Number(a) + Number(Number(b.total_price) + Number(b.tax));
            }, 0);
          const totalPooling: number = hubFilter
            .filter((x) => x.sku.is_b2c_pooling === true)
            .map((x) => x.pool_item)[0]
            ?.filter((x) => x.pool.is_fullfilled === true)
            .reduce((a, b) => {
              return Number(a) + Number(Number(b.total_price) + Number(b.tax));
            }, 0);
          const totalPurchase = Number(totalNonPooling) + Number(totalPooling);
          let completion = totalPurchase > 0 ? (totalPurchase / hubData.minimum_order) * 100 : 0.0;
          completion = completion > 100 ? 100.0 : completion;
          ret[index].total_buyer = totalBuyer;
          ret[index].total_Purchase = totalPurchase.toFixed(2);
          ret[index].completion = totalPurchase > 0 ? completion.toFixed(2) : 0.0;

          const skuList = [...new Set(hubFilter.map((x) => x.sku_id))];
          let indexSku = 0;
          for (const skuId of skuList) {
            const skuDetails = hubFilter.filter((x) => x.sku_id === skuId);
            const inProgress =
              skuDetails[0].sku.is_b2c_pooling === false
                ? '-'
                : skuDetails
                    .map((x) => x.pool_item)?.[0]
                    ?.filter((x) => !x.pool.is_fullfilled)
                    ?.map((x) => x.pool.pool_qty)
                    .reduce((a, b) => {
                      return Number(a) + Number(b);
                    }, 0) || 0;
            const outstanding =
              skuDetails[0].sku.is_b2c_pooling === false
                ? '-'
                : skuDetails
                    .map((x) => x.pool_item)?.[0]
                    ?.filter((x) => !x.pool.is_fullfilled)
                    ?.map((x) => x.pool.remaining_qty)?.[0] || 0;
            ret[index].details.push({
              sku_id: skuDetails[0].sku.id,
              sku: skuDetails[0].sku.name,
              pooling: skuDetails[0].sku.is_b2c_pooling,
              quantity: skuDetails
                .map((x) => x.total_qty)
                .reduce((a, b) => {
                  return Number(a) + Number(b);
                }, 0),
              in_progress: inProgress !== '-' ? inProgress - outstanding : inProgress,
              outstanding: outstanding,
              buyer_info: []
            });
            const userIdList = [...new Set(skuDetails.map((x) => x.user_id))];
            for (const userId of userIdList) {
              const buyerDetails = hubFilter.filter((x) => x.sku_id === skuId && x.user_id === userId);
              const totalOrder = buyerDetails
                .filter((x) => x.sku_id === skuId)
                .reduce((a, b) => {
                  return Number(a) + Number(b.total_qty);
                }, 0);
              const totalPrice: number = buyerDetails
                .filter((x) => x.sku_id === skuId)
                .reduce((a, b) => {
                  return Number(a) + Number(Number(b.total_price) + Number(b.tax));
                }, 0);
              ret[index].details[indexSku].buyer_info.push({
                full_name: buyerDetails[0].user.first_name.concat(' ', buyerDetails[0].user.last_name),
                mobile: buyerDetails[0].user.mobile,
                total_order: totalOrder,
                total_price: totalPrice.toFixed(2),
                pooling_status:
                  buyerDetails[0].sku.is_b2c_pooling === false
                    ? 'non pooling item'
                    : buyerDetails.map((x) => x.pool_item).filter((x) => !x.is_fullfilled).length > 0
                    ? new Date(buyerDetails[0].pre_order.delivery_date) <= new Date()
                      ? 'pool not success but spree not closed'
                      : 'pool still on progress'
                    : 'pool successfull'
              });
            }
            indexSku++;
          }
          index++;
        }
      }
      return {
        CollectionPointStatusHeader: ret,
        total_rows: totalData ? totalData : 0,
        total_page: totalPage ? totalPage : 0
      };
    }
  });
});
