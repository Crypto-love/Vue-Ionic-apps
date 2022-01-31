import { booleanArg, queryField } from 'nexus';

export const getCollectionTypes = queryField((t) => {
  t.list.field('getCollectionTypes', {
    type: 'CollectionType',
    args: {
      active: booleanArg()
    },
    resolve: (_, { active }, context) => {
      return context.prisma.collectionType.findMany({
        where: {
          active: active
        },
        orderBy: { id: 'asc' }
      });
    }
  });
});
