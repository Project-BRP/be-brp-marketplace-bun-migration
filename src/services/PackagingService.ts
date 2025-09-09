import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import type {
  ICreatePackagingRequest,
  ICreatePackagingResponse,
  IGetPackagingRequest,
  IGetPackagingResponse,
  IGetAllPackagingsRequest,
  IGetAllPackagingsResponse,
  IUpdatePackagingRequest,
  IUpdatePackagingResponse,
  IDeletePackagingRequest,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { PackagingRepository } from '../repositories';
import { Validator } from '../utils';
import { PackagingValidation } from '../validations';

export class PackagingService {
  static async create(
    request: ICreatePackagingRequest,
  ): Promise<ICreatePackagingResponse> {
    const validData = Validator.validate(PackagingValidation.CREATE, request);

    const existingPackaging = await PackagingRepository.findByName(
      validData.name,
    );
    if (existingPackaging) {
      throw new ResponseError(StatusCodes.CONFLICT, 'Nama kemasan sudah ada');
    }

    const newPackaging = await PackagingRepository.create({
      id: 'PKG-' + uuid(),
      name: validData.name,
    });

    return {
      id: newPackaging.id,
      name: newPackaging.name,
      createdAt: newPackaging.createdAt,
      updatedAt: newPackaging.updatedAt,
    };
  }

  static async update(
    request: IUpdatePackagingRequest,
  ): Promise<IUpdatePackagingResponse> {
    const validData = Validator.validate(PackagingValidation.UPDATE, request);

    const packaging = await PackagingRepository.findById(validData.id);
    if (!packaging) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kemasan tidak ditemukan');
    }

    const existingPackaging = await PackagingRepository.findByName(
      validData.name,
    );
    if (existingPackaging && existingPackaging.id !== validData.id) {
      throw new ResponseError(StatusCodes.CONFLICT, 'Nama kemasan sudah ada');
    }

    const updatedPackaging = await PackagingRepository.update(validData.id, {
      name: validData.name,
    });

    return {
      id: updatedPackaging.id,
      name: updatedPackaging.name,
      createdAt: updatedPackaging.createdAt,
      updatedAt: updatedPackaging.updatedAt,
    };
  }

  static async getById(
    request: IGetPackagingRequest,
  ): Promise<IGetPackagingResponse> {
    const validData = Validator.validate(
      PackagingValidation.GET_BY_ID,
      request,
    );

    const packaging = await PackagingRepository.findById(validData.id);
    if (!packaging) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kemasan tidak ditemukan');
    }

    return {
      id: packaging.id,
      name: packaging.name,
      createdAt: packaging.createdAt,
      updatedAt: packaging.updatedAt,
    };
  }

  static async getAll(
    request: IGetAllPackagingsRequest,
  ): Promise<IGetAllPackagingsResponse> {
    const validData = Validator.validate(PackagingValidation.GET_ALL, request);

    const take = validData.limit;
    const skip = (validData.page - 1) * take;
    const search = validData.search;

    if (!take || !validData.page) {
      const packagings = await PackagingRepository.findAll(
        search,
        undefined,
        undefined,
      );

      return {
        totalPage: 1,
        currentPage: 1,
        packagings: packagings.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          createdAt: pkg.createdAt,
          updatedAt: pkg.updatedAt,
        })),
      };
    }

    const totalPackagings = await PackagingRepository.count(search);

    if (totalPackagings === 0) {
      return {
        totalPage: 1,
        currentPage: 1,
        packagings: [],
      };
    }

    if (skip >= totalPackagings) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Halaman tidak valid');
    }

    const packagings = await PackagingRepository.findAllWithPagination(
      skip,
      take,
      search,
      undefined,
      undefined,
    );

    const totalPage = Math.ceil(totalPackagings / take);
    const currentPage = Math.ceil(skip / take) + 1;

    return {
      totalPage,
      currentPage,
      packagings: packagings.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      })),
    };
  }

  static async delete(request: IDeletePackagingRequest): Promise<void> {
    const validData = Validator.validate(PackagingValidation.DELETE, request);

    const packaging = await PackagingRepository.findById(validData.id);
    if (!packaging) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kemasan tidak ditemukan');
    }

    await PackagingRepository.delete(validData.id);
  }
}
