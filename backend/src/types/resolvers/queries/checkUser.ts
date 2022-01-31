import { queryField, nonNull, stringArg } from 'nexus';
import { AuthenticationError } from 'apollo-server-errors';
import twilio = require('twilio');
const env = process.env;

export const checkUser = queryField('checkUser', {
  type: 'User',
  args: {
    email: stringArg(),
    mobile: stringArg(),
    otp: stringArg()
  },
  resolve: async (_parent, args, ctx) => {
    let user;
    let twilioResponse;
    if (args.email) {
      user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ mobile: args.mobile }, { email: args.email }]
        }
      });
    } else {
      user = await ctx.prisma.user.findFirst({
        where: {
          mobile: args.mobile
        }
      });
    }

    if (!user) {
      const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      if (!args.otp) {
        await twilioClient.verify
          .services(env.TWILIO_VERIFY_SID)
          .verifications.create({ to: `+${args.mobile}`, channel: 'sms' })
          .then((verification) => (twilioResponse = verification));
        if (twilioResponse.serviceSid && twilioResponse.status === 'pending') {
          return null;
        } else {
          throw new AuthenticationError(`Verification failed !`);
        }
      } else {
        await twilioClient.verify
          .services(env.TWILIO_VERIFY_SID)
          .verificationChecks.create({ to: `+${args.mobile}`, code: `${args.otp}` })
          .then((verification_check) => (twilioResponse = verification_check));
        if (twilioResponse.status === 'approved') {
          return true;
        } else {
          throw new AuthenticationError(`Verification failed !`);
        }
      }
    } else {
      return user;
    }
  }
});
