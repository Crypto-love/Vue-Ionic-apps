describe('ensure that', () => {
  it.todo('user can fetch all categories');
  it.todo('user can fetch only active categories');
  it.todo('user can fetch only inactive categories');
});

// import { Category, MainCategory } from '@treedots/prisma';
// import { createTestContext } from './__helper';

// const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
// const context = createTestContext(userInfo);

// const dummyMainCategories = [
//   {
//     id: 1,
//     name: 'Meat',
//     active: true
//   },
//   {
//     id: 2,
//     name: 'Seafood',
//     active: true
//   },
//   {
//     id: 3,
//     name: 'Snack',
//     active: false
//   },
//   {
//     id: 4,
//     name: 'Vegetables',
//     active: true
//   }
// ] as MainCategory[];

// async function getCategoriesAndSubCategories(isActive: boolean) {
//   const dataRequest = `{
//     id
//     name
//     description
//     active
//   }`;

//   try {
//     return await context.client.setHeader('Authorization', context.token).request(
//       isActive !== null
//         ? `query {
//         categories(isActive: ${isActive}') ${dataRequest}
//       }`
//         : `query {
//         categories ${dataRequest}
//       }`
//     );
//   } catch (error) {
//     return error.response || error;
//   }
// }

// describe('ensure that', () => {
//   it('user can fetch all categories', async () => {
//     context.prisma.mainCategory.findMany.mockResolvedValueOnce(dummyMainCategories);

//     const result = await getCategoriesAndSubCategories(null);

//     expect(result).toMatchObject({
//       categories: dummyMainCategories
//     });
//   });

//   it('user can fetch only active categories', async () => {
//     const activeMainCategories = dummyMainCategories.filter((v) => v.active === true);
//     context.prisma.mainCategory.findMany.mockResolvedValueOnce(activeMainCategories);

//     const result = await getCategoriesAndSubCategories(null);

//     expect(result).toMatchObject({
//       categories: activeMainCategories
//     });
//   });

//   it('user can fetch only inactive categories', async () => {
//     const inactiveMainCategories = dummyMainCategories.filter((v) => v.active === false);
//     context.prisma.mainCategory.findMany.mockResolvedValueOnce(inactiveMainCategories);

//     const result = await getCategoriesAndSubCategories(null);

//     expect(result).toMatchObject({
//       categories: inactiveMainCategories
//     });
//   });
// });
