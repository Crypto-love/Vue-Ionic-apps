import { UserInputError } from 'apollo-server-errors';
import { mutationField, nonNull, intArg, stringArg } from 'nexus';
import { getUserCredentials } from '../../utils/auth';
import {
  checkifGroupChannelExist,
  checkIfUserExist,
  addUserMetadata,
  create1On1Channel,
  createCustomerAccount,
  joinGroupChannel
} from '../../../types/services/chat/sendbird';

export const joinHub = mutationField('joinHub', {
  type: 'JSON',
  args: {
    hub_id: nonNull(intArg()),
    appMode: nonNull(stringArg())
  },
  resolve: async (_parent, { hub_id, appMode }, ctx) => {
    /** Validate hub_id */
    const hub = await ctx.prisma.customer.findFirst({
      where: { id: hub_id, hub: true },
      select: {
        id: true,
        name: true,
        alias_name: true,
        addresses: {
          where: {
            address_type_id: 1
          }
        }
      }
    });
    if (!hub) throw new UserInputError('Invalid Hub');

    /** Insert or Update user's hub */
    const credential = getUserCredentials(ctx);

    const curentDateTime = new Date();
    const offset = (curentDateTime.getTimezoneOffset() / 60) * -1;
    curentDateTime.setHours(curentDateTime.getHours() + offset);

    let userHub: any = await ctx.prisma.userHub.findFirst({
      where: { user_id: credential.userId },
      select: { id: true }
    });
    if (userHub) {
      userHub = await ctx.prisma.userHub.update({
        data: { hub_id: hub_id, hub_join_date: curentDateTime },
        where: { id: userHub.id }
      });
    } else {
      userHub = await ctx.prisma.userHub.create({
        data: {
          user_id: credential.userId,
          hub_id: hub_id,
          hub_join_date: curentDateTime
        }
      });
    }

    const userDetail = await ctx.prisma.user.findUnique({
      where: {
        id: credential.userId
      },
      select: {
        first_name: true,
        last_name: true,
        username: true
      }
    });

    const hubs = await ctx.prisma.customer.findUnique({
      where: {
        id: hub_id
      }
    });

    const hubAdvocate = await ctx.prisma.user.findFirst({
      where: {
        user_type_id: 11,
        UserCustomer: {
          some: {
            customer_id: hubs.id
          },
          every: {
            user_id: {
              notIn: [29, 8389]
            }
          }
        }
      }
    });

    let newJoinChat = false;

    const nickname =
      userDetail.first_name || userDetail.last_name
        ? `${userDetail.last_name} ${userDetail.first_name}`
        : `${userDetail.username}`;
    const userSbId = `TD${credential.userId}`;
    let advocateNickname;
    let advocateUserSbId;
    if (hubAdvocate) {
      advocateNickname = `${hubAdvocate.first_name} ${hubAdvocate.last_name}`;
      advocateUserSbId = `TD${hubAdvocate.id}`;
    }

    if (userHub.user_id && userHub.hub_id) {
      try {
        const checkIfGroupExist = await checkifGroupChannelExist(hub_id);
        const checkIfGroupExistChannels = checkIfGroupExist.data.channels || [];
        if (checkIfGroupExistChannels.length > 0) {
          const channelURL = checkIfGroupExistChannels[0].channel_url;
          const checkUserExist = await checkIfUserExist(userSbId);
          if (!checkUserExist.exist) {
            createCustomerAccount(userSbId, nickname).then(() => {
              joinGroupChannel(channelURL, userSbId);
              if (advocateNickname) {
                initiateAdvocateChat(advocateUserSbId, advocateNickname, userSbId, nickname);
              }
              newJoinChat = true;
            });
          } else {
            joinGroupChannel(channelURL, userSbId);
            if (advocateNickname) {
              if (hubAdvocate.id) {
                initiateAdvocateChat(advocateUserSbId, advocateNickname, userSbId, nickname);
              }
            }
            newJoinChat = true;
          }
        }
      } catch (err) {}
    }

    const hubAddress = hub.addresses[0];
    if (hubAddress) {
      ctx.clevertap.uploadEvents([
        {
          identity: credential.userId,
          name: 'Joined Collection Point',
          data: {
            'collection point name': hub.name,
            'collection point address': `${hubAddress.road}, ${hubAddress.city} (${hubAddress.postal_code})`
          }
        }
      ]);
    }

    /**
    const { sqs, firebase } = ctx;
    const queueName = `join-hub-${credential.userId}`;

    // -- publish to sqs queue
    await sqs.publish(queueName, {
      senderUserId: credential.userId,
      targetUserId: credential.userId,
      topic: `${credential.userId}-${appMode}`,
      title: 'You joined new Collection Point',
      message: `You just joined ${hub.name} Collection Point, where you will be able collect your items.`,
      payload: JSON.stringify({ hub_id: hub_id })
    });

    // -- poll from sqs queue
    const message = await sqs.poll(queueName);

    if (message) {
      // -- Send notification message
      const notification = await firebase.sendNotification(message);
      // -- Save notification message
      if (notification) {
        await ctx.prisma.userNotification.create({
          data: {
            sender_user_id: message.senderUserId,
            target_user_id: message.targetUserId,
            title: message.title,
            message: message.message,
            created_at: curentDateTime,
            payload: message.payload
          }
        });
      }
    }
    */

    return {
      success: true,
      newJoinChat
    };
  }
});

const initiateAdvocateChat = async (advocateUserSbId, advocateNickname, userSbId, userSbName) => {
  const checkUserExist = await checkIfUserExist(advocateUserSbId);
  if (!checkUserExist.exist) {
    createCustomerAccount(advocateUserSbId, advocateNickname).then(async () => {
      await addUserMetadata(advocateUserSbId, { advocate: 'true' });
      create1On1Channel(advocateUserSbId, userSbId, advocateNickname, userSbName);
    });
  } else {
    create1On1Channel(advocateUserSbId, userSbId, advocateNickname, userSbName);
  }
};
