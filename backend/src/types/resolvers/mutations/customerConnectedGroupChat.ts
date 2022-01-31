import { mutationField, nonNull, stringArg } from 'nexus';
import axios from 'axios';

const env = process.env;
const url = env.SENDBIRD_URL;
const token = env.SENDBIRD_TOKEN;

export const customerConnectedGroupChat = mutationField('customerConnectedGroupChat', {
  type: 'CustomerConnectedGroupChat',
  args: {
    userId: nonNull(stringArg())
  },
  resolve: async (_parent, { userId }, _context) => {
    const channels = await axios.get(`${url}/v3/users/TD${userId}/my_group_channels`, {
      headers: {
        'Api-Token': token
      }
    });
    return channels.data;
  }
});
