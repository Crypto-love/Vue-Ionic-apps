describe('ensure that', () => {
  it.todo('customer can fetch all supplier in alphabetical order');
  it.todo('customer can fetch all supplier filter by collection point');
});

// import { Customer, HubSpreeData, CustomerTenant } from '.prisma/client';
// import { createTestContext } from './__helper';

// const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
// const context = createTestContext(userInfo);

// // supplier
// const dummyAllSupplier = ([
//   {
//     id: 2034,
//     name: 'Barramundi Asia Pte Ltd',
//     alias_name: null,
//     account_number: '1042',
//     group_id: 2,
//     customer_type_id: 1,
//     collection_type_id: 2,
//     profile: 'Other',
//     halal_products: false,
//     beef_products: false,
//     cod: false,
//     credit_term: null,
//     payment_type: null,
//     delivery_instruction: null,
//     delivery_charge: 0,
//     minimum_order: 0,
//     hub: false,
//     active: true,
//     xero_id: null,
//     voucherify_id: null,
//     direction: null,
//     whatsapp_link: null
//   },
//   {
//     id: 5,
//     name: 'Celsius Link International Pte Ltd',
//     alias_name: null,
//     account_number: '1017',
//     group_id: 2,
//     customer_type_id: 1,
//     collection_type_id: 2,
//     profile: 'Other',
//     halal_products: false,
//     beef_products: false,
//     cod: false,
//     credit_term: 0,
//     payment_type: 0,
//     delivery_instruction: null,
//     delivery_charge: null,
//     minimum_order: 0,
//     hub: false,
//     active: true,
//     xero_id: 'a81a2397-3530-404d-a435-957fb0ad8f17',
//     voucherify_id: null,
//     direction: null,
//     whatsapp_link: null
//   }
// ] as unknown) as Customer[];
// // hub_spree_data
// const dummyHubSpreeData = ([
//   {
//     id: 1,
//     advocate_id: 6632,
//     hub_id: 1897,
//     tenant_id: 1,
//     delivery_date: '2021-05-31T00:00:00.000Z',
//     start_date: '2021-04-22T00:00:00.000Z',
//     end_date: '2020-05-20T00:00:00.000Z',
//     Status: 0,
//     active: true
//   }
// ] as unknown) as HubSpreeData[];
// // customer_tenant
// const dummyCustomerTenant = ([
//   {
//     id: 99,
//     customer_id: 2034,
//     tenant_id: 1,
//     active: true,
//     xero_customer_id: 'test',
//     alias_name: null,
//     cod: false,
//     credit_term: 0,
//     payment_type: 0,
//     delivery_instruction: null,
//     delivery_charge: 10,
//     minimum_order: 0
//   }
// ] as unknown) as CustomerTenant[];

// async function getAllSuppliers(hubId: number) {
//   try {
//     return await context.client.setHeader('Authorization', context.token).request(`
// 		query{
// 			getAllSuppliers(hubId:${hubId}){
// 				id
// 				name
// 				account_number
// 				group_id
// 				customer_type_id
// 				collection_type_id
// 				profile
// 				halal_products
// 				beef_products
// 				cod
// 			}
// 		}
// 		`);
//   } catch (e) {
//     console.log({ e });
//     return e.response || e;
//   }
// }

// describe('ensure that', function () {
//   it('customer can fetch all supplier in alphabetical order', async () => {
//     context.prisma.customer.findMany.mockResolvedValueOnce(dummyAllSupplier);
//     const result = await getAllSuppliers(null);

//     const queryResultFormat = {
//       id: expect.any(Number),
//       name: expect.any(String),
//       account_number: expect.any(String),
//       group_id: expect.any(Number),
//       customer_type_id: expect.any(Number),
//       collection_type_id: expect.any(Number),
//       halal_products: expect.any(Boolean),
//       beef_products: expect.any(Boolean),
//       cod: expect.any(Boolean)
//     };

//     expect(result).toMatchObject({
//       getAllSuppliers: [
//         ...Array(dummyAllSupplier.length)
//           .fill(1)
//           .map(() => queryResultFormat)
//       ]
//     });
//   });

//   it('customer can fetch all supplier filter by collection point', async () => {
//     context.prisma.hubSpreeData.findMany.mockResolvedValueOnce(dummyHubSpreeData);
//     context.prisma.customerTenant.findMany.mockResolvedValueOnce(dummyCustomerTenant);
//     const dummyAllSupplierFilter = dummyAllSupplier.filter(
//       (a) => a.id === dummyCustomerTenant[0].customer_id
//     );
//     context.prisma.customer.findMany.mockResolvedValueOnce(dummyAllSupplierFilter);
//     const result = await getAllSuppliers(1897); // query from specific hub

//     const queryResultFormat = {
//       id: dummyAllSupplierFilter[0].id,
//       name: dummyAllSupplierFilter[0].name,
//       account_number: dummyAllSupplierFilter[0].account_number,
//       group_id: dummyAllSupplierFilter[0].group_id,
//       customer_type_id: dummyAllSupplierFilter[0].customer_type_id,
//       collection_type_id: dummyAllSupplierFilter[0].collection_type_id,
//       halal_products: dummyAllSupplierFilter[0].halal_products,
//       beef_products: dummyAllSupplierFilter[0].beef_products,
//       cod: dummyAllSupplierFilter[0].cod
//     };

//     expect(result).toMatchObject({
//       getAllSuppliers: [queryResultFormat]
//     });
//   });
// });
