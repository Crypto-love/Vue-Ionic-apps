import { Api, Notice } from '../../share/index';
import { production } from 'src/config';

/**
 *
 * @param {string[]} instructions
 * @param {string} customerName
 * @param {sender} sender
 */
export async function tempInstruction(instructions, customerName, sender) {
  if (instructions.length === 0) {
    throw new Error(`No instruction found for ${customerName}`);
  }

  let message = `*Customer Name:* ${customerName}\n*Instructions:*\n`;
  message = instructions.reduce((resMsg, v) => {
    if (v) {
      return resMsg + `- ${v}\n`;
    }
    return resMsg;
  }, message);

  const payload = {
    type: sender,
    text: 'Temp Instruction',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      },
      {
        type: 'divider'
      }
    ]
  };

  let pr;

  if (production) {
    // pr = Api.add("s_sales-temp-instructions", payload);
  } else {
    pr = Api.add('s_sales-temp-instructions-dev', payload);
  }

  const s_result = await pr;

  if (!s_result.status) {
    throw new Error(s_result.message);
  }
  if (s_result.data.length <= 0) {
    throw new Error("There's slack error");
  }

  return 'Slack Notification sent!';
}
