import { User } from '@treedots/prisma';
import { createTestContext } from './__helper';

const ctx = createTestContext();
const dummyUser = {
  active: true,
  address: '',
  birth_date: new Date(),
  password: '747b7a79787f7e7d',
  passwordV3: '',
  buyer_type: 1,
  country_id: 193,
  email: 'demotest@thetreedots.com',
  first_name: 'demo',
  gender: 'm',
  id: 2094,
  image: null,
  last_name: 'buyer',
  mobile: '65123165423',
  stripe_card_id: 'card_123',
  stripe_customer_id: 'cus_123',
  user_type_id: 6,
  username: 'demobuyer'
} as User;

const expectedData = {
  addUser: true
};

async function addUser(item: any) {
  try {
    return await ctx.client.request(
      `
        mutation addUser ($item: AddUserInput!) {
          addUser (item: $item)
        }
      `,
      item
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('new user is created', async () => {
    const item = {
      item: {
        first_name: '#TEST_SEND first_name',
        last_name: '#TEST_SEND last_name',
        country_id: 193,
        customer_id: 1,
        email: 'this_is23452325_a_test@email.com',
        mobile: '12346423745646556029',
        user_type_id: 6,
        buyer_type: 1,
        password: '12345678'
      }
    };
    const userCustomer = {
      id: 100,
      user_id: 2094,
      customer_id: 3,
      active: true
    };
    ctx.prisma.user.create.mockResolvedValueOnce(dummyUser);
    ctx.prisma.userCustomer.create.mockResolvedValueOnce(userCustomer);
    const result = await addUser(item);

    expect(result).toMatchObject(expectedData);
  });
});
