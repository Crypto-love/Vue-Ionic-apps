import { booleanArg, queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const categories = queryField((t) => {
  t.list.field('categories', {
    type: 'MainCategory',
    args: {
      active: booleanArg()
    },
    resolve: async (_, { active }, context) => {
      const credential = getUserCredentials(context);
      const user = await context.prisma.user.findFirst({
        where: { id: credential.userId },
        select: { email: true }
      });
      if (user.email) {
        context.clevertap.uploadEvents([
          { identity: user.email, name: 'Click home page', data: { properties: 'suppliers' } }
        ]);
      }

      return context.prisma.mainCategory.findMany({
        where: {
          active: active,
          id: { gt: 0 }
        }
      });
    }
  });
});
