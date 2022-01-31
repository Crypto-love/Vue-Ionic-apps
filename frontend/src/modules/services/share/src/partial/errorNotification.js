import { Api } from '../helper/services';

export async function errorNotification(text, message) {
  const payload = {
    type: 'text',
    text: text,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  };
  await Api.add('s_bugs', payload);
}
