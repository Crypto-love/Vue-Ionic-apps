describe('ensure that', () => {
  it.todo('user can create tenant');
  it.todo('user cannot create tenant');
});

// import { createTestContext } from './__helper';
// import { testData } from './__testData';

// const ctx = createTestContext();
// const token = testData.token;

// const dataRequest = `{
//   id
//   registration_number
//   tax_registration_number
//   tax_rate
//   email
//   first_name
//   last_name
//   email_notification
//   class_id
//   default_credit_card_term
//   tenant{
//     id
//     name
//     account_number
//     alias_name
//     customer_type_id
//     collection_type_id
//     delivery_instruction
//     delivery_charge
//     payment_type
//     minimum_order
//     hub
//     halal_products
//     cod
//     credit_term
//     xero_id
//     voucherify_id
//     active
//     profile
//   }
// }`;

// async function createTenant(item: any) {
//   try {
//     return await ctx.client.setHeader('Authorization', token).request(
//       `
//         mutation createTenant($item: TenantInput!) {
//           createTenant(item: $item)
//           ${dataRequest}
//         }
//       `,
//       item
//     );
//   } catch (error) {
//     return error.response || error;
//   }
// }

// describe('ensure that', () => {
//   it('user can create tenant', async () => {
//     const item = {
//       item: {
//         name: 'few',
//         account_number: '1',
//         alias_name: '1',
//         customer_type_id: 3,
//         collection_type_id: 1,
//         delivery_instruction: 'few',
//         delivery_charge: 1,
//         payment_type: 1,
//         minimum_order: 1,
//         hub: true,
//         halal_products: true,
//         cod: true,
//         credit_term: 43,
//         xero_id: 'few',
//         voucherify_id: '1',
//         active: true,
//         profile: 'FEW',

//         registration_number: 'num',
//         tax_registration_number: 'num',
//         tax_rate: 1.2,
//         email: 'emai@yahoo.com',
//         first_name: 'few',
//         last_name: 'few',
//         email_notification: 1,
//         class_id: 1,
//         default_credit_card_term: 1
//       }
//     };
//     const result = await createTenant(item);
//     expect(result).toMatchObject({
//       createTenant: {
//         id: expect.any(Number),
//         registration_number: expect.any(String),
//         tax_registration_number: expect.any(String),
//         tax_rate: expect.any(Number),
//         email: expect.any(String),
//         first_name: expect.any(String),
//         last_name: expect.any(String),
//         email_notification: expect.any(Number),
//         class_id: expect.any(Number),
//         default_credit_card_term: expect.any(Number),
//         tenant: {
//           id: expect.any(Number),
//           name: expect.any(String),
//           account_number: expect.any(String),
//           alias_name: expect.any(String),
//           customer_type_id: expect.any(Number),
//           collection_type_id: expect.any(Number),
//           delivery_instruction: expect.any(String),
//           delivery_charge: expect.any(Number),
//           payment_type: expect.any(Number),
//           minimum_order: expect.any(Number),
//           hub: expect.any(Boolean),
//           halal_products: expect.any(Boolean),
//           cod: expect.any(Boolean),
//           credit_term: expect.any(Number),
//           xero_id: expect.any(String),
//           voucherify_id: expect.any(String),
//           active: expect.any(Boolean),
//           profile: expect.any(String)
//         }
//       }
//     });
//   });

//   it('user cannot create tenant', async () => {
//     const item = {
//       item: {
//         name: 'few',
//         account_number: '1',
//         alias_name: '1',
//         customer_type_id: 3,
//         collection_type_id: null,
//         delivery_instruction: 'few',
//         delivery_charge: 1,
//         payment_type: 1,
//         minimum_order: 1,
//         hub: true,
//         halal_products: true,
//         cod: true,
//         credit_term: 43,
//         xero_id: 'few',
//         voucherify_id: '1',
//         active: true,
//         profile: 'FEW',

//         registration_number: 'num',
//         tax_registration_number: 'num',
//         tax_rate: 1.2,
//         email: 'emai@yahoo.com',
//         first_name: 'few',
//         last_name: 'few',
//         email_notification: 1,
//         class_id: 1,
//         default_credit_card_term: 1
//       }
//     };
//     const result = await createTenant(item);
//     expect(result).toMatchObject({
//       errors: [
//         {
//           message: 'Internal server error'
//         }
//       ]
//     });
//   });
// });
