export type TSlackChannels = keyof typeof SlackChannel;

type TSlackMessageBlocks = {
  type: string;
  text?: {
    type: string;
    text: string;
  };
}[];

export interface ISlackPayloadData {
  first_name?: string;
  last_name?: string;
  mobile?: string;
  email?: string;
}

type TSlackPayloadMsgBlock = (type: TSlackChannelTypes, data: ISlackPayloadData) => TSlackMessageBlocks;

export type TSlackChannelTypes = 'b2cSignup' | 'b2bSignup';

export const SlackChannel = {
  techDevLogs: 'CRZJ1LHHU',
  sysB2CSignup: 'G013J9X70QJ',
  sysB2BSignup: 'G0124EH5A0P'
} as const;

export const slackToken = process.env.SLACK_BOT_TOKEN || '';

export const slackEndPoint = 'https://slack.com/api/';

export const slackEndPointHeaders = {
  Authorization: `Bearer ${slackToken}`
};

export const slackPayloadMsgBlock: TSlackPayloadMsgBlock = (type, data) => {
  switch (type) {
    case 'b2cSignup':
      return [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Name*: ${data.first_name || ''} ${data.last_name || ''}\n*Contact Number*: ${
              data.mobile || ''
            }\n*Email*: ${data.email || ''}`
          }
        }
      ];
    case 'b2bSignup':
      return [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Name*: ${data.first_name || ''} ${data.last_name || ''}\n*Contact Number*: ${
              data.mobile || ''
            }\n*Email*: ${data.email || ''}`
          }
        }
      ];
    default:
      break;
  }
};
