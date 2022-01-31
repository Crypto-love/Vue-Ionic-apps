import aws, { AWSError, SQS } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const AWS_SDK_API_VERSION = '2012-11-05';
const MESSAGE_ATTRIBUTE = 'SQSThetreedots';

export class Sqs {
  public sqs: SQS;
  private queueUrl: string;

  public constructor(config: SQS.Types.ClientConfiguration = {}) {
    aws.config.update(config);

    this.sqs = new aws.SQS({
      apiVersion: AWS_SDK_API_VERSION
    });
  }

  public createQueue = async (QueueName: string): Promise<void> => {
    const params = {
      QueueName: `${process.env.NODE_ENV || 'local'}-${QueueName}.fifo`,
      Attributes: {
        FifoQueue: 'true'
      }
    };

    try {
      await this.sqs
        .createQueue(params, (err: AWSError, { QueueUrl = '' }: SQS.Types.CreateQueueResult) => {
          if (err) {
            console.error(err);
          }

          this.queueUrl = QueueUrl;
        })
        .promise();
    } catch (error) {
      console.error(error);
    }
  };

  public deleteMessage = async (receiptHandle: string): Promise<void> => {
    const params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    };

    try {
      await this.sqs.deleteMessage(params).promise();
    } catch (error) {
      console.error(error);
    }
  };

  public publish = async (triggerName: string, payload: Record<string, unknown>): Promise<void> => {
    try {
      if (!this.queueUrl) {
        await this.createQueue(triggerName);
      }

      const params: SQS.Types.SendMessageRequest = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(payload),
        MessageGroupId: triggerName,
        MessageDeduplicationId: uuidv4(),
        MessageAttributes: {
          [MESSAGE_ATTRIBUTE]: {
            DataType: 'String',
            StringValue: triggerName
          }
        }
      };

      await this.sqs.sendMessage(params).promise();
    } catch (error) {
      console.error(error);
    }
  };

  public poll = async (triggerName: string): Promise<any> => {
    try {
      if (!this.queueUrl) {
        await this.createQueue(triggerName);
      }

      const params = {
        MessageAttributeNames: [MESSAGE_ATTRIBUTE],
        QueueUrl: this.queueUrl
      };

      const data = await this.receiveMessage(params);

      if (
        data &&
        data.Messages &&
        data.Messages[0].MessageAttributes[MESSAGE_ATTRIBUTE].StringValue === triggerName
      ) {
        await this.deleteMessage(data.Messages[0].ReceiptHandle);

        return JSON.parse(data.Messages[0].Body);
      }
    } catch (error) {
      console.error(error);
    }
  };

  private readonly receiveMessage = async (
    params: SQS.Types.ReceiveMessageRequest
  ): Promise<SQS.Types.ReceiveMessageResult> => {
    try {
      return await this.sqs.receiveMessage(params).promise();
    } catch (error) {
      console.error(error);
    }
  };
}
