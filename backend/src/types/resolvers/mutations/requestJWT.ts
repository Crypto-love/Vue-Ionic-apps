import { AuthenticationError } from 'apollo-server-express';
import { mutationField, stringArg } from 'nexus';
import { generateJWT } from '../../../types/utils/auth';

/**
 * This query is used to generate JWT Token from token that used in V2
 */
export const requestJWT = mutationField((t) => {
  t.field('requestJWT', {
    type: 'User',
    args: {
      oldToken: stringArg()
    },
    resolve: async (_parent, { oldToken }, { prisma }) => {
      if (!oldToken) throw new AuthenticationError('Invalid token');

      const userSession = await prisma.userSession.findFirst({
        where: { token: oldToken }
      });

      if (!userSession) throw new AuthenticationError('Invalid token');

      const user = await prisma.user.findUnique({
        where: { id: userSession.id },
        include: { country: true }
      });

      return {
        tokenJWT: generateJWT({
          userId: user.id,
          userTypeId: user.user_type_id,
          buyerType: user.buyer_type,
          country: user.country
        }),
        token: oldToken,
        ...user
      };
    }
  });
});
