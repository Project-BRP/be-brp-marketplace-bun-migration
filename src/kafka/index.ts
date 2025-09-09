import { appLogger } from '../configs/logger';
import '../configs/env';
import { runKafkaConsumer } from './consumer';

runKafkaConsumer().catch(error => {
  appLogger.error('Error running Kafka consumer', error);
});

export * from './producer';
