export async function categoryData(ctxPrisma: any) {
  // GetAllCategories
  const categories = await ctxPrisma.mainCategory.findMany({
    where: {
      id: {
        gt: 0
      },
      active: true
    }
  });
  return categories;
}
