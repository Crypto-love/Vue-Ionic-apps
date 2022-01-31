export async function groupByProductData(listOfTenantInSprees: any, ctxPrisma: any) {
  const days = 14; //last logic from JC only take 2 week order
  const date = new Date();
  const sevenPastDay = new Date(date.setTime(date.getTime() + 8 - days * 24 * 60 * 60 * 1000)); // getTime() + 8 to force use SG timezone
  const timeNow = sevenPastDay.toISOString();
  const skusListData = await ctxPrisma.preOrderItem.groupBy({
    by: ['sku_id'],
    sum: {
      total_qty: true
    },
    where: {
      active: true,
      sku: {
        active: true,
        b2c: true,
        is_b2c_pooling: true,
        product: {
          tenant_id: {
            in: listOfTenantInSprees
          }
        }
      },
      pre_order: {
        delivery_date: {
          gte: timeNow
        }
      }
    },
    orderBy: {
      _sum: {
        total_qty: 'desc'
      }
    },
    take: 6
  });
  const sku = await ctxPrisma.sku.findMany({
    where: {
      id: {
        in: skusListData.map((x: any) => x.sku_id)
      }
    },
    include: {
      product: true
    }
  });

  const product = await ctxPrisma.product.findMany({
    where: {
      id: {
        in: sku.map((x: any) => x.product_id)
      }
    }
  });

  for (let index = 0; index < product.length; index++) {
    const data = product[index];
    const skuData = sku.filter((x) => x.product_id === data.id)[0];
    data.total_order = skusListData.filter((x) => x.sku_id === skuData.id).map((y) => y.sum.total_qty)[0];
  }
  return await product.sort((a: any, b: any) => b.total_order - a.total_order);
}
