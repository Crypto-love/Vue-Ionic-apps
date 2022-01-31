describe('ensure that', () => {
  it.todo('user does not sign up with an existing account');
  it.todo('user already exist');
});

// import { User } from '@treedots/prisma';
// import { createTestContext } from './__helper';

// const ctx = createTestContext();
// const expectedData = {
//   checkUser: null
// };
// const existingData = {
//   checkUser: {
//     email: expect.any(String),
//     first_name: expect.any(String),
//     last_name: expect.any(String),
//     mobile: expect.any(String)
//   }
// };

// const dummyUser = {
//   active: true,
//   address: '',
//   birth_date: new Date(),
//   password: '747b7a79787f7e7d',
//   passwordV3: '',
//   buyer_type: 1,
//   country_id: 193,
//   email: 'demotest@thetreedots.com',
//   first_name: 'demo',
//   gender: 'm',
//   id: 2094,
//   image: null,
//   last_name: 'buyer',
//   mobile: '65123165423',
//   stripe_card_id: 'card_123',
//   stripe_customer_id: 'cus_123',
//   user_type_id: 6,
//   username: 'demobuyer'
// } as User;

// async function checkUser(email: string, mobile: string) {
//   try {
//     return await ctx.client.request(`
//       query {
//         checkUser(
//           mobile: "${mobile}",
//           email: "${email}"
//         ) {
//           email
//           mobile
//           first_name
//           last_name
//         }
//       }`);
//   } catch (error) {
//     return error.response || error;
//   }
// }

// describe('ensure that', () => {
//   it('user does not sign up with an existing account', async () => {
//     const newEmail = 'this_is_a_new_email@gmailcom';
//     const newMobile = '53674747869856';

//     const checkUserResult = await checkUser(newEmail, newMobile);

//     expect(checkUserResult).toMatchObject(expectedData);
//   });

//   it('user already exist', async () => {
//     ctx.prisma.user.findFirst.mockResolvedValueOnce(dummyUser);
//     const checkUserResult = await checkUser(dummyUser.email, dummyUser.mobile);
//     expect(checkUserResult).toMatchObject(existingData);
//   });
// });
