import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { IUpdatePPNRequest } from '../dtos';
import { PPNService } from '../services';
import { successResponse } from '../utils';

export class PPNController {
  static async getCurrentPPN(c: Context): Promise<Response> {
    try {
      const response = await PPNService.getCurrentPPN();
      return successResponse(
        c,
        StatusCodes.OK,
        'PPN berhasil ditemukan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updatePPN(c: Context): Promise<Response> {
    try {
      const request = (await c.req.json()) as IUpdatePPNRequest;
      const response = await PPNService.updatePPN(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'PPN berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }
}
