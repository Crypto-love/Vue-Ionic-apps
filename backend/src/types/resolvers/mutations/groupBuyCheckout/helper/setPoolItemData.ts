export async function setPoolItemData(poolItemData, preOrderItemId, context) {
  const poolItemCreate = await context.prisma.poolItems.create({
    data: {
      pool: {
        connect: {
          id: poolItemData.poolId
        }
      },
      PreOrderItem: {
        connect: {
          id: preOrderItemId
        }
      },
      qty: poolItemData.qty,
      user_id: poolItemData.user_id
    }
  });
  return poolItemCreate;
}
