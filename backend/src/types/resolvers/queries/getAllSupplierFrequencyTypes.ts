import { queryField } from 'nexus';

export const getAllSupplierFrequencyTypes = queryField((t) => {
  t.list.field('getAllSupplierFrequencyTypes', {
    type: 'SupplierFrequencyType',
    args: {},
    resolve: async (_, _args, ctx) => {
      return ctx.prisma.supplierFrequencyType.findMany({
        where: {
          active: true
        }
      });
    }
  });
});
