import { queryField, intArg, nonNull } from 'nexus';
import { UserInputError } from 'apollo-server-errors';

export const getB2cUserByTenant = queryField((t) => {
  t.list.field('getB2cUserByTenant', {
    type: 'User',
    args: {
      tenantId: nonNull(intArg())
    },
    resolve: async (_, { tenantId }, { prisma }) => {
      const tenant = await prisma.customer.findFirst({
        where: {
          customer_type_id: 3,
          tenant_id: tenantId
        },
        include: { addresses: true }
      });
      if (!tenant) throw new UserInputError('Tenant not found');
      if (!tenant.addresses) return [];

      return prisma.user.findMany({
        where: {
          active: true,
          country_id: tenant.addresses[0].country_id,
          OR: [
            {
              user_type_id: 11
            },
            {
              buyer_type: 2,
              user_type_id: 6
            }
          ]
        }
      });
    }
  });
});
