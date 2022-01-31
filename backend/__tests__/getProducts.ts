describe('ensure that', () => {
  it.todo('customer can see all product (with category and sub category)');
  it.todo('customer can see only active products (with category and sub category)');
  it.todo('customer can see only inactive products (with category and sub category)');
});

// import { Product } from '@treedots/prisma';
// import { createTestContext } from './__helper';

// const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
// const context = createTestContext(userInfo);

// const dummyProducts = ([
//   {
//     id: 5,
//     category_id: 1,
//     image: 'img5',
//     name: 'Beef Chunk Tender',
//     tenant_id: 1,
//     updated_at: new Date().toISOString(),
//     active: true
//   },
//   {
//     id: 6,
//     category_id: 17,
//     image: 'img6',
//     name: 'Beef Cube',
//     tenant_id: 1,
//     updated_at: new Date().toISOString(),
//     active: false
//   },
//   {
//     id: 7,
//     category_id: 1,
//     image: 'img7',
//     name: 'Beef Cubr',
//     tenant_id: 1,
//     updated_at: new Date().toISOString(),
//     active: true
//   }
// ] as unknown) as Product[];

// async function getProducts(mainCategory: number, subCategory: number, active: boolean, id: number) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(`
//     query {
//       products(
//         mainCategory:${mainCategory ? `${mainCategory}` : null}
//         subCategory:${subCategory ? `${subCategory}` : null}
//         active: ${active}
//         buyerId: ${id}
//       ) {
//           id
//           tenant_id
//           category_id
//           name
//           image
//           voucherify_id
//           created_at
//           updated_at
//           active
//       }
//     }
//   `);
//   } catch (e) {
//     return e.response || e;
//   }
// }

// describe('ensure that', function () {
//   it('customer can see all product (with category and sub category)', async () => {
//     context.prisma.product.findMany.mockResolvedValueOnce(dummyProducts);

//     const result = await getProducts(2, 5, true, 1);

//     expect(result).toMatchObject({
//       products: dummyProducts
//     });
//   });

//   it('customer can see only active products (with category and sub category)', async () => {
//     const filteredProducts = dummyProducts.filter((v) => v.active === true);
//     context.prisma.product.findMany.mockResolvedValueOnce(filteredProducts);

//     const result = await getProducts(2, 5, true, 1440);
//     expect(result).toMatchObject({
//       products: filteredProducts
//     });
//   });

//   it('customer can see only inactive products (with category and sub category)', async () => {
//     const filteredProducts = dummyProducts.filter((v) => v.active === false);
//     context.prisma.product.findMany.mockResolvedValueOnce(filteredProducts);

//     const result = await getProducts(2, 5, true, 1440);
//     expect(result).toMatchObject({
//       products: filteredProducts
//     });
//   });
// });
