import { arg, intArg, nonNull, queryField } from 'nexus';

//for basic info except supplier internal user can use api that already use now
//for groupbuy setting except get collection point by supplier can use api that already use now
//for business setting except get merchants by supplier can use api that already use now
export const getSupplierBasicInfo = queryField((t) => {
  t.field('getSupplierBasicInfo', {
    type: 'Tenant',
    args: {
      supplierId: nonNull(intArg())
    },
    resolve: async (_, args, ctx) => {
      return ctx.prisma.tenant.findFirst({
        where: {
          id: args.supplierId
        }
      });
    }
  });
});

export const getSupplierStatementAccount = queryField((t) => {
  t.list.field('getSupplierStatementAccount', {
    type: 'SupplierStatementOfAccountSetting',
    args: {
      supplierId: nonNull(intArg())
    },
    resolve: async (_, args, ctx) => {
      return ctx.prisma.supplierStatementOfAccountSetting.findMany({
        where: {
          supplier_id: args.supplierId
        }
      });
    }
  });
});

export const getSupplierPostPaymentMethod = queryField((t) => {
  t.list.field('getSupplierPostPaymentMethod', {
    type: 'SupplierPaymentMethod',
    args: {
      supplierId: nonNull(intArg())
    },
    resolve: async (_, args, ctx) => {
      return ctx.prisma.supplierPaymentMethod.findMany({
        where: {
          supplier_id: args.supplierId
        }
      });
    }
  });
});
