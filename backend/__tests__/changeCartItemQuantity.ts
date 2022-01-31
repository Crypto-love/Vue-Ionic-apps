import { CartItem } from '@treedots/prisma';
import { Decimal } from '@prisma/client/runtime';
import { createTestContext } from './__helper';

const userInfo = { userId: 2094, userTypeId: 6, buyerType: null, country: null };
const context = createTestContext(userInfo);

const dummyCartItem = ({
  cart_id: 'f37a9967-dfbb-4e4f-93a1-6d5ac30e65c2',
  sku_id: 1,
  price: 10.0,
  order_quantity: 1,
  order_weight: 1,
  id: '32541edf-6b55-4628-893d-8949cefdffbe',
  created_at: new Date(),
  updated_at: new Date()
} as unknown) as CartItem;

async function changeCartItemQuantity(id: string, orderQuantity: number, orderWeight: number) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
    mutation {
      changeCartItemQuantity(id: "${id}", order_quantity: ${orderQuantity}, order_weight: ${orderWeight}) {
        cart_id
        created_at
        id
        order_quantity
        order_weight
        price
        sku_id
        updated_at
      }
    }
  `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it("user can adjust item's quantity and weight", async () => {
    const quantity = 11;
    const weight = 110;

    context.prisma.cartItem.findUnique.mockResolvedValueOnce(dummyCartItem);

    const updatedDummyCartItem = dummyCartItem;
    updatedDummyCartItem.order_quantity = quantity;
    updatedDummyCartItem.order_weight = (weight as unknown) as Decimal;
    context.prisma.cartItem.update.mockResolvedValueOnce(updatedDummyCartItem);

    const result = await changeCartItemQuantity(dummyCartItem.id, quantity, weight);

    expect(result).toMatchObject({
      changeCartItemQuantity: {
        cart_id: updatedDummyCartItem.cart_id,
        created_at: expect.any(String),
        id: dummyCartItem.id,
        order_quantity: quantity,
        order_weight: weight,
        sku_id: updatedDummyCartItem.sku_id,
        updated_at: expect.any(String)
      }
    });
  });

  it("user cannot change item's quantity or weight because of invalid item cart id", async () => {
    const quantity = 1;
    const weight = 10;

    const result = await changeCartItemQuantity('FOOBAR', quantity, weight);

    expect(result).toMatchObject({
      errors: [
        {
          message: 'Item not found'
        }
      ]
    });
  });

  it("user cannot change item's quantity or weight because sending null as quantity and weight", async () => {
    const result = await changeCartItemQuantity(dummyCartItem.id, null, null);

    expect(result).toMatchObject({
      errors: [
        {
          message: 'Expected value of type "Int!", found null.'
        },
        {
          message: 'Expected value of type "Float!", found null.'
        }
      ]
    });
  });
});
