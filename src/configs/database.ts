import { PrismaClient } from '@prisma/client';

import { DATABASE_CONSTANTS } from '../constants';
import { prismaLogger } from './logger';

declare global {
  // eslint-disable-next-line no-unused-vars
  var globalDb: PrismaClient | undefined;
}

if (!global.globalDb) {
  const url = `${DATABASE_CONSTANTS.PROVIDER_DB}://${DATABASE_CONSTANTS.USERNAME_DB}:${DATABASE_CONSTANTS.PASSWORD_DB}@${DATABASE_CONSTANTS.HOST_DB}:${DATABASE_CONSTANTS.PORT_DB}/${DATABASE_CONSTANTS.DATABASE_NAME}?schema=public&options=-c%20TimeZone%3DAsia%2FJakarta`;

  global.globalDb = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
      {
        emit: 'event',
        level: 'error',
      },
    ],
  });
}

const databaseWithEvents = global.globalDb as PrismaClient & {
  $on: (e: string, listener: (e: any) => void) => void;
};

databaseWithEvents.$on('query', (e: any) => {
  prismaLogger.info(e);
});

databaseWithEvents.$on('info', (e: any) => {
  prismaLogger.info(e);
});

databaseWithEvents.$on('warn', (e: any) => {
  prismaLogger.warn(e);
});

databaseWithEvents.$on('error', (e: any) => {
  prismaLogger.error(e);
});

export const db: PrismaClient = global.globalDb;
