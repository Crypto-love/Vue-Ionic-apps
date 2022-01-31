import { intArg, queryField } from 'nexus';

export const allStates = queryField((t) => {
  t.list.field('allStates', {
    type: 'State',
    args: {
      country_id: intArg()
    },
    resolve: (_, { country_id }, context) => {
      return context.prisma.state.findMany({
        where: { country_id: country_id || undefined }
      });
    }
  });
});
