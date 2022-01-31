import { Customer, UserHub, User, Address } from '@treedots/prisma';
import { createTestContext } from './__helper';

const userInfo = { userId: 2208, userTypeId: 6, buyerType: 2, country: null };
const context = createTestContext(userInfo);

const dummyUserHub = {
  id: 1,
  user_id: 2208,
  hub_id: 1440,
  hub_join_date: new Date(),
  tutorial_tick_status: 0
} as UserHub;

const dummyHub = ({
  id: 1440,
  name: 'Hub B B2C',
  alias_name: 'Hub B',
  addresses: [
    {
      id: 1,
      street_number: '10',
      road: 'Pier Rd',
      address_type_id: 1
    }
  ] as Address[]
} as unknown) as Customer;

const dummyUser = {
  id: 2208,
  email: 'test@thetreedots.com',
  first_name: 'foo',
  last_name: 'bar',
  username: 'foobar',
  password: 'test'
} as User;

async function joinHub(hubId: number, appMode: string) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      mutation {
        joinHub(hub_id: ${hubId}, appMode: "${appMode}")
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can join hub for the first time', async () => {
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyHub);
    context.prisma.userHub.findFirst.mockResolvedValueOnce(false);
    context.prisma.userHub.create.mockResolvedValueOnce(dummyUserHub);
    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);
    context.prisma.customer.findUnique.mockResolvedValueOnce(dummyHub);
    const result = await joinHub(dummyHub.id, 'dev');

    expect(result).toMatchObject({ joinHub: { newJoinChat: true, success: true } });
  });

  it('user can re-join hub', async () => {
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyHub);
    context.prisma.userHub.findFirst.mockResolvedValueOnce(dummyUserHub);
    context.prisma.userHub.update.mockResolvedValueOnce(dummyUserHub);
    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);
    context.prisma.customer.findUnique.mockResolvedValueOnce(dummyHub);
    context.clevertap.uploadEvents = jest.fn().mockResolvedValueOnce(true);
    const result = await joinHub(dummyHub.id, 'dev');

    expect(result).toMatchObject({
      joinHub: {
        newJoinChat: true,
        success: true
      }
    });
  });

  it('user cannot join hub caused by invalid hub id', async () => {
    context.prisma.customer.findFirst.mockResolvedValueOnce(false);
    const result = await joinHub(-1, 'dev');

    expect(result).toMatchObject({
      data: {
        joinHub: null
      },
      errors: [
        {
          message: 'Invalid Hub'
        }
      ]
    });
  });
});
