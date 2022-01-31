export async function supplierData(listOfTenantInSprees: any, ctxPrisma: any) {
  const tenants = await ctxPrisma.tenant.findMany({
    where: {
      id: {
        in: listOfTenantInSprees
      }
    },
    orderBy: [{ id: 'asc' }]
  });
  const suppliers = tenants.slice(0, 6);
  return suppliers;
}
