import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg } from 'nexus';
/*
 * @param supplier_id
 * @param state_id
 * @return true or error
 * */
export const deleteSupplierState = mutationField('deleteSupplierState', {
  type: 'Boolean',
  args: {
    supplier_id: nonNull(intArg()),
    state_id: nonNull(intArg())
  },
  resolve: async (_parent, { supplier_id, state_id }, ctx) => {
    const supplierState = await ctx.prisma.supplierState.findUnique({
      where: {
        supplier_id_state_id: {
          supplier_id: supplier_id,
          state_id: state_id
        }
      }
    });

    if (!supplierState) throw new UserInputError('Data not found');

    await ctx.prisma.supplierState.delete({
      where: {
        supplier_id_state_id: {
          supplier_id: supplierState.supplier_id,
          state_id: supplierState.state_id
        }
      }
    });

    return true;
  }
});
