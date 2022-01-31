import { mutationField, nonNull, stringArg } from 'nexus';
import { APP_SECRET, generateJWT } from '../../utils/auth';
import { sign } from 'jsonwebtoken';
import { v1 as uuidv1 } from 'uuid';
import { AuthenticationError } from 'apollo-server-errors';
import twilio = require('twilio');
const env = process.env;

/**
 * This endpoint is used to confirm a credential to sign in in our platform
 * Accept:
 *  @ phoneNumber : String
 *  -- identity of the credential that using customer's mobile number
 *  @ OTP : String
 *  -- optional, if this data is null then we will request Twilio to send OTP code, if isn't then will verify it.
 * Return:
 *  @ JWT Token
 *  @ v2's token (secret)
 *  @ User's data
 * Note:
 * This endpoint is similar with signIn in term of functionality, the different is
 * this endpoint have a dependency with twilio, where we are authenticate costumer's
 * credentials using Twilio Verify.
 */
export const signInWithOTP = mutationField('signInWithOTP', {
  type: 'User',
  args: {
    phoneNumber: nonNull(stringArg()),
    OTP: stringArg()
  },
  resolve: async (_parent, { phoneNumber, OTP }, ctx) => {
    const { pubsub } = ctx;
    const v2Secret = await uuidv1();
    let twilioResponse;
    const user = await ctx.prisma.user.findUnique({
      include: {
        country: true
      },
      where: {
        mobile: phoneNumber
      }
    });
    if (!user) {
      throw new AuthenticationError(`Mobile number isn't registered: ${phoneNumber}`);
    }
    const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    if (!OTP) {
      await twilioClient.verify
        .services(env.TWILIO_VERIFY_SID)
        .verifications.create({ to: `+${phoneNumber}`, channel: 'sms' })
        .then((verification) => (twilioResponse = verification));
      if (twilioResponse.serviceSid && twilioResponse.status === 'pending') {
      } else {
        throw new AuthenticationError(`Verification failed !`);
      }
    } else {
      await twilioClient.verify
        .services(env.TWILIO_VERIFY_SID)
        .verificationChecks.create({ to: `+${phoneNumber}`, code: `${OTP}` })
        .then((verification_check) => (twilioResponse = verification_check));
      if (twilioResponse.status === 'approved') {
        // return {
        //   tokenJWT: sign(
        //     {
        //       userId: user.id,
        //       userTypeId: user.user_type_id,
        //       buyerType: user.buyer_type
        //     },
        //     APP_SECRET
        //   ),
        //   token: v2Secret,
        //   ...user
        // };

        return {
          tokenJWT: generateJWT({
            userId: user.id,
            userTypeId: user.user_type_id,
            buyerType: user.buyer_type,
            country: user.country
          }),
          token: v2Secret,
          ...user
        };
      } else {
        throw new AuthenticationError(`Verification failed !`);
      }
    }
  }
});
