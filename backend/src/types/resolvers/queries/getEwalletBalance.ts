import { PrismaClient, EWallet, User } from '@treedots/prisma';
import { UserInputError } from 'apollo-server-express';
import { intArg, nonNull, queryField } from 'nexus';
import xfersApi from '@treedots/xfers';

export const getEwalletBalance = queryField('getEwalletBalance', {
  type: 'EWalletBalance',
  args: {
    userId: nonNull(intArg())
  },
  resolve: async (_, { userId }, { prisma, credential, request }) => {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    let eWallet: EWallet;
    if (user.e_wallet_id) {
      eWallet = await prisma.eWallet.findUnique({ where: { id: user.e_wallet_id } });
    } else {
      eWallet = await createUserEwallet(prisma, user);
    }

    const available = await getEwalletAvailableBalance(prisma, eWallet.id);

    const locked = Number(eWallet.locked_balance) > 0 ? eWallet.locked_balance : 0;

    const requestBody = request.req.body.query;
    const pending_withdraw =
      requestBody && requestBody.includes('pending_withdraw')
        ? await getEwalletPendingWithdrawBalance(prisma, eWallet.id)
        : 0;

    return {
      available,
      locked,
      pending_withdraw
    };
  }
});

export const createUserEwallet = async (prisma: PrismaClient, user: User): Promise<EWallet> => {
  if (user.country_id !== 193)
    throw new UserInputError("Sorry, your region isn't support e-wallet at the moment");

  // Registration id length for nasional_id must be 4 to 20 alphanumeric
  const registrationId = String(user.id).padStart(4, '0');

  // Create Xfer Customer
  let customerName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  if (customerName.length < 4) customerName = `Buyer ${customerName}`;
  const res = await xfersApi.registerCustomerProfile({
    customerName: customerName,
    registrationType: 'national_id',
    registrationId: registrationId
  });

  if (res.errors && res.errors.length > 0) throw new UserInputError(res.errors[0].detail);
  else if (res.error) throw new Error(res.error);

  // Create E-Wallet
  const country = await prisma.country.findUnique({
    where: { id: user.country_id }
  });
  const eWallet = await prisma.eWallet.create({
    data: {
      xfers_customer_id: res.data.id,
      currency_code: country.currency_code,
      currency_symbol: country.currency_symbol
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { e_wallet_id: eWallet.id }
  });

  return eWallet;
};

export const getEwalletAvailableBalance = async (prisma: PrismaClient, eWalletId: number) => {
  const balance = await prisma.eWalletTransaction.aggregate({
    sum: {
      amount: true
    },
    where: {
      e_wallet_id: eWalletId,
      active: true,
      OR: [
        { transaction_status_id: 2 }, // Complete
        { transaction_type_id: 2, transaction_status_id: 1 } // Pending withdrawal
      ]
    }
  });

  return Number(balance.sum.amount);
};

export const getEwalletPendingWithdrawBalance = async (prisma: PrismaClient, eWalletId: number) => {
  const balance = await prisma.eWalletTransaction.aggregate({
    sum: {
      amount: true
    },
    where: {
      e_wallet_id: eWalletId,
      active: true,
      transaction_type_id: 2, // Withdraw
      transaction_status_id: 1 // Pending
    }
  });

  return Math.abs(Number(balance.sum.amount));
};
