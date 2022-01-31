describe('ensure that', () => {
  it.todo('user can cancel non-pooling order item and the payment will be refunded partially');
  it.todo('user can cancel pooling order item and the payment will be refunded partialy');
  it.todo("user can't cancel order item due to invalid id");
  it.todo('user can\'t cancel order item as order status is not "Processing in Hub"');
  it.todo('user can\'t cancel order item as its status is not "Processing in Hub"');
});

// import { PoolItems, PreOrder, PreOrderItem } from '@treedots/prisma';
// import { createTestContext } from './__helper';
// import { dummyB2cUser } from './__testData';
// import stripeHelper from '../src/types/services/payment/stripe';

// const context = createTestContext(dummyB2cUser);

// const preOrder = {
//   id: 1,
//   order_status_id: -2,
//   payment_status_id: 3,
//   stripe_transaction_id: 'FOO_BAR'
// };

// const preOrderItem = {
//   id: 1201,
//   order_id: preOrder.id,
//   sku_id: 1,
//   order_item_status_id: -2,
//   active: 1,
//   total_qty: 2,
//   sku: {
//     is_b2c_pooling: false
//   }
// };

// async function cancelB2cOrderItem(id: number) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(
//       `
//     mutation cancelB2cOrderItem {
//       cancelB2cOrderItem(id: ${id}) {
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

// describe('ensure that', () => {
//   it('user can cancel non-pooling order item and the payment will be refunded partially', async () => {
//     const dummyPreOrderItem = ({
//       ...preOrderItem,
//       pre_order: preOrder
//     } as any) as PreOrderItem;
//     context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItem);

//     stripeHelper.refundPaymentIntent = jest.fn().mockReturnValue({
//       httpStatus: 200
//     });

//     const dummyPreOrder = ({
//       ...preOrder,
//       pre_order_item: [
//         {
//           ...preOrderItem,
//           order_item_status_id: 13,
//           active: 0
//         }
//       ]
//     } as any) as PreOrder;
//     context.prisma.preOrder.findUnique.mockResolvedValue(dummyPreOrder);

//     const result = await cancelB2cOrderItem(dummyPreOrder.id);

//     expect(result).toMatchObject({
//       cancelB2cOrderItem: {
//         id: dummyPreOrder.id
//       }
//     });
//   });

//   it('user can cancel pooling order item and the payment will be refunded partialy', async () => {
//     const dummyPreOrderItem = ({
//       ...preOrderItem,
//       sku: {
//         is_b2c_pooling: true
//       },
//       pre_order: preOrder
//     } as any) as PreOrderItem;

//     const dummyPoolItem = ({
//       id: preOrderItem.id + 1000, // Any number
//       qty: preOrderItem.total_qty,
//       pool: {
//         remaining_qty: 0
//       }
//     } as any) as PoolItems;

//     context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItem);

//     context.prisma.poolItems.findFirst.mockResolvedValueOnce(dummyPoolItem);

//     stripeHelper.refundPaymentIntent = jest.fn().mockReturnValue({
//       httpStatus: 200
//     });

//     const dummyPreOrder = ({
//       ...preOrder,
//       pre_order_item: [
//         {
//           ...preOrderItem,
//           order_item_status_id: 13,
//           active: 0
//         }
//       ]
//     } as any) as PreOrder;
//     context.prisma.preOrder.findUnique.mockResolvedValue(dummyPreOrder);

//     const result = await cancelB2cOrderItem(dummyPreOrder.id);

//     expect(result).toMatchObject({
//       cancelB2cOrderItem: {
//         id: dummyPreOrder.id
//       }
//     });
//   });

//   it("user can't cancel order item because of invalid id", async () => {
//     const result = await cancelB2cOrderItem(1);

//     expect(result).toMatchObject({
//       data: {
//         cancelB2cOrderItem: null
//       },
//       errors: [
//         {
//           message: 'Item not found'
//         }
//       ]
//     });
//   });

//   it('user can\'t cancel order item because of order status is not "Processing in Hub"', async () => {
//     const dummyPreOrderItem = ({
//       ...preOrderItem,
//       sku: {
//         is_b2c_pooling: true
//       },
//       pre_order: {
//         ...preOrder,
//         order_status_id: 1
//       }
//     } as any) as PreOrderItem;

//     context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItem);

//     const result = await cancelB2cOrderItem(dummyPreOrderItem.id);

//     expect(result).toMatchObject({
//       data: {
//         cancelB2cOrderItem: null
//       },
//       errors: [
//         {
//           message: 'Cannot cancel item because the order is not in processing'
//         }
//       ]
//     });
//   });

//   it('user can\'t cancel order item because its status is not "Processing in Hub"', async () => {
//     const dummyPreOrderItem = ({
//       ...preOrderItem,
//       order_item_status_id: 1,
//       sku: {
//         is_b2c_pooling: true
//       },
//       pre_order: preOrder
//     } as any) as PreOrderItem;

//     context.prisma.preOrderItem.findUnique.mockResolvedValueOnce(dummyPreOrderItem);

//     const result = await cancelB2cOrderItem(dummyPreOrderItem.id);

//     expect(result).toMatchObject({
//       data: {
//         cancelB2cOrderItem: null
//       },
//       errors: [
//         {
//           message: 'Only processing item can be cancelled'
//         }
//       ]
//     });
//   });
// });
