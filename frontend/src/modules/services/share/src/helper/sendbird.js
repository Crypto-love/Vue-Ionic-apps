import { Platform } from 'quasar';
import SendBird from 'sendbird';
import Vue from 'vue';

const appId = process.env.SENDBIRD_APP_ID;
const sendbirdToken = process.env.SENDBIRD_TOKEN;

export const sb = new SendBird({ appId: appId });

export default {
  /**
   * @function connect
   * @param {number} userId
   * @description Login/Register a user to SendBird application
   */
  connect(userId, accessToken) {
    return new Promise((resolve, reject) => {
      sb.connect(userId, accessToken, function (user, error) {
        if (error) reject(new Error(`Login Failed: ${error}`));
        resolve(user);
      });
    });
  },

  // Probably need to create a function from backend to prevent revealing token
  async getUserToken(userId) {
    const res = await fetch(`https://api-${appId}.sendbird.com/v3/users/${userId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Api-Token': sendbirdToken
      }
    });
    const result = res.json();
    return result;
  },

  /**
   * @function startChat
   * @param {Array} userIds
   * @description SendBird enables the creation of private channels; To start a one-on-one chat needs creation of a channel with two members
   */
  startChat(userIds) {
    return new Promise((resolve, reject) => {
      // The boolean argument below directs the app to look for an existing chat between
      // the two users. Creates a new chat if no match is found
      sb.GroupChannel.createChannelWithUserIds(userIds, true, function (channel, error) {
        if (error) reject(new Error(`Channel creation Failed: ${error}`));
        resolve(channel);
      });
    });
  },

  /**
   * @function getChat
   * @param {string} channelUrl
   * @description get a single chat
   */
  getChat(channelUrl) {
    return new Promise((resolve, reject) => {
      sb.GroupChannel.getChannel(channelUrl, function (groupChannel, error) {
        if (error) reject(new Error(`Could not get channel: ${error}`));
        resolve(groupChannel);
      });
    });
  },

  /**
   * @function sendMessage
   * @param {Object} channel
   * @param {string} message
   * @description Send a message to another user
   */
  sendMessage(channel, message, isFile, file) {
    return new Promise((resolve, reject) => {
      if (!isFile) {
        channel.sendUserMessage(message, (message, error) => {
          if (error) reject(new Error(`Message send Failure: ${error}`));
          resolve(message);
        });
      } else {
        const params = new sb.FileMessageParams();
        params.file = file;
        params.thumbnailSizes = [{ maxWidth: 200, maxHeight: 200 }];
        params.requireAuth = false;
        params.require_auth = false;
        channel.sendFileMessage(params, (fileMsg, error) => {
          if (error) reject(new Error(`Message send Failure: ${error}`));
          resolve(fileMsg);
        });
      }
    });
  },

  /**
   * @function getChatList
   * @description get a list of chats for current user
   */
  getChatList() {
    return new Promise((resolve, reject) => {
      const channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
      channelListQuery.includeEmpty = true;
      channelListQuery.order = 'latest_last_message';
      channelListQuery.limit = 50;

      if (channelListQuery.hasNext) {
        channelListQuery.next(function (channelList, error) {
          if (error) reject(new Error(`Could not get list: ${error}`));
          resolve(channelList);
        });
      }
    });
  },

  /**
   * @function getChatMessages
   * @param {Object} channel
   * @description get message history for selected chat
   */
  getChatMessages(query, customLimit = 5) {
    return new Promise((resolve, reject) => {
      query.limit = customLimit;
      query.reverse = false;
      query.load(function (messages, error) {
        if (error) reject(new Error(`Could not get messages: ${error}`));
        resolve(messages);
      });
    });
  },

  /**
   * @function groupChannelCreatePreviousMessageListQuery
   * @param {Object} channel
   * @description create previous message in channel query
   */

  groupChannelCreatePreviousMessageListQuery(url) {
    return new Promise((resolve, reject) => {
      sb.GroupChannel.getChannel(url, async function (groupChannel, error) {
        if (error) {
          reject(err);
        } else {
          try {
            const messageQuery = await groupChannel.createPreviousMessageListQuery();
            resolve(messageQuery);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  },

  /**
   * @function getTotalUnreadMessageCount
   * @description get total unread message in all group channel
   */

  getTotalUnreadMessageCount() {
    return new Promise((resolve, reject) => {
      sb.GroupChannel.getTotalUnreadMessageCount((count, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(count);
        }
      });
    });
  },

  setChatPushNotification() {
    if (Platform.is.android || Platform.is.ios) {
      Platform.is.android
        ? Vue.prototype.$firebase.getFCMToken('onSetChatPushNotification')
        : Vue.prototype.$firebase.getAPNSToken('onSetChatPushNotification');
      window.addEventListener('onSetChatPushNotification', onSetChatPushNotification);
    }
  },

  /**
   * We dont unset chat push notification for Android because everytime user's redirect to login page,
   * it will revoke FCM token.
   */
  unsetChatPushNotification(callback) {
    if (Platform.is.ios) {
      Vue.prototype.$firebase.getAPNSToken('onUnsetChatPushNotification');
      window.addEventListener('onUnsetChatPushNotification', ($event) =>
        onUnsetChatPushNotification($event, callback)
      );
    }
  }
};

async function onSetChatPushNotification($event) {
  const token = $event.detail?.token;
  if (!token) return;

  try {
    let response;
    let triggerOption;
    if (Platform.is.android || Platform.is.ios) {
      response = Platform.is.android
        ? await sb.registerGCMPushTokenForCurrentUser(token)
        : await sb.registerAPNSPushTokenForCurrentUser(token);
      triggerOption = await sb.setPushTriggerOption('all');
    }
  } catch (error) {}
}

async function onUnsetChatPushNotification($event, callback) {
  const token = $event.detail?.token;

  if (token) sb.unregisterAPNSPushTokenForCurrentUser(token);

  if (callback) callback();
}
