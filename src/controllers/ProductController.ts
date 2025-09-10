import type { Context } from 'hono';
import { SharpUtils, successResponse } from '../utils';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';

import {
  ICreateProductRequest,
  IUpdateProductRequest,
  IGetProductRequest,
  IGetAllProductsRequest,
  IDeleteProductRequest,
} from '../dtos';
import { ProductService } from '../services';
import { appLogger } from '../configs/logger';

export class ProductController {
  static async createProduct(c: Context): Promise<Response> {
    let resizedImagePath: string | undefined;

    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (file) {
        resizedImagePath = await SharpUtils.saveProductImage(file);
      }

      const request: ICreateProductRequest = {
        imageUrl: resizedImagePath,
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== 'image'),
        ),
      } as ICreateProductRequest;

      const response = await ProductService.create(request);
      return successResponse(
        c,
        StatusCodes.CREATED,
        'Produk berhasil ditambahkan',
        response,
      );
    } catch (error) {
      if (resizedImagePath && fs.existsSync(resizedImagePath)) {
        try {
          await fs.promises.unlink(resizedImagePath);
        } catch (e) {
          appLogger.error('Gagal menghapus file upload:', resizedImagePath, e);
        }
      }
      throw error;
    }
  }

  static async updateProduct(c: Context): Promise<Response> {
    let resizedImagePath: string | undefined;

    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (file) {
        resizedImagePath = await SharpUtils.saveProductImage(file);
      }

      const request: IUpdateProductRequest = {
        id: c.req.param('id'),
        imageUrl: resizedImagePath,
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== 'image'),
        ),
      } as IUpdateProductRequest;

      const response = await ProductService.update(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Produk berhasil diperbarui',
        response,
      );
    } catch (error) {
      if (resizedImagePath && fs.existsSync(resizedImagePath)) {
        try {
          await fs.promises.unlink(resizedImagePath);
        } catch (e) {
          appLogger.error('Gagal menghapus file upload:', resizedImagePath, e);
        }
      }
      throw error;
    }
  }

  static async getProductById(c: Context): Promise<Response> {
    try {
      const request: IGetProductRequest = {
        id: c.req.param('id'),
      };
      const response = await ProductService.getById(request);
      return successResponse(c, StatusCodes.OK, 'Produk berhasil ditemukan', response);
    } catch (error) {
      throw error;
    }
  }

  static async getAllProducts(c: Context): Promise<Response> {
    try {
      const request: IGetAllProductsRequest = {
        search: c.req.query('search') ?? undefined,
        page: c.req.query('page')
          ? parseInt(c.req.query('page') as string, 10)
          : undefined,
        limit: c.req.query('limit')
          ? parseInt(c.req.query('limit') as string, 10)
          : undefined,
        productTypeId: c.req.query('productTypeId') ?? undefined,
      };

      const response = await ProductService.getAll(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar produk berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(c: Context): Promise<Response> {
    try {
      const request: IDeleteProductRequest = {
        id: c.req.param('id'),
      };
      await ProductService.delete(request);
      return successResponse(c, StatusCodes.OK, 'Produk berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }
}
