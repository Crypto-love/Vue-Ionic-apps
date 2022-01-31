import axios from 'axios';

interface ClevertapConfig {
  host: string;
  accountId: string;
  passcode: string;
}

interface ClevertapEvents {
  identity: string | number;
  name: string;
  data: Record<string, unknown>;
}

interface ClevertapProfiles {
  identity: string | number;
  data: Record<string, unknown>;
}

export class Clevertap {
  private host: string;
  private accountId: string;
  private passcode: string;

  constructor(config: ClevertapConfig) {
    this.host = config.host;
    this.accountId = config.accountId;
    this.passcode = config.passcode;
  }
  uploadProfiles = async (profiles: ClevertapProfiles[]): Promise<boolean | Record<string, unknown>> => {
    if (profiles && profiles.length > 0) {
      const data = [];
      for (const profile of profiles) {
        data.push({
          identity: profile.identity,
          type: 'profile',
          profileData: profile.data
        });
      }
      return axios
        .post(
          `${this.host}/upload`,
          {
            d: data
          },
          {
            headers: {
              'X-CleverTap-Account-Id': `${this.accountId}`,
              'X-CleverTap-Passcode': `${this.passcode}`
            }
          }
        )
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.error(err);
          return false;
        });
    }
  };

  uploadEvents = async (events: ClevertapEvents[]): Promise<boolean | Record<string, unknown>> => {
    if (events && events.length > 0) {
      const data = [];
      for (const event of events) {
        data.push({
          identity: event.identity,
          type: 'event',
          evtName: event.name,
          evtData: event.data
        });
      }
      return axios
        .post(
          `${this.host}/upload`,
          {
            d: data
          },
          {
            headers: {
              'X-CleverTap-Account-Id': `${this.accountId}`,
              'X-CleverTap-Passcode': `${this.passcode}`
            }
          }
        )
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.error(err);
          return false;
        });
    }
  };
}
