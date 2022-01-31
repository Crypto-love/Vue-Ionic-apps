import { Voucherify } from '../src/types/services/voucherify/voucherify';
import { dummyB2cUser } from './__testData';
import { createTestContext } from './__helper';

const context = createTestContext(dummyB2cUser);
const mockVoucherify = jest.fn();

jest.mock('../src/types/services/voucherify/voucherify');

beforeEach(() => {
  mockVoucherify.mockClear();
});

async function checkVoucher(vouchercode: string) {
  try {
    return await context.client.setHeader('Authorization', context.token).request(`
      mutation checkVoucher {
        checkVoucher(vouchercode: "${vouchercode}")
      }
    `);
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it('user can check existing voucher', async () => {
    const existingVoucherCode = 'EXIST-VOUCHER';
    Voucherify.prototype.getVoucher = mockVoucherify;
    mockVoucherify.mockResolvedValueOnce({
      code: existingVoucherCode
    });

    const result = await checkVoucher(existingVoucherCode);

    expect(result).toMatchObject({
      checkVoucher: {
        code: existingVoucherCode
      }
    });
  });

  it('user can check non-existent voucher', async () => {
    Voucherify.prototype.getVoucher = mockVoucherify;
    mockVoucherify.mockResolvedValueOnce(null);

    const result = await checkVoucher('NON-EXISTENT-VOUCHER');

    expect(result).toMatchObject({
      checkVoucher: null
    });
  });
});
