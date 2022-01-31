import { queryField, nonNull, stringArg } from 'nexus';
import { AuthenticationError } from 'apollo-server-errors';
import { getUserCredentials } from '../../utils/auth';
import { decipher } from '../../utils/chipper';
import { compare } from 'bcryptjs';

export const checkOldPassword = queryField('checkOldPassword', {
  type: 'User',
  args: {
    password: nonNull(stringArg())
  },
  resolve: async (_parent, args, ctx) => {
    const credential = getUserCredentials(ctx);
    const decipherFunction = decipher();
    const sterilizedPassword = await decipherFunction(args.password);
    const user = await ctx.prisma.user.findUnique({
      where: { id: credential.userId }
    });
    if (user) {
      const passwordValid = await compare(sterilizedPassword, user.passwordV3);
      if (!passwordValid) {
        throw new AuthenticationError('Invalid password');
      }
      return user;
    } else {
      throw new AuthenticationError('User Not Found');
    }
  }
});
