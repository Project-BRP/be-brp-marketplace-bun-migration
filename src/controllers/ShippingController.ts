import type { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';

import {
  IGetCitiesRequest,
  IGetDistrictsRequest,
  IGetSubDistrictsRequest,
  ICheckCostRequest,
  ITrackShippingRequest,
} from '../dtos';
import { ShippingService } from '../services';
import { successResponse } from '../utils';

export class ShippingController {
  static async getProvinces(c: Context): Promise<void> {
    try {
      const response = await ShippingService.getProvinces();
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar provinsi berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getCities(c: Context): Promise<void> {
    try {
      const request = {
        provinceId: Number(c.req.param().provinceId),
      } as IGetCitiesRequest;

      const response = await ShippingService.getCities(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar kota berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getDistricts(c: Context): Promise<void> {
    try {
      const request = {
        provinceId: Number(c.req.param().provinceId),
        cityId: Number(c.req.param().cityId),
      } as IGetDistrictsRequest;

      const response = await ShippingService.getDistricts(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar kecamatan berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async getSubDistricts(c: Context): Promise<void> {
    try {
      const request = {
        provinceId: Number(c.req.param().provinceId),
        cityId: Number(c.req.param().cityId),
        districtId: Number(c.req.param().districtId),
      } as IGetSubDistrictsRequest;

      const response = await ShippingService.getSubDistricts(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Daftar kelurahan berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async checkCost(c: Context): Promise<void> {
    try {
      const request = (await c.req.json()) as ICheckCostRequest;
      const response = await ShippingService.checkCost(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Estimasi biaya pengiriman berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async track(c: Context): Promise<void> {
    try {
      const request: ITrackShippingRequest = {
        transactionId: c.req.param().transactionId,
        userId: c.get('user').userId,
        userRole: c.get('user').role,
      };
      const response = await ShippingService.trackTransaction(request);
      successResponse(
        c,
        StatusCodes.OK,
        'Status pengiriman berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }

  static async trackMock(c: Context): Promise<void> {
    try {
      const request: ITrackShippingRequest = {
        transactionId: c.req.param().transactionId,
        userId: c.get('user').userId,
        userRole: c.get('user').role,
      };
      const response = await ShippingService.trackTransaction(request, {
        mock: true,
      });
      successResponse(
        c,
        StatusCodes.OK,
        'Status pengiriman (mock) berhasil diambil',
        response,
      );
    } catch (error) {
      throw error;
    }
  }
}
