import { StatusCodes } from 'http-status-codes';

import { appLogger } from '../configs/logger';
import { ResponseError } from '../error/ResponseError';
import { HealthRepository } from '../repositories';

export class HealthService {
  static async getHealth(): Promise<void> {
    try {
      await HealthRepository.dbCheck();
    } catch (error) {
      appLogger.error(error);

      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Database is not connected',
      );
    }
  }
}
