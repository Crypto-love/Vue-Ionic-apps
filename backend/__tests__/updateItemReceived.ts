import { PreOrderItem } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2 };
const ctx = createTestContext(userInfo);

const dataRequest = `
  success
`;

const id_pre_order_item = 67556;

async function updateItemReceived(id: number) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      mutation {
        updateItemReceived(
          id: ${id}
        ) {
          ${dataRequest}
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('User can update pre_order_item', async () => {
    ctx.prisma.preOrderItem.findFirst.mockResolvedValueOnce({ id: id_pre_order_item } as PreOrderItem);
    const result = await updateItemReceived(id_pre_order_item);
    expect(result).toMatchObject({
      updateItemReceived: { success: true }
    });
  });
});
