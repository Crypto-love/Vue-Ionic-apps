import { User } from '@prisma/client';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummyUsers = ([
  {
    id: 2208,
    email: 'demo_b2c@gmail.com',
    mobile: '62123123',
    first_name: 'demo',
    last_name: 'b2c',
    full_name: 'demo b2c',
    user_type_id: 9
  },
  {
    id: 6632,
    email: 'advocatehub@gmail.com',
    mobile: '09090909',
    first_name: 'Advocate',
    last_name: 'Hub',
    full_name: 'Advocate Hub',
    user_type_id: 9
  }
] as any) as User[];

async function getUsersByTypeId(typeId: number) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(`
      query {
        getUsersByTypeId (userTypeId: ${typeId}) {
          id
          email
          mobile
          first_name
          last_name
          full_name
          user_type_id
        }
      }
    `);
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user can get advocates', async () => {
    ctx.prisma.user.findMany.mockResolvedValueOnce(dummyUsers);

    const result = await getUsersByTypeId(9);

    expect(result).toMatchObject({
      getUsersByTypeId: dummyUsers
    });
  });
});
