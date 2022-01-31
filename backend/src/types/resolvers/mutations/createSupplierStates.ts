import { mutationField, nonNull, list, intArg } from 'nexus';

export const createSupplierStates = mutationField('createSupplierStates', {
  type: 'Boolean',
  args: {
    supplier_id: nonNull(intArg()),
    states: list(intArg())
  },
  resolve: async (_parent, { supplier_id, states }, ctx) => {
    let supplier_states = [];

    if (states.length > 0) {
      supplier_states = states.map((state_id) => {
        return {
          supplier_id: supplier_id,
          state_id: state_id
        };
      });
    }

    const create = await ctx.prisma.supplierState.createMany({
      data: supplier_states,
      skipDuplicates: true
    });

    if (create.count > 0) {
      return true;
    } else {
      return false;
    }
  }
});
