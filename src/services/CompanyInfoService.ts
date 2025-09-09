import { StatusCodes } from 'http-status-codes';

import { db as database } from '../configs/database';
import type {
  ICreateCompanyInfoRequest,
  ICreateCompanyInfoResponse,
  IGetCompanyInfoResponse,
  IUpdateCompanyInfoRequest,
  IUpdateCompanyInfoResponse,
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { CompanyInfoRepository, ShippingRepository } from '../repositories';
import { Validator } from '../utils';
import { CompanyInfoValidation } from '../validations';

export class CompanyInfoService {
  static async createCompanyInfo(
    request: ICreateCompanyInfoRequest,
  ): Promise<ICreateCompanyInfoResponse> {
    const validData = Validator.validate(
      CompanyInfoValidation.CREATE_COMPANY_INFO,
      request,
    );

    const existingCompanyInfo = await CompanyInfoRepository.findFirst();

    if (existingCompanyInfo) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Informasi perusahaan sudah ada',
      );
    }

    const province = await ShippingRepository.getProvince(validData.province);

    if (!province) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Provinsi tidak valid');
    }

    const city = await ShippingRepository.getCity(
      validData.province,
      validData.city,
    );
    if (!city) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Kota tidak valid');
    }

    const district = await ShippingRepository.getDistrict(
      validData.city,
      validData.district,
    );
    if (!district) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Kecamatan tidak valid');
    }

    const subDistrict = await ShippingRepository.getSubDistrict(
      validData.district,
      validData.subDistrict,
    );
    if (!subDistrict) {
      throw new ResponseError(
        StatusCodes.BAD_REQUEST,
        'Kelurahan/Desa tidak valid',
      );
    }

    const createData = {
      companyName: validData.companyName,
      email: validData.email,
      phoneNumber: validData.phoneNumber,
      province: province.name,
      provinceId: province.id,
      city: city.name,
      cityId: city.id,
      district: district.name,
      districtId: district.id,
      subDistrict: subDistrict.name,
      subDistrictId: subDistrict.id,
      fullAddress: validData.fullAddress,
      postalCode: subDistrict.zip_code,
      npwp: validData.npwp,
    };

    const createdCompanyInfo = await CompanyInfoRepository.create(createData);

    return createdCompanyInfo;
  }

  static async getCompanyInfo(): Promise<IGetCompanyInfoResponse> {
    const companyInfo = await CompanyInfoRepository.findFirst();

    if (!companyInfo) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Informasi perusahaan tidak ditemukan',
      );
    }

    return companyInfo;
  }

  static async updateCompanyInfo(
    request: IUpdateCompanyInfoRequest,
  ): Promise<IUpdateCompanyInfoResponse> {
    const validData = Validator.validate(
      CompanyInfoValidation.UPDATE_COMPANY_INFO,
      request,
    );

    let updateData: any = {
      companyName: validData.companyName,
      email: validData.email,
      phoneNumber: validData.phoneNumber,
      fullAddress: validData.fullAddress,
    };

    const isUpdatingLocation =
      validData.province ||
      validData.city ||
      validData.district ||
      validData.subDistrict;

    if (isUpdatingLocation) {
      if (
        !(
          validData.province &&
          validData.city &&
          validData.district &&
          validData.subDistrict
        )
      ) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Jika ingin mengupdate lokasi, semua field (province, city, district, subDistrict) wajib diisi',
        );
      }
    }

    if (isUpdatingLocation) {
      const province = await ShippingRepository.getProvince(validData.province);
      if (!province) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Provinsi tidak valid',
        );
      }

      const city = await ShippingRepository.getCity(
        province.id,
        validData.city,
      );
      if (!city) {
        throw new ResponseError(StatusCodes.BAD_REQUEST, 'Kota tidak valid');
      }

      const district = await ShippingRepository.getDistrict(
        city.id,
        validData.district,
      );
      if (!district) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Kecamatan tidak valid',
        );
      }

      const subDistrict = await ShippingRepository.getSubDistrict(
        district.id,
        validData.subDistrict,
      );
      if (!subDistrict) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Kelurahan/Desa tidak valid',
        );
      }

      updateData.province = province.name;
      updateData.provinceId = province.id;
      updateData.city = city.name;
      updateData.cityId = city.id;
      updateData.district = district.name;
      updateData.districtId = district.id;
      updateData.subDistrict = subDistrict.name;
      updateData.subDistrictId = subDistrict.id;
    }

    const existingCompanyInfo = await CompanyInfoRepository.findFirst();
    if (!existingCompanyInfo) {
      throw new ResponseError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Informasi perusahaan tidak ditemukan',
      );
    }

    const db = database;

    try {
      const beginTransaction = await db.$transaction(async tx => {
        const updatedCompanyInfo = await CompanyInfoRepository.update(
          existingCompanyInfo.id,
          updateData,
          tx,
        );

        return updatedCompanyInfo;
      });

      return beginTransaction;
    } catch (error) {
      throw error;
    }
  }
}
