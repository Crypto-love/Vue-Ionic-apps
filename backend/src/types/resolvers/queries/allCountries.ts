import { booleanArg, queryField } from 'nexus';

export const allCountries = queryField((t) => {
  t.list.field('allCountries', {
    type: 'Country',
    args: {
      active: booleanArg()
    },
    resolve: (_, { active }, context) => {
      return context.prisma.country.findMany({
        where: { active: active || undefined }
      });
    }
  });
});
