import { AuthenticationError } from 'apollo-server-errors';
import { mutationField, nonNull, stringArg } from 'nexus';
import { getUserCredentials } from '../../utils/auth';
const env = process.env;

/**
 * This endpoint is used to confirm a credential to sign in in our platform
 * Accept:
 *  @ token : String
 *  -- identity of the credential in form of JWT Token
 * Return:
 *  @ User's data
 * Note:
 * This endpoint actually is used by some several Front End feature where they need
 * to resynchronizing all user's data.
 */
export const me = mutationField('me', {
  type: 'User',
  resolve: async (_parent, _, ctx) => {
    const credential = getUserCredentials(ctx);
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: credential.userId
      }
    });
    if (!user) {
      throw new AuthenticationError(`No user found for that id: ${credential.userId}`);
    }
    return user;
  }
});
