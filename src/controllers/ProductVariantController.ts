import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';

import { SharpUtils, successResponse } from '../utils';

import {
  ICreateProductVariantRequest,
  IUpdateProductVariantRequest,
  IGetProductVariantRequest,
  IGetAllProductVariantsRequest,
  IEditStockRequest,
  IDeleteProductVariantRequest,
} from '../dtos';
import { ProductVariantService } from '../services';
import { appLogger } from '../configs/logger';

export class ProductVariantController {
  static async createProductVariant(c: Context): Promise<Response> {
    let resizedImagePath: string | undefined;

    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (file) {
        resizedImagePath = await SharpUtils.saveProductVariantImage(file);
      }

      const request: ICreateProductVariantRequest = {
        productId: c.req.param('productId'),
        imageUrl: resizedImagePath,
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== 'image'),
        ),
      } as ICreateProductVariantRequest;

      const response = await ProductVariantService.create(request);
      return successResponse(
        c,
        StatusCodes.CREATED,
        'Varian produk berhasil ditambahkan',
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

  static async updateProductVariant(c: Context): Promise<Response> {
    let resizedImagePath: string | undefined;

    try {
      const body = await c.req.parseBody();
      const file = body['image'] as File | undefined;

      if (file) {
        resizedImagePath = await SharpUtils.saveProductVariantImage(file);
      }

      const request: IUpdateProductVariantRequest = {
        id: c.req.param('id'),
        imageUrl: resizedImagePath,
        ...Object.fromEntries(
          Object.entries(body).filter(([key]) => key !== 'image'),
        ),
      } as IUpdateProductVariantRequest;

      const response = await ProductVariantService.update(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Varian produk berhasil diperbarui',
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

  static async editStock(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      const request: IEditStockRequest = {
        id: c.req.param('id'),
        stock: body.stock,
      };

      const response = await ProductVariantService.editStock(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Stok varian produk berhasil diperbarui',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getProductVariantById(c: Context): Promise<Response> {
    try {
      const request: IGetProductVariantRequest = {
        id: c.req.param('id'),
      };
      const response = await ProductVariantService.getById(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Varian produk berhasil ditemukan',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getAllProductVariants(c: Context): Promise<Response> {
    try {
      const request: IGetAllProductVariantsRequest = {
        productId:
          c.req.param('productId') || (c.req.query('productId') as string),
        page: c.req.query('page')
          ? parseInt(c.req.query('page') as string, 10)
          : 1,
        limit: c.req.query('limit')
          ? parseInt(c.req.query('limit') as string, 10)
          : 10,
      };

      const response = await ProductVariantService.getAll(request);
      return successResponse(
        c,
        StatusCodes.OK,
        'Daftar varian produk berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteProductVariant(c: Context): Promise<Response> {
    try {
      const request: IDeleteProductVariantRequest = {
        id: c.req.param('id'),
      };
      await ProductVariantService.delete(request);
      return successResponse(c, StatusCodes.OK, 'Varian produk berhasil dihapus');
    } catch (error) {
      throw error;
    }
  }
}
