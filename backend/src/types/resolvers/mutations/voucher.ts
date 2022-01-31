import { mutationField, nonNull, arg, stringArg, booleanArg, floatArg } from 'nexus';
import { getUserCredentials } from '../../utils/auth';

export const checkVoucher = mutationField('checkVoucher', {
  type: 'Json',
  args: {
    vouchercode: nonNull(stringArg())
  },
  resolve: async (_parent, { vouchercode }, ctx) => {
    const result = await ctx.voucherify.getVoucher(vouchercode);

    return result;
  }
});
export const voucherValidation = mutationField('voucherValidation', {
  type: 'Json',
  args: {
    vouchercode: nonNull(stringArg()),
    metadataB2b: booleanArg(),
    metadataB2c: booleanArg(),
    totalAmount: floatArg({ default: 0 })
  },
  resolve: async (_parent, { vouchercode, metadataB2b, metadataB2c, totalAmount }, ctx) => {
    const credential = getUserCredentials(ctx);

    // get user data
    const currentUser = await ctx.prisma.user.findUnique({
      where: { id: credential.userId },
      select: {
        email: true,
        mobile: true,
        first_name: true,
        last_name: true
      }
    });

    const payload = {
      vouchercode: vouchercode,
      row: {
        customer: {
          // id: credential.userId, REMOVE id because this should be vucherify id
          source_id: credential.userId,
          email: currentUser.email,
          name: `${currentUser.first_name}${currentUser.last_name ? ' ' + currentUser.last_name : ''}`,
          metadata: {
            phone: currentUser.mobile
          }
        },
        order: {
          amount: (totalAmount * 100).toFixed(0)
        },
        metadata: {
          b2B: metadataB2b,
          b2C: metadataB2c,
          locale: credential.country?.name,
          countryId: credential.country?.id
        }
      }
    };

    const result = await ctx.voucherify.validationVoucher(payload);

    return result;
  }
});

export const voucherRedemption = mutationField('voucherRedemption', {
  type: 'Json',
  args: {
    item: nonNull(
      arg({
        type: 'VoucherifyInputType'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const credential = getUserCredentials(ctx);

    // get user data
    const currentUser = await ctx.prisma.user.findUnique({
      where: { id: credential.userId },
      select: {
        email: true,
        mobile: true,
        first_name: true,
        last_name: true
      }
    });

    const payloadItems = [];
    item.items.forEach((x) => {
      payloadItems.push({
        product_id: x.order_item_product_id,
        quantity: x.order_item_product_qty,
        price: x.order_item_product_price
      });
    });
    const payload = {
      vouchercode: item.voucher_code,
      row: {
        customer: {
          source_id: credential.userId,
          email: currentUser.email,
          name: `${currentUser.first_name}${currentUser.last_name ? ' ' + currentUser.last_name : ''}`,
          metadata: {
            phone: currentUser.mobile
          }
        },
        order: {
          amount: item.amount_order,
          items: payloadItems
        },
        metadata: {
          locale: item.metadata_locale,
          b2B: item.metadata_b2b,
          b2C: item.metadata_b2c
        }
      }
    };
    const result = await ctx.voucherify.addRedemtionVoucher(payload);
    return result;
  }
});
