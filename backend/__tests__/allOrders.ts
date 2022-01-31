describe('ensure that', () => {
  it.todo('customer can see all orders');
});

// import { createTestContext } from './__helper';
// import { testData } from './__testData';

// const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
// const ctx = createTestContext(userInfo);

// const dataRequest = `
//   id
//   order_status_id
// `;

// async function allOrders(active: boolean) {
//   try {
//     return await ctx.client.setHeader('Authorization', ctx.token).request(`
//       query {
//         allOrders(
//           active: ${active}
//         ) {
//           ${dataRequest}
//         }
//       }
//     `);
//   } catch (e) {
//     return e.response || e;
//   }
// }

// describe('ensure that', function () {
//   it('customer can see all orders', async () => {
//     const result = await allOrders(true);
//     expect(result).toMatchObject({
//       allOrders: dataRequest
//     });
//   });
// });
