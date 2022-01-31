import { intArg, mutationField, nonNull } from 'nexus';

export const tagBusinessCustomer = mutationField('tagBusinessCustomer', {
  type: 'Boolean',
  args: {
    userId: nonNull(intArg()),
    customerId: nonNull(intArg())
  },
  resolve: async (_, { userId, customerId }, ctx) => {
    const checkUserCustomer = await ctx.prisma.userCustomer.findFirst({
      where: {
        user_id: userId,
        customer_id: customerId
      }
    });
    if (checkUserCustomer) {
      const tag = await ctx.prisma.userCustomer.update({
        data: {
          user_id: userId,
          customer_id: customerId,
          active: true
        },
        where: {
          id: checkUserCustomer.id
        }
      });
      return tag.id > 0 ? true : false;
    } else {
      const tag = await ctx.prisma.userCustomer.create({
        data: {
          user_id: userId,
          customer_id: customerId,
          active: true
        }
      });
      return tag.id > 0 ? true : false;
    }
  }
});

export const untagBusinessCustomer = mutationField('untagBusinessCustomer', {
  type: 'Boolean',
  args: {
    userId: nonNull(intArg()),
    customerId: nonNull(intArg())
  },
  resolve: async (_, { userId, customerId }, ctx) => {
    const checkUserCustomer = await ctx.prisma.userCustomer.findFirst({
      where: {
        user_id: userId,
        customer_id: customerId
      }
    });
    if (checkUserCustomer) {
      const untag = await ctx.prisma.userCustomer.update({
        data: {
          user_id: userId,
          customer_id: customerId,
          active: false
        },
        where: {
          id: checkUserCustomer.id
        }
      });
      return untag.id > 0 ? true : false;
    }
    return true;
  }
});
