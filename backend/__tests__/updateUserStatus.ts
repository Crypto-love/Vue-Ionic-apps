import { User } from '@prisma/client';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2 };
const ctx = createTestContext(userInfo);

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

async function updateUserStatus(userId: number, active: boolean) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(
      `
        mutation {
          updateUserStatus (userId: ${userId}, active: ${active}) {
            id
            active
          }
        }
      `
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user is set to not active', async () => {
    dummyUser.active = false;
    ctx.prisma.user.update.mockResolvedValueOnce(dummyUser);

    const result = await updateUserStatus(2094, false);

    expect(result).toMatchObject({
      updateUserStatus: {
        id: 2094,
        active: false
      }
    });
  });
  it('user is set to active', async () => {
    dummyUser.active = true;
    ctx.prisma.user.update.mockResolvedValueOnce(dummyUser);

    const result = await updateUserStatus(2094, true);

    expect(result).toMatchObject({
      updateUserStatus: {
        id: 2094,
        active: true
      }
    });
  });
});
