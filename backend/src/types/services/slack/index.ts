import axios from 'axios';
import {
  SlackChannel,
  slackPayloadMsgBlock,
  slackEndPoint,
  slackEndPointHeaders,
  TSlackChannels,
  TSlackChannelTypes,
  ISlackPayloadData
} from './const';

type ISlackPostMessage = (
  channel: TSlackChannels,
  title: string,
  msgType: TSlackChannelTypes,
  payloadData: ISlackPayloadData
) => Promise<{ success: true; dev?: boolean } | { success: false; error: Error }>;

export const slackPostMessage: ISlackPostMessage = async (channel, title, msgType, payloadData) => {
  if (process.env.NODE_ENV !== 'production') {
    // If environment not production don't send message
    return { success: true, dev: true };
  }
  try {
    const channelId: string = SlackChannel[channel] || null;
    if (!channelId) {
      throw new Error('Invalid slack channel');
    }
    const res = await axios({
      method: 'post',
      url: `${slackEndPoint}chat.postMessage`,
      headers: slackEndPointHeaders,
      params: {
        channel: channelId,
        text: title,
        blocks: JSON.stringify(slackPayloadMsgBlock(msgType, payloadData)),
        pretty: 1
      }
    });
    const { ok = false } = res.data;
    if (!ok) {
      throw new Error(`Sending message error ${JSON.stringify(res.data)}`);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
