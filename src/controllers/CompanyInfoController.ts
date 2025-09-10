import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import { ICreateCompanyInfoRequest, IUpdateCompanyInfoRequest } from '../dtos';
import { CompanyInfoService } from '../services';
import { successResponse } from '../utils';

export class CompanyInfoController {
  static async createCompanyInfo(c: Context): Promise<Response> {
    try {
      const request = (await c.req.json()) as ICreateCompanyInfoRequest;
      const response = await CompanyInfoService.createCompanyInfo(request);
      return successResponse(
        c,
        StatusCodes.CREATED,
        'Informasi perusahaan berhasil dibuat',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateCompanyInfo(c: Context): Promise<Response> {
    try {
      const request = (await c.req.json()) as IUpdateCompanyInfoRequest;
      const response = await CompanyInfoService.updateCompanyInfo(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Informasi perusahaan berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getCompanyInfo(c: Context): Promise<Response> {
    try {
      const response = await CompanyInfoService.getCompanyInfo();
      return successResponse(
        c,
        StatusCodes.OK,
        'Informasi perusahaan berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }
}
