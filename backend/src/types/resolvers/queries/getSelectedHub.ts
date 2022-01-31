import { queryField } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const getSelectedHub = queryField((t) => {
  t.field('getSelectedHub', {
    type: 'UserHub',
    resolve: async (_parent, _, context) => {
      const credential = getUserCredentials(context);

      return await context.prisma.userHub.findFirst({
        where: { user_id: credential.userId }
      });
    }
  });
});
