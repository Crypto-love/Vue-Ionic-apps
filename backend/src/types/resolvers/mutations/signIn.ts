import { compare, hash } from 'bcryptjs';
import { mutationField, nonNull, stringArg } from 'nexus';

import { generateJWT } from '../../utils/auth';
import { AuthenticationError } from 'apollo-server-errors';
import { USER_SIGNED_IN } from '../Subscription';
import { decipher } from '../../utils/chipper';
import { v1 as uuidv1 } from 'uuid';

/**
 * This endpoint is used to confirm a credential to sign in in our platform
 * Accept:
 *  @ identity : String
 *  -- identity of the credential, such as email, mobile number, username
 *  @ password : String
 * Return:
 *  @ JWT Token
 *  @ v2's token (secret)
 *  @ User's data
 * Note:
 * This endpoint also need to facilitate account's old password that was exist in
 * legacy code of v2 application. The flow is when the system receive the request
 * to login, we will check the data from our database. If exist then we will check if v3's password
 * is exist. If it exist, then we will authenticate normally using bcrypt comparison.
 * If it isn't exist, then we will need to authenticate the password with v2's password in our DB.
 * In case the result is true and correct, then we will need to deciphering the password and then encrypt it
 * to Bcrypt before we reauthenticate the new password to generate a JWT Token.
 * To support this deciphering and ciphering process, we are borrowing the function that exist in v2 apps, which
 * is located in src/types/utils/chipper.
 */
export const signIn = mutationField('signIn', {
  type: 'User',
  args: {
    identity: nonNull(stringArg()),
    password: nonNull(stringArg())
  },
  resolve: async (_parent, { identity, password }, ctx) => {
    const { pubsub } = ctx;
    const decipherFunction = decipher();
    const v2Secret = await uuidv1();
    const user = await ctx.prisma.user.findFirst({
      include: {
        country: true
      },
      where: {
        OR: [
          {
            mobile: identity
          },
          {
            email: identity
          },
          {
            username: identity
          }
        ]
      }
    });
    if (!user) {
      throw new AuthenticationError(`No user found for that identity: ${identity}`);
    }
    if (user?.user_type_id !== 1) {
      throw new AuthenticationError(`Only for Superadmin users`);
    }
    const sterilizedPassword = await decipherFunction(password);
    const hashedPassword = await hash(sterilizedPassword, 10);
    if (!user.passwordV3) {
      if (user.password !== password) {
        throw new AuthenticationError('Invalid password');
      }
      const created = await ctx.prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          passwordV3: hashedPassword
        }
      });
      const passwordValid = await compare(sterilizedPassword, hashedPassword);
      if (!passwordValid) {
        throw new AuthenticationError('Invalid password');
      }
      pubsub.publish(USER_SIGNED_IN, user);
      await saveUserSession(ctx.prisma, user, v2Secret);

      // upload event to clevertap
      ctx.clevertap.uploadEvents([
        {
          identity: `${user.email}`,
          name: 'Successful sign in',
          data: {
            'User ID': user.id,
            Name: `${user.first_name} ${user.last_name}`,
            Email: user.email,
            'Account Type': user.user_type_id,
            Country: user.country.name,
            Phone: user.mobile,
            'Login In with phone': identity === user.mobile,
            'Login with email': identity === user.email,
            'Login date': new Date()
          }
        }
      ]);

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
      const passwordValid = await compare(sterilizedPassword, user.passwordV3);
      if (!passwordValid) {
        throw new AuthenticationError('Invalid password');
      }
      pubsub.publish(USER_SIGNED_IN, user);
      await saveUserSession(ctx.prisma, user, v2Secret);
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
    }
  }
});

/**
 * Need to insert / update user_sessions table
 * because some of v2 API use the data from that table
 */
async function saveUserSession(prisma, user, v2Secret: string) {
  await prisma.userSession.upsert({
    where: {
      id: user.id
    },
    update: {
      token: v2Secret
    },
    create: {
      id: user.id,
      token: v2Secret
    }
  });
}
