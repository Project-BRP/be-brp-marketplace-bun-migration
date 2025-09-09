import { Kafka } from 'kafkajs';

import { KAFKA_CONSTANTS } from '../constants';

declare global {
  // eslint-disable-next-line no-unused-vars
  var globalKafka: Kafka | undefined;
}

if (!global.globalKafka) {
  global.globalKafka = new Kafka({
    clientId: KAFKA_CONSTANTS.KAFKA_CLIENT_ID,
    brokers: [KAFKA_CONSTANTS.KAFKA_BROKER],
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  });
}

export const kafka: Kafka = global.globalKafka;
