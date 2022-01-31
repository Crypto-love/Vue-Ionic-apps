import { PrismaClient } from '@treedots/prisma';

export const reduceInventory = async (
  prismaCtx: PrismaClient,
  inventoriesUpdateInfo: Array<JSON>
): Promise<void> => {
  for (let i = 0; i < inventoriesUpdateInfo.length; i++) {
    const info = inventoriesUpdateInfo[i];
    await prismaCtx.inventory.update({
      where: { id: info['id'] },
      data: { quantity: info['quantity'] }
    });
  }
};
