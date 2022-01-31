import { intArg, queryField, nonNull } from 'nexus';

export const getAddress = queryField((t) => {
  t.list.field('getAddress', {
    type: 'Address',
    args: {
      customerId: intArg(),
      addressTypeId: intArg()
    },
    resolve: async (_, { customerId, addressTypeId }, context) => {
      return context.prisma.address.findMany({
        where: {
          customer_id: customerId,
          AND: [
            {
              address_type_id: {
                not: 3
              }
            },
            {
              address_type_id: addressTypeId
            }
          ]
        }
      });
    }
  });
});
