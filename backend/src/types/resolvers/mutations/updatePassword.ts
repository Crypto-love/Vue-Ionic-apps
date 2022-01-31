import { hash } from 'bcryptjs';
import { mutationField, nonNull, stringArg, intArg } from 'nexus';
import { decipher } from '../../utils/chipper';

export const updatePassword = mutationField('updatePassword', {
  type: 'User',
  args: {
    userId: nonNull(intArg()),
    password: nonNull(stringArg())
  },
  resolve: async (_parent, { userId, password }, ctx) => {
    const decipherFunction = decipher();
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: userId
      }
    });
    const sterilizedPassword = await decipherFunction(password);
    const hashedPassword = await hash(sterilizedPassword, 10);
    await ctx.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        passwordV3: hashedPassword
      }
    });
    return user;
  }
});
