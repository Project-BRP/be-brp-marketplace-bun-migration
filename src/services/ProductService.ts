import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

import type {
  ICreateProductRequest,
  IUpdateProductRequest,
  IGetProductRequest,
  IGetAllProductsRequest,
  IGetAllProductsResponse,
  ICreateProductResponse,
  IGetProductResponse,
  IUpdateProductResponse,
  IDeleteProductRequest,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import {
  ProductRepository,
  ProductTypeRepository,
  ProductVariantRepository,
} from '../repositories';
import { Validator } from '../utils';
import { ProductValidation } from '../validations';

export class ProductService {
  static async create(
    request: ICreateProductRequest,
  ): Promise<ICreateProductResponse> {
    const validData = Validator.validate(ProductValidation.CREATE, request);

    const existingProduct = await ProductRepository.findByName(validData.name);

    if (existingProduct) {
      throw new ResponseError(StatusCodes.CONFLICT, 'Nama produk sudah ada');
    }

    const productType = await ProductTypeRepository.findById(
      validData.productTypeId,
    );
    if (!productType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Tipe Produk tidak ditemukan',
      );
    }

    const newProduct = await ProductRepository.create({
      id: 'PRD-' + uuid(),
      name: validData.name,
      description: validData.description,
      productType: {
        connect: { id: validData.productTypeId },
      },
      composition: validData.composition,
      imageUrl: validData.imageUrl,
      storageInstructions: validData.storageInstructions,
      expiredDurationInYears: validData.expiredDurationInYears,
      usageInstructions: validData.usageInstructions,
      benefits: validData.benefits,
    });

    return {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      productType: {
        id: productType.id,
        name: productType.name,
      },
      composition: newProduct.composition, // Tambahkan composition
      imageUrl: newProduct.imageUrl, // Tambahkan imageUrl
      storageInstructions: newProduct.storageInstructions,
      expiredDurationInYears: newProduct.expiredDurationInYears,
      usageInstructions: newProduct.usageInstructions,
      benefits: newProduct.benefits,
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt,
    };
  }

  static async update(
    request: IUpdateProductRequest,
  ): Promise<IUpdateProductResponse> {
    const validData = Validator.validate(ProductValidation.UPDATE, request);

    const product = await ProductRepository.findById(validData.id);
    if (!product) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
    }

    if (validData.productTypeId) {
      const productType = await ProductTypeRepository.findById(
        validData.productTypeId,
      );
      if (!productType) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Tipe Produk tidak ditemukan',
        );
      }
    }

    if (validData.imageUrl && product.imageUrl) {
      const assetDir = process.env.UPLOADS_PATH;
      const imagePath = path.join(assetDir, product.imageUrl);

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const updatedProduct = await ProductRepository.update(validData.id, {
      name: validData.name,
      description: validData.description,
      productType: validData.productTypeId
        ? { connect: { id: validData.productTypeId } }
        : undefined,
      composition: validData.composition,
      imageUrl: validData.imageUrl,
      storageInstructions: validData.storageInstructions,
      expiredDurationInYears: validData.expiredDurationInYears,
      usageInstructions: validData.usageInstructions,
      benefits: validData.benefits,
    });

    const productType = await ProductTypeRepository.findById(
      updatedProduct.productTypeId,
    );
    if (!productType) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Tipe Produk terkait tidak ditemukan',
      );
    }

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      productType: {
        id: productType.id,
        name: productType.name,
      },
      composition: updatedProduct.composition,
      imageUrl: updatedProduct.imageUrl,
      storageInstructions: updatedProduct.storageInstructions,
      expiredDurationInYears: updatedProduct.expiredDurationInYears,
      usageInstructions: updatedProduct.usageInstructions,
      benefits: updatedProduct.benefits,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  }

  static async getById(
    request: IGetProductRequest,
  ): Promise<IGetProductResponse> {
    const validData = Validator.validate(ProductValidation.GET_BY_ID, request);

    const product = await ProductRepository.findById(validData.id);
    if (!product) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      productType: product.productType
        ? { id: product.productType.id, name: product.productType.name }
        : undefined,
      composition: product.composition,
      imageUrl: product.imageUrl,
      storageInstructions: product.storageInstructions,
      expiredDurationInYears: product.expiredDurationInYears,
      usageInstructions: product.usageInstructions,
      benefits: product.benefits,
      variants: product.productVariants.map(variant => ({
        id: variant.id,
        productId: variant.productId,
        weight_in_kg: variant.weight_in_kg,
        packagingId: variant.packagingId,
        imageUrl: variant.imageUrl,
        priceRupiah: variant.priceRupiah,
        stock: variant.stock,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static async getAll(
    request: IGetAllProductsRequest,
  ): Promise<IGetAllProductsResponse> {
    const validData = Validator.validate(ProductValidation.GET_ALL, request);

    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;
    const productTypeId = validData.productTypeId;

    if (!take || !validData.page) {
      const products = await ProductRepository.findAll(search, productTypeId);

      return {
        totalPage: 1,
        currentPage: 1,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          productType: product.productType
            ? { id: product.productType.id, name: product.productType.name }
            : undefined,
          composition: product.composition,
          imageUrl: product.imageUrl,
          storageInstructions: product.storageInstructions,
          expiredDurationInYears: product.expiredDurationInYears,
          usageInstructions: product.usageInstructions,
          benefits: product.benefits,
          variants: product.productVariants.map(variant => ({
            id: variant.id,
            productId: variant.productId,
            weight_in_kg: variant.weight_in_kg,
            packagingId: variant.packagingId,
            imageUrl: variant.imageUrl,
            stock: variant.stock,
            priceRupiah: variant.priceRupiah,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt,
          })),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      };
    }

    const totalProducts = await ProductRepository.count(search, productTypeId);

    if (totalProducts === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        products: [],
      };
    }

    if (skip >= totalProducts) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const products = await ProductRepository.findAllWithPagination(
      skip,
      take,
      search,
      productTypeId,
    );

    const totalPage = Math.ceil(totalProducts / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        productType: product.productType
          ? { id: product.productType.id, name: product.productType.name }
          : undefined,
        composition: product.composition,
        imageUrl: product.imageUrl,
        storageInstructions: product.storageInstructions,
        expiredDurationInYears: product.expiredDurationInYears,
        usageInstructions: product.usageInstructions,
        benefits: product.benefits,
        variants: product.productVariants.map(variant => ({
          id: variant.id,
          productId: variant.productId,
          weight_in_kg: variant.weight_in_kg,
          packagingId: variant.packagingId,
          imageUrl: variant.imageUrl,
          stock: variant.stock,
          priceRupiah: variant.priceRupiah,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    };
  }

  static async delete(request: IDeleteProductRequest): Promise<void> {
    const validData = Validator.validate(ProductValidation.DELETE, request);

    const product = await ProductRepository.findById(validData.id);
    if (!product) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Produk tidak ditemukan');
    }

    if (product.productVariants.length > 0) {
      for (const variant of product.productVariants) {
        if (variant.imageUrl) {
          const assetDir = process.env.UPLOADS_PATH;
          const imagePath = path.join(assetDir, variant.imageUrl);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }

      await ProductVariantRepository.updateByProductId(validData.id, {
        isDeleted: true,
        imageUrl: null,
      });
    }

    if (product.imageUrl) {
      const assetDir = process.env.UPLOADS_PATH;
      const imagePath = path.join(assetDir, product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await ProductRepository.update(validData.id, {
      isDeleted: true,
      imageUrl: null,
    });
  }
}
