import axios, { AxiosResponse } from 'axios';

const env = process.env;
const url = env.SENDBIRD_URL;
const token = env.SENDBIRD_TOKEN;

export async function checkifGroupChannelExist(
  hubId: number | string
): ReturnSendbird<{ channels: ISendbirdChannel[] }> {
  const res = await axios.get(`${url}/v3/group_channels`, {
    headers: {
      'Api-Token': token
    },
    params: {
      metadata_key: 'hubId',
      metadata_values: hubId,
      show_empty: true
    }
  });
  return res;
}

export async function checkIfUserExist(userId: string): Promise<{ exist: boolean }> {
  try {
    const res = await axios.get(`${url}/v3/users/${userId}`, {
      headers: {
        'Api-Token': token
      },
      params: {
        include_unread_count: true
      }
    });
    return { exist: true };
  } catch (err) {
    return { exist: false };
  }
}

export async function createCustomerAccount(userId: string, nickname: string): ReturnSendbird<any> {
  const res = await axios.post(
    `${url}/v3/users`,
    {
      user_id: userId,
      nickname: nickname,
      profile_url: '',
      issue_access_token: true,
      issue_session_token: true
    },
    { headers: { 'Api-Token': token } }
  );
  return res;
}

export async function addUserMetadata(
  sbUserId: string,
  metadata: Record<string, string>
): ReturnSendbird<any> {
  const res = await axios.post(
    `${url}/v3/users/${sbUserId}/metadata`,
    { metadata },
    { headers: { 'Api-Token': token } }
  );
  return res;
}

export async function joinGroupChannel(channelURL: string, userId: string): ReturnSendbird<any> {
  const res = await axios.post(
    `${url}/v3/group_channels/${channelURL}/invite`,
    { user_ids: [`${userId}`] },
    { headers: { 'Api-Token': token } }
  );
  return res;
}

export async function addChannelMetadata(
  channelUrl: string,
  metadata: Record<string, string>
): ReturnSendbird<any> {
  const res = await axios.post(
    `${url}/v3/group_channels/${channelUrl}/metadata`,
    { metadata },
    { headers: { 'Api-Token': token } }
  );
  return res;
}

export async function updateChannelMetadata(
  channelUrl: string,
  metadata: Record<string, string>
): ReturnSendbird<any> {
  const res = await axios.put(
    `${url}/v3/group_channels/${channelUrl}/metadata`,
    { metadata },
    { headers: { 'Api-Token': token } }
  );
  return res;
}

export async function viewChannelMetadata(channelUrl: string): ReturnSendbird<any> {
  const res = await axios.get(`${url}/v3/group_channels/${channelUrl}/metadata/`, {
    headers: { 'Api-Token': token }
  });
  return res;
}

export async function create1On1Channel(
  advocateId: string,
  userId: string,
  advocateName: string,
  userName: string
): ReturnSendbird<any> {
  const res = await axios.post(
    `${url}/v3/group_channels/`,
    {
      user_ids: [`${advocateId}`, `${userId}`],
      is_distinct: true,
      name: `${advocateName} - ${userName}`,
      data: JSON.stringify({
        advocateName,
        userName
      })
    },
    {
      headers: {
        'Api-Token': token
      }
    }
  );
  const resData = res.data;
  if (resData.channel_url) {
    const viewMetadata = await viewChannelMetadata(resData.channel_url);
    const viewMetadataResult = viewMetadata.data;
    if (viewMetadataResult.type !== '1on1') {
      addChannelMetadata(resData.channel_url, { type: '1on1' });
    }
  }
  return res;
}

export interface ISendbirdCreatedBy {
  require_auth_for_profile_image: boolean;
  nickname: string;
  user_id: string;
  profile_url: string;
}

export interface ISendbirdChannelData {
  name: string;
  member_count: number;
  custom_type: string;
  channel_url: string;
  created_at: number;
  cover_url: string;
  max_length_message: number;
  data: string;
}

export interface ISendbirdChannel {
  message_survival_seconds: number;
  unread_message_count: number;
  is_distinct: boolean;
  invited_at: number;
  custom_type: string;
  is_ephemeral: boolean;
  cover_url: string;
  freeze: boolean;
  created_by: ISendbirdCreatedBy;
  is_discoverable: boolean;
  is_public: boolean;
  data: string;
  joined_ts?: any;
  ignore_profanity_filter: boolean;
  is_super: boolean;
  name: string;
  member_count: number;
  inviter?: any;
  created_at: number;
  is_access_code_required: boolean;
  is_broadcast: boolean;
  last_message?: any;
  unread_mention_count: number;
  joined_member_count: number;
  max_length_message: number;
  channel_url: string;
  channel: ISendbirdChannelData;
  is_exclusive: boolean;
}

export interface ISendbirdUser {
  phone_number: string;
  discovery_keys: any[];
  is_active: boolean;
  is_hide_me_from_friends: boolean;
  is_online: boolean;
  user_id: string;
  nickname: string;
  has_ever_logged_in: boolean;
  require_auth_for_profile_image: boolean;
  created_at: number;
  last_seen_at: number;
  preferred_languages: any[];
  profile_url: string;
  metadata: {
    advocate: boolean;
  } | null;
}

type ReturnSendbird<T> = Promise<AxiosResponse<T>>;
