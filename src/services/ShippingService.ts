import { StatusCodes } from 'http-status-codes';

import {
  IProvince,
  ICity,
  IDistrict,
  ISubDistrict,
  ICheckWaybill,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import {
  CompanyInfoRepository,
  ShippingRepository,
  TransactionRepository,
  UserRepository,
} from '../repositories';
import { ShippingUtils, Validator } from '../utils';
import { ShippingValidation } from '../validations';
import {
  IGetCitiesRequest,
  IGetDistrictsRequest,
  IGetSubDistrictsRequest,
  IShippingOption,
  ICheckCostRequest,
  ICheckCostResponse,
  ITrackShippingRequest,
  ITrackShippingResponse,
} from '../dtos';
import { Role } from '../constants';

export class ShippingService {
  static async getProvinces(): Promise<IProvince[]> {
    const provinces = await ShippingRepository.getProvinces();

    return provinces;
  }

  static async getCities(request: IGetCitiesRequest): Promise<ICity[]> {
    const validData = Validator.validate(
      ShippingValidation.GET_CITIES,
      request,
    );

    const province = await ShippingRepository.getProvince(validData.provinceId);

    if (!province) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Provinsi tidak ditemukan',
      );
    }

    const cities = await ShippingRepository.getCities(province.id);

    return cities;
  }

  static async getDistricts(
    request: IGetDistrictsRequest,
  ): Promise<IDistrict[]> {
    const validData = Validator.validate(
      ShippingValidation.GET_DISTRICTS,
      request,
    );

    const province = await ShippingRepository.getProvince(validData.provinceId);

    if (!province) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Provinsi tidak ditemukan',
      );
    }

    const city = await ShippingRepository.getCity(
      province.id,
      validData.cityId,
    );

    if (!city) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kota tidak ditemukan');
    }

    const districts = await ShippingRepository.getDistricts(city.id);

    return districts;
  }

  static async getSubDistricts(
    request: IGetSubDistrictsRequest,
  ): Promise<ISubDistrict[]> {
    const validData = Validator.validate(
      ShippingValidation.GET_SUB_DISTRICTS,
      request,
    );

    const province = await ShippingRepository.getProvince(validData.provinceId);

    if (!province) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Provinsi tidak ditemukan',
      );
    }

    const city = await ShippingRepository.getCity(
      province.id,
      validData.cityId,
    );

    if (!city) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'Kota tidak ditemukan');
    }

    const district = await ShippingRepository.getDistrict(
      city.id,
      validData.districtId,
    );

    if (!district) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Kecamatan tidak ditemukan',
      );
    }

    const subDistricts = await ShippingRepository.getSubDistricts(district.id);

    return subDistricts;
  }

  static async checkCost(
    request: ICheckCostRequest,
  ): Promise<ICheckCostResponse> {
    const validData = Validator.validate(
      ShippingValidation.CHECK_COST,
      request,
    );

    const companyInfo = await CompanyInfoRepository.findFirst();

    let existingOrigin;

    existingOrigin = await ShippingRepository.getSubDistrict(
      companyInfo.districtId,
      companyInfo.subDistrictId,
    );

    if (!existingOrigin) {
      existingOrigin = await ShippingRepository.getDistrict(
        companyInfo.cityId,
        companyInfo.districtId,
      );
      if (!existingOrigin) {
        throw new ResponseError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Terjadi kesalahan saat memeriksa biaya pengiriman',
        );
      }
    }

    let existingDestination;

    existingDestination = await ShippingRepository.getSubDistrict(
      validData.destinationDistrict,
      validData.destinationSubDistrict,
    );

    if (!existingDestination) {
      existingDestination = await ShippingRepository.getDistrict(
        validData.destinationCity,
        validData.destinationDistrict,
      );
      if (!existingDestination) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Destinasi tidak valid',
        );
      }
    }

    const payload = {
      origin: existingOrigin.id.toString(),
      destination: existingDestination.id.toString(),
      weight: validData.weight_in_kg * 1000,
      courier: 'jne:sicepat:jnt:pos',
    };

    const shippingOptions: IShippingOption[] =
      await ShippingUtils.fetchShippingOptions(payload);

    return {
      shippingOptions,
    };
  }

  static async trackTransaction(
    request: ITrackShippingRequest,
    options?: { mock?: boolean },
  ): Promise<ITrackShippingResponse> {
    const validData = Validator.validate(
      ShippingValidation.TRACK_WAYBILL,
      request,
    );

    const transaction = await TransactionRepository.findById(
      validData.transactionId,
    );

    if (!transaction) {
      throw new ResponseError(
        StatusCodes.NOT_FOUND,
        'Transaksi tidak ditemukan',
      );
    }

    if (!transaction.shippingAgent || !transaction.shippingReceipt) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Transaksi belum memiliki informasi resi/kurtir',
      );
    }

    const isSelf = validData.userId === transaction.userId;
    const isAdmin = validData.userRole === Role.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ResponseError(
        StatusCodes.FORBIDDEN,
        'Anda tidak memiliki akses untuk melacak transaksi ini',
      );
    }

    const courier = transaction.shippingCode;
    const awb = transaction.shippingReceipt;

    const user = await UserRepository.findById(transaction.userId);

    if (!user) {
      throw new ResponseError(StatusCodes.NOT_FOUND, 'User tidak ditemukan');
    }

    const last_phone_number = user.phoneNumber.slice(-5);

    let waybill;
    const payload: ICheckWaybill = {
      awb,
      courier,
      last_phone_number,
    };
    if (options?.mock) {
      waybill = await ShippingUtils.mockWaybill(payload);
    } else {
      waybill = await ShippingUtils.fetchWaybill(payload);
    }

    return { waybill };
  }
}
