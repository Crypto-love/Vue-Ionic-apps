import { User } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { Voucherify } from '../src/types/services/voucherify/voucherify';
import { dummyB2cUser } from './__testData';

const context = createTestContext(dummyB2cUser);
const mockVoucherify = jest.fn();

const voucherCode = 'voucherify.io-10-amount-off';

const itemDummyRedemption = {
  item: {
    voucher_code: voucherCode,
    customer_id: 1,
    source_id: 'qty',
    customer_name: 'tes',
    amount_order: 12,
    metadata_locale: 'q',
    metadata_b2b: false,
    metadata_b2c: true,
    metadata_hub_name: '',
    items: [
      {
        order_item_product_id: 1,
        order_item_product_qty: 1,
        order_item_product_price: 2
      }
    ]
  }
};

const dummyUser = {
  id: 2208,
  email: 'test@thetreedots.com',
  mobile: '6587654321',
  first_name: 'foo',
  last_name: 'bar',
  username: 'foobar',
  password: 'test'
} as User;

jest.mock('../src/types/services/voucherify/voucherify');

beforeEach(() => {
  mockVoucherify.mockClear();
});

async function voucherRedemption(item: unknown) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `
        mutation voucherRedemption ($item: VoucherifyInputType!) {
          voucherRedemption(item: $item)
        }
      `,
      item
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('check voucher reedemption', async () => {
    const mockRedemptionResult = {
      customer: {
        email: dummyUser.email
      },
      voucher: {
        code: voucherCode
      }
    };
    Voucherify.prototype.addRedemtionVoucher = mockVoucherify;
    mockVoucherify.mockResolvedValueOnce(mockRedemptionResult);

    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);
    const result = await voucherRedemption(itemDummyRedemption);

    expect(result).toMatchObject({
      voucherRedemption: mockRedemptionResult
    });
  });

  it("user can't redeem voucher", async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);
    Voucherify.prototype.addRedemtionVoucher = mockVoucherify;
    mockVoucherify.mockResolvedValueOnce(null);

    const result = await voucherRedemption(itemDummyRedemption);

    expect(result).toMatchObject({
      voucherRedemption: null
    });
  });
});
