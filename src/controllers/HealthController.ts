import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { HealthService } from '../services';
import { successResponse } from '../utils';

export class HealthController {
  static async getHealth(c: Context): Promise<void> {
    try {
      await HealthService.getHealth();
      successResponse(c, StatusCodes.OK, 'OK');
    } catch (error) {
      throw error;
    }
  }
}
