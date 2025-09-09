import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import type {
  ICreateProductTypeRequest,
  IUpdateProductTypeRequest,
  IGetProductTypeRequest,
  IGetAllProductTypesRequest,
  IGetAllProductTypesResponse,
  ICreateProductTypeResponse,
  IGetProductTypeResponse,
  IUpdateProductTypeResponse,
  IDeleteProductTypeRequest,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { ProductRepository, ProductTypeRepository } from '../repositories';
import { Validator } from '../utils';
import { ProductTypeValidation } from '../validations';

export class ProductTypeService {
  static async create(
    request: ICreateProductTypeRequest,
  ): Promise<ICreateProductTypeResponse> {
    const validData = Validator.validate(ProductTypeValidation.CREATE, request);

    const existingProductType = await ProductTypeRepository.findByName(
      validData.name,
    );

    if (existingProductType) {
      throw new ResponseError(
        StatusCodes.CONFLICT,
        'Nama tipe produk sudah ada',
      );
    }

    const newProductType = await ProductTypeRepository.create({
      id: 'PTY-' + uuid(),
      name: validData.name,
    });

    return {
      id: newProductType.id,
      name: newProductType.name,
      createdAt: newProductType.createdAt,
      updatedAt: newProductType.updatedAt,
    };
  }

  static async update(
    request: IUpdateProductTypeRequest,
  ): Promise<IUpdateProductTypeResponse> {
    const validData = Validator.validate(ProductTypeValidation.UPDATE, request);

    const productType = await ProductTypeRepository.findById(validData.id);
    if (!productType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Tipe Produk tidak ditemukan',
      );
    }

    const updatedProductType = await ProductTypeRepository.update(
      validData.id,
      {
        name: validData.name,
      },
    );

    return {
      id: updatedProductType.id,
      name: updatedProductType.name,
      createdAt: updatedProductType.createdAt,
      updatedAt: updatedProductType.updatedAt,
    };
  }

  static async getById(
    request: IGetProductTypeRequest,
  ): Promise<IGetProductTypeResponse> {
    const validData = Validator.validate(
      ProductTypeValidation.GET_BY_ID,
      request,
    );

    const productType = await ProductTypeRepository.findById(validData.id);
    if (!productType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Tipe Produk tidak ditemukan',
      );
    }

    return {
      id: productType.id,
      name: productType.name,
      createdAt: productType.createdAt,
      updatedAt: productType.updatedAt,
    };
  }

  static async getAll(
    request: IGetAllProductTypesRequest,
  ): Promise<IGetAllProductTypesResponse> {
    const validData = Validator.validate(
      ProductTypeValidation.GET_ALL,
      request,
    );

    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;

    if (!take || !validData.page) {
      const productTypes = await ProductTypeRepository.findAll(search);

      return {
        totalPage: 1,
        currentPage: 1,
        productTypes: productTypes.map(type => ({
          id: type.id,
          name: type.name,
          createdAt: type.createdAt,
          updatedAt: type.updatedAt,
        })),
      };
    }

    const totalProductTypes = await ProductTypeRepository.count(search);

    if (totalProductTypes === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        productTypes: [],
      };
    }

    if (skip >= totalProductTypes) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const productTypes = await ProductTypeRepository.findAllWithPagination(
      skip,
      take,
      search,
    );

    const totalPage = Math.ceil(totalProductTypes / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      productTypes: productTypes.map(type => ({
        id: type.id,
        name: type.name,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      })),
    };
  }

  static async delete(request: IDeleteProductTypeRequest): Promise<void> {
    const validData = Validator.validate(ProductTypeValidation.DELETE, request);

    const productType = await ProductTypeRepository.findById(validData.id);
    if (!productType) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Tipe Produk tidak ditemukan',
      );
    }

    const associatedProducts = await ProductRepository.findByType(validData.id);
    if (associatedProducts.length > 0) {
      throw new ResponseError(
        StatusCodes.CONFLICT,
        'Tipe Produk tidak dapat dihapus karena masih digunakan',
      );
    }

    await ProductTypeRepository.delete(validData.id);
  }
}
