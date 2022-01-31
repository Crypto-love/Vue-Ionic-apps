import axios from 'axios';

interface FirebaseConfig {
  host: string;
  serverKey: string;
}

interface FirebaseTargets {
  senderUserId: number;
  targetUserId: number;
  topic: string;
  token?: string[];
  title: string;
  message: string;
  payload?: string;
}

export class Firebase {
  private host: string;
  private serverKey: string;

  constructor(config: FirebaseConfig) {
    this.host = config.host;
    this.serverKey = config.serverKey;
  }

  sendNotification = async (target: FirebaseTargets): Promise<boolean | number> => {
    if (target) {
      if (target.message) {
        return axios
          .post(
            this.host,
            {
              to: `/topics/${target.topic}`,
              notification: {
                title: target.title,
                body: target.message,
                sound: 'default'
              },
              priority: 'High'
            },
            {
              headers: {
                Authorization: `key=${this.serverKey}`
              }
            }
          )
          .then((res) => {
            return res.status;
          })
          .catch((err) => {
            console.error(err);
            return false;
          });
      }
    }
  };
}
