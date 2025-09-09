import type { Consumer } from 'kafkajs';
import fs from 'fs';

import { appLogger } from '../configs/logger';
import { transporter } from '../configs/nodemailer';
import type { IEmailDto } from '../dtos';
import { kafka } from './configs/kafka';

const emailConsumer: Consumer = kafka.consumer({ groupId: 'email-group' });

class KafkaConsumer {
  static async consumeEmailMessage(emailData: IEmailDto) {
    try {
      await transporter.sendMail({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments,
      });

      if (emailData.attachments) {
        for (const attachment of emailData.attachments) {
          fs.unlink(attachment.path, err => {
            if (err) appLogger.error('Failed to delete attachment:', err);
          });
        }
      }

      appLogger.info('Email sent', emailData);
    } catch (error) {
      appLogger.error('Error sending email', error);
    }
  }
}

export const runKafkaConsumer = async () => {
  await emailConsumer.connect();
  await emailConsumer.subscribe({ topic: 'send-email' });

  await emailConsumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const emailData: IEmailDto = JSON.parse(message.value.toString());
      appLogger.info('Email received', emailData);
      await KafkaConsumer.consumeEmailMessage(emailData);
    },
  });
};
