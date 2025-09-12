// FileName: MultipleFiles/ProductTypeController.ts
import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import {
  ICreateProductTypeRequest,
  IUpdateProductTypeRequest,
  IGetProductTypeRequest,
  IGetAllProductTypesRequest,
  IDeleteProductTypeRequest,
} from '../dtos';
import { ProductTypeService } from '../services';
import { successResponse } from '../utils';

export class ProductTypeController {
  static async createProductType(c: Context): Promise<Response> {
    try {
      const request = (await c.req.json()) as ICreateProductTypeRequest;
      const response = await ProductTypeService.create(request);
      return 
      successResponse(
        c,
        StatusCodes.CREATED,
        'Tipe produk berhasil ditambahkan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateProductType(c: Context): Promise<Response> {
    try {
      const request = {
        id: c.req.param().id,
        ...(await c.req.json()),
      } as IUpdateProductTypeRequest;
      const response = await ProductTypeService.update(request);
      return 
      successResponse(
        c,
        StatusCodes.OK,
        'Tipe produk berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getProductTypeById(c: Context): Promise<Response> {
    try {
      const request = {
        id: c.req.param().id,
      } as IGetProductTypeRequest;
      const response = await ProductTypeService.getById(request);
      return 
      successResponse(
        c,
        StatusCodes.OK,
        'Tipe produk berhasil ditemukan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getAllProductTypes(c: Context): Promise<Response> {
    try {
      const request = {
        search: c.req.query().search ? (c.req.query().search as string) : undefined,
        page: c.req.query().page
          ? parseInt(c.req.query().page as string, 10)
          : undefined,
        limit: c.req.query().limit
          ? parseInt(c.req.query().limit as string, 10)
          : undefined,
      } as IGetAllProductTypesRequest;
      const response = await ProductTypeService.getAll(request);
      return 
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar tipe produk berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteProductType(c: Context): Promise<Response> {
    try {
      const request = {
        id: c.req.param().id,
      } as IDeleteProductTypeRequest;
      await ProductTypeService.delete(request);
      return 
      successResponse(c, StatusCodes.OK, 'Tipe produk berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }
}
