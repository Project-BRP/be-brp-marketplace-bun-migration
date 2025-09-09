import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { ConfigService } from '../services';
import { successResponse } from '../utils';
import { IUploadLogoRequest } from '../dtos';
import { ResponseError } from 'error/ResponseError';
import fs from 'fs';
import { appLogger } from '../configs/logger';

export class ConfigController {
  static async uploadLogo(c: Context): Promise<void> {
    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (!file) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Tidak ada file yang diunggah',
        );
      }

      const uploadRequest: IUploadLogoRequest = { file };
      const response = await ConfigService.uploadLogo(uploadRequest);

      successResponse(
        c,
        StatusCodes.CREATED,
        'Logo perusahaan berhasil diunggah',
        { imageUrl: response.resizedLogoPath },
      );
    } catch (error) {
      throw error;
    }
  }

  static async getLogo(c: Context): Promise<void> {
    try {
      const logoUrl = await ConfigService.getLogo();
      successResponse(c, StatusCodes.OK, 'Logo berhasil diambil', {
        imageUrl: logoUrl,
      });
    } catch (error) {
      throw error;
    }
  }
}
