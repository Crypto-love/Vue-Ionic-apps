import { queryField } from 'nexus';

export const getVersions = queryField((t) => {
  t.list.field('getVersions', {
    type: 'Version',
    resolve: (_parent, _args, context) => {
      return context.prisma.version.findMany();
    }
  });
});
