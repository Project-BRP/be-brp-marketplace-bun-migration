import fs from 'fs';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import type {
  ICreateProductVariantRequest,
  ICreateProductVariantResponse,
  IUpdateProductVariantRequest,
  IUpdateProductVariantResponse,
  IGetProductVariantRequest,
  IGetProductVariantResponse,
  IGetAllProductVariantsRequest,
  IGetAllProductVariantsResponse,
  IEditStockRequest,
  IEditStockResponse,
  IDeleteProductVariantRequest,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import {
  ProductRepository,
  PackagingRepository,
  ProductVariantRepository,
  TransactionItemRepository,
  TransactionRepository,
} from '../repositories';
import { Validator } from '../utils';
import { ProductVariantValidation } from '../validations';
import { db } from '../configs/database';
import { TxDeliveryStatus, TxManualStatus } from '@prisma/client';
import { IoService } from './IoService';

export class ProductVariantService {
  static async create(
    request: ICreateProductVariantRequest,
  ): Promise<ICreateProductVariantResponse> {
    const validData = Validator.validate(
      ProductVariantValidation.CREATE,
      request,
    );

    const product = await ProductRepository.findById(validData.productId);
    if (!product) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
    }

    let packaging = null;

    if (validData.packagingId) {
      packaging = await PackagingRepository.findById(validData.packagingId);
      if (!packaging) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Kemasan tidak ditemukan',
        );
      }
    }

    const newProductVariant = await ProductVariantRepository.create({
      id: 'PRV-' + uuid(),
      product: {
        connect: { id: validData.productId },
      },
      weight_in_kg: validData.weight_in_kg,
      packaging: {
        connect: { id: validData.packagingId },
      },
      imageUrl: validData.imageUrl,
      priceRupiah: validData.priceRupiah,
      stock: validData.stock,
    });

    return {
      id: newProductVariant.id,
      productId: newProductVariant.productId,
      weight_in_kg: newProductVariant.weight_in_kg,
      packaging: packaging
        ? {
            id: packaging.id,
            name: packaging.name,
          }
        : undefined,
      imageUrl: newProductVariant.imageUrl,
      stock: newProductVariant.stock,
      priceRupiah: newProductVariant.priceRupiah,
      createdAt: newProductVariant.createdAt,
      updatedAt: newProductVariant.updatedAt,
    };
  }

  static async update(
    request: IUpdateProductVariantRequest,
  ): Promise<IUpdateProductVariantResponse> {
    const validData = Validator.validate(
      ProductVariantValidation.UPDATE,
      request,
    );

    const productVariant = await ProductVariantRepository.findById(
      validData.id,
    );
    if (!productVariant) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Varian produk tidak ditemukan',
      );
    }

    if (validData.packagingId) {
      const packaging = await PackagingRepository.findById(
        validData.packagingId,
      );
      if (!packaging) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Kemasan tidak ditemukan',
        );
      }
    }

    const product = await ProductRepository.findById(productVariant.productId);

    if (!product) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
    }

    if (validData.imageUrl && productVariant.imageUrl) {
      const assetDir = process.env.UPLOADS_PATH;
      const imagePath = path.join(assetDir, productVariant.imageUrl);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    let updatedProductVariant;

    if (validData.packagingId) {
      updatedProductVariant = await ProductVariantRepository.update(
        validData.id,
        {
          weight_in_kg: validData.weight_in_kg,
          packaging: {
            connect: { id: validData.packagingId },
          },
          imageUrl: validData.imageUrl,
          priceRupiah: validData.priceRupiah,
        },
      );
      return {
        id: updatedProductVariant.id,
        productId: updatedProductVariant.productId,
        weight_in_kg: updatedProductVariant.weight_in_kg,
        packaging: {
          id: updatedProductVariant.packaging.id,
          name: updatedProductVariant.packaging.name,
        },
        imageUrl: updatedProductVariant.imageUrl,
        stock: updatedProductVariant.stock,
        priceRupiah: updatedProductVariant.priceRupiah,
        createdAt: updatedProductVariant.createdAt,
        updatedAt: updatedProductVariant.updatedAt,
      };
    }

    updatedProductVariant = await ProductVariantRepository.update(
      validData.id,
      {
        weight_in_kg: validData.weight_in_kg,
        imageUrl: validData.imageUrl,
        priceRupiah: validData.priceRupiah,
      },
    );

    return {
      id: updatedProductVariant.id,
      productId: updatedProductVariant.productId,
      weight_in_kg: updatedProductVariant.weight_in_kg,
      packaging: updatedProductVariant.packaging
        ? {
            id: updatedProductVariant.packaging.id,
            name: updatedProductVariant.packaging.name,
          }
        : undefined,
      imageUrl: updatedProductVariant.imageUrl,
      priceRupiah: updatedProductVariant.priceRupiah,
      stock: updatedProductVariant.stock,
      createdAt: updatedProductVariant.createdAt,
      updatedAt: updatedProductVariant.updatedAt,
    };
  }

  static async editStock(
    request: IEditStockRequest,
  ): Promise<IEditStockResponse> {
    const validData = Validator.validate(
      ProductVariantValidation.EDIT_STOCK,
      request,
    );

    if (validData.stock === 0) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Jumlah stok tidak boleh nol',
      );
    }

    const dbConnection = db;

    try {
      const beginTransaction = await dbConnection.$transaction(async tx => {
        const productVariant = await ProductVariantRepository.findById(
          validData.id,
          tx,
        );
        if (!productVariant) {
          throw new ResponseError(
            StatusCodes.NOT_FOUND,
            'Varian produk tidak ditemukan',
          );
        }

        let updatedProductVariant;

        if (validData.stock + productVariant.stock < 0) {
          updatedProductVariant = await ProductVariantRepository.update(
            validData.id,
            {
              stock: 0,
            },
            tx,
          );
        } else {
          updatedProductVariant = await ProductVariantRepository.update(
            validData.id,
            {
              stock: productVariant.stock + validData.stock,
            },
            tx,
          );
        }

        if (validData.stock > 0) {
          const stockIssueItems = await TransactionItemRepository.findMany(
            {
              variantId: updatedProductVariant.id,
              isStockIssue: true,
              transaction: {
                OR: [
                  { deliveryStatus: TxDeliveryStatus.PAID },
                  { manualStatus: TxManualStatus.PAID },
                ],
              },
            },
            tx,
          );

          let available = updatedProductVariant.stock;
          let transaction;
          for (const item of stockIssueItems) {
            if (available >= item.quantity) {
              transaction = await TransactionRepository.findById(
                item.transactionId,
                tx,
              );
              if (
                transaction.deliveryStatus !== TxDeliveryStatus.PAID &&
                transaction.manualStatus !== TxManualStatus.PAID
              ) {
                continue;
              }

              await ProductVariantRepository.update(
                updatedProductVariant.id,
                { stock: { decrement: item.quantity } },
                tx,
              );
              await TransactionItemRepository.updateById(
                item.id,
                { isStockIssue: false },
                tx,
              );
              available -= item.quantity;
            } else {
              break;
            }
          }

          if (available !== updatedProductVariant.stock) {
            updatedProductVariant = await ProductVariantRepository.findById(
              updatedProductVariant.id,
              tx,
            );
          }
        }

        return {
          id: updatedProductVariant.id,
          stock: updatedProductVariant.stock,
          productId: updatedProductVariant.productId,
          weight_in_kg: updatedProductVariant.weight_in_kg,
          packaging: updatedProductVariant.packaging
            ? {
                id: updatedProductVariant.packaging.id,
                name: updatedProductVariant.packaging.name,
              }
            : undefined,
          imageUrl: updatedProductVariant.imageUrl,
          priceRupiah: updatedProductVariant.priceRupiah,
          createdAt: updatedProductVariant.createdAt,
          updatedAt: updatedProductVariant.updatedAt,
        };
      });
      IoService.emitTransaction();
      return beginTransaction;
    } catch (error) {
      throw error;
    }
  }

  static async getById(
    request: IGetProductVariantRequest,
  ): Promise<IGetProductVariantResponse> {
    const validData = Validator.validate(
      ProductVariantValidation.GET_BY_ID,
      request,
    );

    const productVariant = await ProductVariantRepository.findById(
      validData.id,
    );
    if (!productVariant) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Varian produk tidak ditemukan',
      );
    }

    return {
      id: productVariant.id,
      productId: productVariant.productId,
      weight_in_kg: productVariant.weight_in_kg,
      packaging: productVariant.packaging
        ? {
            id: productVariant.packaging.id,
            name: productVariant.packaging.name,
          }
        : undefined,
      imageUrl: productVariant.imageUrl,
      stock: productVariant.stock,
      priceRupiah: productVariant.priceRupiah,
      createdAt: productVariant.createdAt,
      updatedAt: productVariant.updatedAt,
    };
  }

  static async getAll(
    request: IGetAllProductVariantsRequest,
  ): Promise<IGetAllProductVariantsResponse> {
    const validData = Validator.validate(
      ProductVariantValidation.GET_ALL,
      request,
    );

    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const productId = validData.productId;

    if (!take || !validData.page) {
      const productVariants =
        await ProductVariantRepository.findByProduct(productId);

      return {
        totalPage: 1,
        currentPage: 1,
        variants: productVariants.map(variant => ({
          id: variant.id,
          productId: variant.productId,
          weight_in_kg: variant.weight_in_kg,
          packaging: variant.packaging
            ? {
                id: variant.packaging.id,
                name: variant.packaging.name,
              }
            : undefined,
          imageUrl: variant.imageUrl,
          priceRupiah: variant.priceRupiah,
          stock: variant.stock,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        })),
      };
    }

    const totalProductVariants =
      await ProductVariantRepository.count(productId);

    if (totalProductVariants === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        variants: [],
      };
    }

    if (skip >= totalProductVariants) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const productVariants =
      await ProductVariantRepository.findByProductWithPagination(
        skip,
        take,
        productId,
      );

    const totalPage = Math.ceil(totalProductVariants / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      variants: productVariants.map(variant => ({
        id: variant.id,
        productId: variant.productId,
        weight_in_kg: variant.weight_in_kg,
        packaging: variant.packaging
          ? {
              id: variant.packaging.id,
              name: variant.packaging.name,
            }
          : undefined,
        imageUrl: variant.imageUrl,
        priceRupiah: variant.priceRupiah,
        stock: variant.stock,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      })),
    };
  }

  static async delete(request: IDeleteProductVariantRequest): Promise<void> {
    const validData = Validator.validate(
      ProductVariantValidation.DELETE,
      request,
    );

    const productVariant = await ProductVariantRepository.findById(
      validData.id,
    );
    if (!productVariant) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Varian produk tidak ditemukan',
      );
    }

    if (productVariant.imageUrl) {
      const assetDir = process.env.UPLOADS_PATH;
      const imagePath = path.join(assetDir, productVariant.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await ProductVariantRepository.update(validData.id, {
      isDeleted: true,
      imageUrl: null,
    });
  }
}
