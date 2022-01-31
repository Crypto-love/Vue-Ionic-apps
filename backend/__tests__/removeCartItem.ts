import { CartItem } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const dummyCartItem = ({
  id: '692c6038-3e27-4c77-8abf-baa5807211d3',
  cart_id: '65bdbbb6-d23f-4d8f-90ea-08d7b3e3f5bf',
  sku_id: 1007,
  price: 100.0,
  order_quantity: 1,
  order_weight: 1.0,
  created_at: new Date(),
  updated_at: new Date()
} as unknown) as CartItem;

async function removeCartItem(cartItemId: string) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
    mutation removeCartItem {
      removeCartItem(id: "${cartItemId}")
    }
  `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can remove item from cart', async () => {
    context.prisma.cartItem.findUnique.mockResolvedValueOnce(dummyCartItem);

    const result = await removeCartItem(dummyCartItem.id);

    expect(result).toMatchObject({
      removeCartItem: true
    });
  });

  it("user can`'t remove item from cart because of invalid cart item id`", async () => {
    const result = await removeCartItem(dummyCartItem.id);

    expect(result).toMatchObject({
      data: {
        removeCartItem: null
      },
      errors: [
        {
          message: 'Item not found'
        }
      ]
    });
  });
});
