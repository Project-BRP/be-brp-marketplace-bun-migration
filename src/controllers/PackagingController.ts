// FileName: MultipleFiles/PackagingController.ts
import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import {
  ICreatePackagingRequest,
  IUpdatePackagingRequest,
  IGetPackagingRequest,
  IGetAllPackagingsRequest,
  IDeletePackagingRequest,
} from '../dtos';
import { PackagingService } from '../services';
import { successResponse } from '../utils';

export class PackagingController {
  static async createPackaging(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as ICreatePackagingRequest;
      const response = await PackagingService.create(request);
      successResponse(
        c,
        StatusCodes.CREATED,
        'Kemasan berhasil ditambahkan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updatePackaging(c: Context): Promise<void> {
    try {
      const request = {
        id: c.req.param().id,
        ...(await c.req.json()),
      } as IUpdatePackagingRequest;
      const response = await PackagingService.update(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Kemasan berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getPackagingById(c: Context): Promise<void> {
    try {
      const request = {
        id: c.req.param().id,
      } as IGetPackagingRequest;
      const response = await PackagingService.getById(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Kemasan berhasil ditemukan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getAllPackagings(c: Context): Promise<void> {
    try {
      const request = {
        search: c.req.query().search ? (c.req.query().search as string) : null,
        page: c.req.query().page
          ? parseInt(c.req.query().page as string, 10)
          : null,
        limit: c.req.query().limit
          ? parseInt(c.req.query().limit as string, 10)
          : null,
      } as IGetAllPackagingsRequest;
      const response = await PackagingService.getAll(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar kemasan berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deletePackaging(c: Context): Promise<void> {
    try {
      const request = {
        id: c.req.param().id,
      } as IDeletePackagingRequest;
      await PackagingService.delete(request);
      successResponse(c, StatusCodes.OK, 'Kemasan berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }
}
