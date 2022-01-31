export const calculateDiscountAmount = (voucherDiscount, voucherDiscountType, totalOrderAmount) => {
  let discountAmount = 0;

  switch (voucherDiscountType) {
    case 'AMOUNT':
      discountAmount = Number(voucherDiscount);
      break;
    case 'PERCENT':
      discountAmount = totalOrderAmount * (Number(voucherDiscount) / 100);
      break;
    default:
      discountAmount = 0;
      break;
  }

  return discountAmount;
};

export const redeemVoucher = async (options, context) => {
  const payloadItems = [];
  options.orderItems.forEach((item) => {
    payloadItems.push({
      product_id: item.sku.id,
      quantity: item.order_quantity,
      price: Number(item.sku.b2c_unit_price) * 100,
      product: {
        metadata: {
          id: item.sku.id,
          tenantId: item.sku.product.tenant.id
        }
      }
    });
  });

  const payload = {
    vouchercode: options.vouchercode,
    row: {
      customer: {
        source_id: options.user.id,
        email: options.user.email,
        name: `${options.user.first_name}${options.user.last_name ? ' ' + options.user.last_name : ''}`,
        metadata: {
          phone: options.user.mobile
        }
      },
      order: {
        amount: Number(Number(options.totalOrderAmount).toFixed(2)) * 100,
        items: payloadItems
      },
      metadata: {
        b2B: false,
        b2C: true,
        locale: options.user.country.name
      }
    }
  };
  await context.voucherify.addRedemtionVoucher(payload);
};
