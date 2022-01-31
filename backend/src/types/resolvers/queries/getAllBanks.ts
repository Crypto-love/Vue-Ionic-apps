import { intArg, nonNull, queryField } from 'nexus';

export const getAllBanks = queryField((t) => {
  t.list.field('getAllBanks', {
    type: 'Bank',
    args: {
      countryId: nonNull(intArg())
    },
    resolve: async (_, { countryId }, ctx) => {
      return ctx.prisma.bank.findMany({
        where: {
          country_id: countryId
        }
      });
    }
  });
});
