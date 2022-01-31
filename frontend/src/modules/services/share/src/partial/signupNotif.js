import { Api } from '../helper/services';

export async function signupNotif(row) {
  const payload = {
    type: 'text',
    text: 'New user is registered',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            'Name: ' +
            row.first_name +
            ' ' +
            row.last_name +
            '\n Contact Number: ' +
            row.mobile +
            '\n Email: ' +
            row.email
        }
      }
    ]
  };
  await Api.add('s_signups', payload);
}
