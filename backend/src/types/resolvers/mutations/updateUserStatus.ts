import { mutationField, nonNull, intArg, booleanArg } from 'nexus';

export const updateUserStatus = mutationField('updateUserStatus', {
  type: 'User',
  args: {
    userId: nonNull(intArg()),
    active: booleanArg()
  },
  resolve: async (_parent, { userId, active }, ctx) => {
    return await ctx.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        active: active
      }
    });
  }
});
