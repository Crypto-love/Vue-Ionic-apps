import { Cart, Customer } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2094, userTypeId: 6, buyerType: null, country: null };
const context = createTestContext(userInfo);

const dummyCustomer = {
  id: 1807,
  name: 'Demo Company'
} as Customer;

const dummyCart = {
  id: 'f37a9967-dfbb-4e4f-93a1-6d5ac30e65c2',
  user_id: 2094,
  customer_id: dummyCustomer.id,
  created_at: new Date(),
  updated_at: new Date(),
  items: [
    {
      id: '32541edf-6b55-4628-893d-8949cefdffbe',
      order_quantity: 1,
      order_weight: 1,
      price: 10,
      sku: {
        id: 1,
        name: 'Batang Steak'
      }
    },
    {
      id: '32541edf-6b55-4628-893d-8949cefdfffe',
      order_quantity: 1,
      order_weight: 2,
      price: 7.5,
      sku: {
        id: 2,
        name: 'Chicken Wing'
      }
    }
  ]
} as Cart;

async function getCart(customerId: number) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      query {
        getCartByCustomerId(customer_id: ${customerId}) {
          created_at
          customer_id
          id
          updated_at
          user_id
        }
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can fetch their existing cart', async () => {
    context.prisma.cart.findFirst.mockResolvedValueOnce(dummyCart);

    const result = await getCart(dummyCart.customer_id);

    expect(result).toMatchObject({
      getCartByCustomerId: {
        created_at: expect.any(String),
        customer_id: dummyCart.customer_id,
        id: dummyCart.id,
        updated_at: expect.any(String),
        user_id: dummyCart.user_id
      }
    });
  });

  it('user can fetch their new cart', async () => {
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyCustomer);

    context.prisma.cart.create.mockResolvedValueOnce(dummyCart);

    const result = await getCart(dummyCart.customer_id);

    expect(result).toMatchObject({
      getCartByCustomerId: {
        created_at: expect.any(String),
        customer_id: dummyCart.customer_id,
        id: dummyCart.id,
        updated_at: expect.any(String),
        user_id: dummyCart.user_id
      }
    });
  });

  it("user can't fetch their cart because of invalid customer id", async () => {
    const result = await getCart(-1);

    expect(result).toMatchObject({
      data: {
        getCartByCustomerId: null
      },
      errors: [
        {
          message: 'Invalid Company' || 'Invalid Hub'
        }
      ]
    });
  });
});
