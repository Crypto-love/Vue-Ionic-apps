import { mutationField, nonNull, stringArg } from 'nexus';

export const topUpUserBalanceDonation = mutationField('topUpUserBalanceDonation', {
  type: 'Boolean',
  args: {
    jsonTopUpData: nonNull(stringArg())
  },
  resolve: async (_parent, { jsonTopUpData }, ctx) => {
    const topUpData = JSON.parse(jsonTopUpData);
    let topUpResult = false;
    for (let index = 0; index < topUpData.length; index++) {
      const userId = topUpData[index].userId;
      const topUpBalance = topUpData[index].topUpBalance;
      const campaign = topUpData[index].campaign;
      const userData = await ctx.prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      const insertEwalletTransactionData = await ctx.prisma.eWalletTransaction.create({
        data: {
          eWallet: {
            connect: {
              id: userData.e_wallet_id
            }
          },
          type: {
            connect: {
              id: 7 //Donation Top Up
            }
          },
          status: {
            connect: {
              id: 2 //set to complete because no need waiting from xfers
            }
          },
          xfers_payment_id: null, // because top up donation not need  waiting from xfers
          description: `${campaign}`,
          amount: topUpBalance,
          locked_amount: topUpBalance,
          active: true
        }
      });

      const topUp = await ctx.prisma.eWallet.update({
        data: {
          locked_balance: {
            increment: topUpBalance
          }
        },
        where: {
          id: userData.e_wallet_id
        }
      });

      topUpResult = topUp ? true : false;
    }
    return topUpResult;
  }
});
