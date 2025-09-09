import { createClient } from 'redis';

import { REDIS_CONSTANTS } from '../constants';
import { redisLogger } from './logger';

declare global {
  // eslint-disable-next-line no-unused-vars
  var globalRedis: ReturnType<typeof createClient> | undefined;
}

// Membuat client Redis hanya jika belum ada
if (!global.globalRedis) {
  global.globalRedis = createClient({
    socket: {
      host: REDIS_CONSTANTS.REDIS_HOST,
      port: Number(REDIS_CONSTANTS.REDIS_PORT),
    },
    password: REDIS_CONSTANTS.REDIS_PASSWORD,
    database: Number(REDIS_CONSTANTS.REDIS_DB),
  });
}

const redisClientWithEvents = global.globalRedis!;

redisClientWithEvents.on('connect', () => {
  redisLogger.info('Redis connected');
});

redisClientWithEvents.on('ready', () => {
  redisLogger.info('Redis is ready');
});

redisClientWithEvents.on('error', err => {
  redisLogger.error('Redis error: ', err);
});

redisClientWithEvents.on('reconnecting', () => {
  redisLogger.warn('Redis is reconnecting');
});

redisClientWithEvents.on('end', () => {
  redisLogger.info('Redis connection closed');
});

async function connectRedis() {
  if (!redisClientWithEvents.isOpen) {
    await redisClientWithEvents.connect();
  }
}

connectRedis().catch(err =>
  redisLogger.error('Error connecting to Redis:', err),
);

export const redisClient = redisClientWithEvents;
