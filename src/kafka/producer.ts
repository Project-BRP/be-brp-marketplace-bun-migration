import type { Producer } from 'kafkajs';

import { appLogger } from '../configs/logger';
import type { IEmailDto } from '../dtos';
import { kafka } from './configs/kafka';

const emailProducer: Producer = kafka.producer();

export class SendToKafka {
  static async sendEmailMessage(emailData: IEmailDto) {
    await emailProducer.connect();
    await emailProducer.send({
      topic: 'send-email',
      messages: [{ value: JSON.stringify(emailData) }],
    });
    appLogger.info('Email sent to Kafka', emailData);
    await emailProducer.disconnect();
  }
}
