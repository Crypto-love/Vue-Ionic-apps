import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, arg } from 'nexus';
import { decipher } from '../../utils/chipper';
import { hash } from 'bcryptjs';
import { slackPostMessage } from './../../services/slack/index';
import { getNewDate } from '../../utils/dateTime';
const env = process.env;

/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns status add user and person. If success return true, else return error
 * @param country_code
 * @param customer_id
 * @param email
 * @param mobile
 * @param first_name
 * @param last_name
 * @param user_type_id
 * @param buyer_type
 * @param password
 * @return status success (true or error)
 * */
export const addUser = mutationField('addUser', {
  type: 'Boolean',
  args: {
    item: nonNull(
      arg({
        type: 'AddUserInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    try {
      const {
        customer_id,
        country_id,
        email,
        mobile,
        first_name,
        last_name,
        user_type_id,
        buyer_type,
        password
      } = item;

      const decipherFunction = decipher();
      const sterilizedPassword = await decipherFunction(password);
      const hashedPassword = await hash(sterilizedPassword, 10);
      const user = await ctx.prisma.user.create({
        data: {
          email: email,
          mobile: mobile,
          passwordV3: hashedPassword,
          first_name: first_name,
          last_name: last_name,
          country_id: country_id,
          user_type_id: user_type_id,
          buyer_type: buyer_type,
          date_created: getNewDate()
        }
      });
      if (customer_id) {
        const userCustomer = await ctx.prisma.userCustomer.create({
          data: {
            customer_id,
            user_id: user.id
          }
        });
      }
      // Send message to slack if b2bSignup and b2cSignup
      if (user_type_id === 6 && (buyer_type === 1 || buyer_type === 2)) {
        const channel = buyer_type === 1 ? 'sysB2BSignup' : 'sysB2CSignup';
        const msgType = buyer_type === 1 ? 'b2bSignup' : 'b2cSignup';
        await slackPostMessage(channel, 'New user is registered', msgType, {
          first_name,
          last_name,
          email,
          mobile
        });
      }

      const fullName = first_name + ' ' + last_name;
      const country = country_id == 193 ? 'SG' : 'MY';

      // Upload User Profile
      const responseProfile = await ctx.clevertap.uploadProfiles([
        {
          identity: user.id,
          data: {
            Name: fullName,
            Email: email,
            Phone: `+${mobile}`,
            Country: country,
            User_ID: user.id,
            Date_created: getNewDate(),
            'MSG-email': true
          }
        }
      ]);
      // Track Event
      const responseEvent = await ctx.clevertap.uploadEvents([
        {
          identity: email,
          name: 'Successful sign up',
          data: {
            Name: fullName,
            Email: email,
            Type: buyer_type,
            Country: country,
            Phone: `+${mobile}`,
            User_ID: user.id,
            Date_Joined: getNewDate()
          }
        }
      ]);
      return true;
    } catch (e) {
      console.log(e);
    }
  }
});
