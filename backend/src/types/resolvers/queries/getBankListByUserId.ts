import { intArg, queryField } from 'nexus';

export const getBankListByUserId = queryField((t) => {
  t.list.field('getBankListByUserId', {
    type: 'BankDetail',
    args: {
      userId: intArg()
    },
    resolve: async (_parent, { userId }, ctx) => {
      return ctx.prisma.bankDetail.findMany({
        where: {
          user_id: userId
        }
      });
    }
  });
});
