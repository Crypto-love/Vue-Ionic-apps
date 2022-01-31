import { getNewDate } from '../../utils/dateTime';

export const log = async (ctxPrisma, message: any): Promise<void> => {
  await ctxPrisma.userNotification.create({
    data: {
      sender_user_id: message.senderUserId,
      target_user_id: message.targetUserId,
      title: message.title,
      message: message.message,
      created_at: getNewDate(),
      payload: message.payload,
      read: 0
    }
  });
};
