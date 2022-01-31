describe('ensure that', () => {
  it.todo('user can cancel order where the payment status is uncaptured');
  it.todo('user can cancel order where the payment status is captured');
  it.todo("user can't cancel order because of invalid pre order id");
  it.todo('user can\'t cancel order because of order status is not "Processing in Hub"');
});

// import { PoolItems, PreOrder, Sku } from '@treedots/prisma';
// import { createTestContext } from './__helper';
// import { dummyB2cUser } from './__testData';
// import stripeHelper from '../src/types/services/payment/stripe';

// const context = createTestContext(dummyB2cUser);

// const dummyPreOrderItems = [
//   {
//     id: 1201,
//     sku_id: 1,
//     order_item_status_id: 1,
//     active: 1,
//     total_qty: 2,
//     sku: {
//       is_b2c_pooling: false
//     }
//   },
//   {
//     id: 1202,
//     sku_id: 2,
//     order_item_status_id: 1,
//     active: 1,
//     total_qty: 1,
//     sku: {
//       is_b2c_pooling: true
//     }
//   }
// ];

// async function cancelB2cOrder(id: number) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(
//       `
//     mutation cancelB2cOrder {
//       cancelB2cOrder(id: ${id}) {
//         id
//         order_status_id
//         payment_status_id
//       }
//     }
//   `
//     );
//   } catch (error) {
//     return error.response || error;
//   }
// }

// jest.mock('../src/types/services/payment/stripe', () => ({
//   cancelPaymentIntent: jest.fn(),
//   refundPaymentIntent: jest.fn()
// }));

// describe('ensure that', () => {
//   it('user can cancel order where the payment status is uncaptured', async () => {
//     const dummyPreOrder = ({
//       id: 1,
//       order_status_id: -2,
//       payment_status_id: 2,
//       stripe_transaction_id: 'FOO_BAR',
//       pre_order_item: dummyPreOrderItems
//     } as unknown) as PreOrder;

//     context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);

//     for (const item of dummyPreOrderItems) {
//       context.prisma.sku.findUnique.mockResolvedValueOnce({ is_b2c_pooling: item.sku.is_b2c_pooling } as Sku);

//       if (item.sku.is_b2c_pooling) {
//         context.prisma.poolItems.findFirst.mockResolvedValueOnce(({
//           id: item.id + 1000, // Any number
//           qty: item.total_qty,
//           pool: {
//             remaining_qty: 0
//           }
//         } as unknown) as PoolItems);
//       }
//     }

//     stripeHelper.cancelPaymentIntent = jest.fn().mockReturnValue({
//       httpStatus: 200
//     });

//     context.prisma.preOrder.update.mockResolvedValueOnce({
//       ...dummyPreOrder,
//       order_status_id: 13,
//       payment_status_id: 4
//     });

//     const result = await cancelB2cOrder(dummyPreOrder.id);

//     expect(result).toMatchObject({
//       cancelB2cOrder: {
//         id: dummyPreOrder.id,
//         order_status_id: 13,
//         payment_status_id: 4
//       }
//     });
//   });

//   it('user can cancel order where the payment status is captured', async () => {
//     const dummyPreOrder = ({
//       id: 1,
//       order_status_id: -2,
//       payment_status_id: 3,
//       stripe_transaction_id: 'FOO_BAR',
//       pre_order_item: dummyPreOrderItems
//     } as unknown) as PreOrder;

//     context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);

//     for (const item of dummyPreOrderItems) {
//       context.prisma.sku.findUnique.mockResolvedValueOnce({ is_b2c_pooling: item.sku.is_b2c_pooling } as Sku);

//       if (item.sku.is_b2c_pooling) {
//         context.prisma.poolItems.findFirst.mockResolvedValueOnce(({
//           id: item.id + 1000, // Any number
//           qty: item.total_qty,
//           pool: {
//             remaining_qty: 0
//           }
//         } as unknown) as PoolItems);
//       }
//     }

//     stripeHelper.refundPaymentIntent = jest.fn().mockReturnValue({
//       httpStatus: 200
//     });

//     context.prisma.preOrder.update.mockResolvedValueOnce({
//       ...dummyPreOrder,
//       order_status_id: 13,
//       payment_status_id: 4
//     });

//     const result = await cancelB2cOrder(dummyPreOrder.id);

//     expect(result).toMatchObject({
//       cancelB2cOrder: {
//         id: dummyPreOrder.id,
//         order_status_id: 13,
//         payment_status_id: 4
//       }
//     });
//   });

//   it("user can't cancel order because of invalid pre order id", async () => {
//     const result = await cancelB2cOrder(1);

//     expect(result).toMatchObject({
//       data: {
//         cancelB2cOrder: null
//       },
//       errors: [
//         {
//           message: 'Order not found'
//         }
//       ]
//     });
//   });

//   it('user can\'t cancel order because of order status is not "Processing in Hub"', async () => {
//     const dummyPreOrder = {
//       id: 1,
//       order_status_id: 11 // B2C Processed
//     } as PreOrder;

//     context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);

//     const result = await cancelB2cOrder(dummyPreOrder.id);

//     expect(result).toMatchObject({
//       data: {
//         cancelB2cOrder: null
//       },
//       errors: [
//         {
//           message: 'Only processing order can be cancelled'
//         }
//       ]
//     });
//   });
// });
