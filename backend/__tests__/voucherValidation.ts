import { User } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { Voucherify } from '../src/types/services/voucherify/voucherify';
import { dummyB2cUser } from './__testData';

const context = createTestContext(dummyB2cUser);
const mockVoucherify = jest.fn();

const voucherCode = 'voucherify.io-10-amount-off';

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

async function voucherValidation(vouchercode: string) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      mutation voucherValidation {
        voucherValidation(vouchercode: "${vouchercode}")
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('check voucher validation before user reedemption', async () => {
    context.prisma.user.findUnique.mockResolvedValueOnce(dummyUser);
    Voucherify.prototype.validationVoucher = mockVoucherify;
    mockVoucherify.mockResolvedValueOnce({ code: voucherCode, valid: true });

    const result = await voucherValidation(voucherCode);

    expect(result).toMatchObject({
      voucherValidation: {
        code: voucherCode,
        valid: true
      }
    });
  });
});
