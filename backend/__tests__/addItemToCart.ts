describe('ensure that', () => {
  it.todo('user can add item to new cart');
  it.todo('user can add item to existing cart');
  it.todo('user can add item to cart by amending existing cart item');
  it.todo('user cannot add item to cart because of invalid cart id');
});

// import { Cart, CartItem, Customer } from '@treedots/prisma';
// import { createTestContext } from './__helper';

// const userInfo = { userId: 2094, userTypeId: 6, buyerType: null, country: null };
// const context = createTestContext(userInfo);

// const cartId = 'f37a9967-dfbb-4e4f-93a1-6d5ac30e65c2';

// const dummyCartItem = ({
//   cart_id: cartId,
//   sku_id: 1,
//   price: 10.0,
//   order_quantity: 1,
//   order_weight: 1,
//   id: '32541edf-6b55-4628-893d-8949cefdffbe'
// } as unknown) as CartItem;

// const dummyExistingCart = {
//   id: cartId,
//   user_id: userInfo.userId,
//   customer_id: 1807,
//   created_at: new Date(),
//   updated_at: new Date(),
//   items: [
//     {
//       id: '32541edf-6b55-4628-893d-8949cefdffbe',
//       order_quantity: 1,
//       order_weight: 1,
//       price: 10,
//       sku: {
//         id: 1,
//         name: 'Batang Steak'
//       }
//     },
//     {
//       id: '32541edf-6b55-4628-893d-8949cefdfffe',
//       order_quantity: 1,
//       order_weight: 2,
//       price: 7.5,
//       sku: {
//         id: 2,
//         name: 'Chicken Wing'
//       }
//     }
//   ]
// } as Cart;

// async function addItemToCart(item: any) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(
//       `
//     mutation addItemToCart ($item: CartItemInput!) {
//       addItemToCart(item: $item) {
//         created_at
//         customer_id
//         id
//         updated_at
//         user_id
//       }
//     }
//   `,
//       item
//     );
//   } catch (error) {
//     return error.response || error;
//   }
// }

// describe('ensure that', () => {
//   it('user can add item to new cart', async () => {
//     const customerId = 2100;
//     const newCart = {
//       id: cartId,
//       user_id: userInfo.userId,
//       customer_id: customerId,
//       created_at: new Date(),
//       updated_at: new Date()
//     } as Cart;
//     const item = {
//       item: {
//         customer_id: customerId,
//         order_quantity: 1,
//         order_weight: 1,
//         price: 10,
//         sku_id: 1007
//       }
//     };

//     context.prisma.customer.findFirst.mockResolvedValueOnce({} as Customer);

//     context.prisma.cart.create.mockResolvedValueOnce(newCart);

//     context.prisma.cartItem.findFirst.mockResolvedValueOnce(dummyCartItem);

//     const result = await addItemToCart(item);

//     expect(result).toMatchObject({
//       addItemToCart: {
//         created_at: expect.any(String),
//         customer_id: customerId,
//         id: cartId,
//         updated_at: expect.any(String),
//         user_id: userInfo.userId
//       }
//     });
//   });

//   it('user can add item to existing cart', async () => {
//     const item = {
//       item: {
//         customer_id: dummyExistingCart.customer_id,
//         order_quantity: 1,
//         order_weight: 1,
//         price: 10,
//         sku_id: 1007
//       }
//     };

//     context.prisma.cart.findFirst.mockResolvedValueOnce(dummyExistingCart);

//     const result = await addItemToCart(item);

//     expect(result).toMatchObject({
//       addItemToCart: {
//         created_at: expect.any(String),
//         customer_id: dummyExistingCart.customer_id,
//         id: cartId,
//         updated_at: expect.any(String),
//         user_id: dummyExistingCart.user_id
//       }
//     });
//   });

//   it('user can add item to cart by amending existing cart item', async () => {
//     const item = {
//       item: {
//         customer_id: dummyExistingCart.customer_id,
//         order_quantity: 1,
//         order_weight: 1,
//         price: 10,
//         sku_id: 1007
//       }
//     };

//     context.prisma.cart.findFirst.mockResolvedValueOnce(dummyExistingCart);

//     context.prisma.cartItem.findFirst.mockResolvedValueOnce(dummyCartItem);

//     const result = await addItemToCart(item);

//     expect(result).toMatchObject({
//       addItemToCart: {
//         created_at: expect.any(String),
//         customer_id: dummyExistingCart.customer_id,
//         id: cartId,
//         updated_at: expect.any(String),
//         user_id: dummyExistingCart.user_id
//       }
//     });
//   });

//   it('user cannot add item to cart because of invalid cart id', async () => {
//     const item = {
//       item: {
//         customer_id: -1,
//         order_quantity: 1,
//         order_weight: 1,
//         price: 10,
//         sku_id: 1007
//       }
//     };

//     const result = await addItemToCart(item);

//     expect(result).toMatchObject({
//       data: {
//         addItemToCart: null
//       },
//       errors: [
//         {
//           message: 'Invalid Company'
//         }
//       ]
//     });
//   });
// });
