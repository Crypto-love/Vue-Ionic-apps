export async function TenantListData(hubId: number, countryId: number, ctxPrisma: any) {
  const curentDateTime: any = new Date();
  curentDateTime.setHours(curentDateTime.getHours() + 8);
  const sprees = await ctxPrisma.hubSpreeData.findMany({
    where: {
      hub_id: hubId,
      active: true,
      Status: 0,
      start_date: {
        lte: curentDateTime
      },
      end_date: {
        gte: curentDateTime
      },
      hub: {
        active: true,
        customer_type_id: 2,
        addresses: {
          some: {
            country_id: countryId
          }
        },
        hub: true
      },
      tenant: {
        tenant: {
          active: true,
          customer_type_id: 3,
          addresses: {
            some: {
              country_id: countryId
            }
          }
        }
      }
    },
    select: {
      tenant_id: true
    },
    distinct: ['tenant_id']
  });

  return await sprees.map((spree) => spree.tenant_id);
}
