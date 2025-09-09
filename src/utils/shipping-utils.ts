import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import qs from 'qs';

import {
  IProvince,
  ICity,
  IDistrict,
  ISubDistrict,
  IRajaOngkirResponse,
  ICostCheckPayload,
  IShippingOption,
  ICheckWaybill, // <- kamu bikin sendiri di dtos
  IWaybillResponse, // <- kamu bikin sendiri di dtos
} from '../dtos';
import { ResponseError } from '../error/ResponseError';
import { currentEnv, Env, RAJAONGKIR_CONSTANTS } from '../constants';
import { appLogger } from '../configs/logger';

export class ShippingUtils {
  static async fetchProvinces(): Promise<IProvince[]> {
    try {
      const response = await axios.get<IRajaOngkirResponse<IProvince[]>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/destination/province`,
        {
          headers: { key: RAJAONGKIR_CONSTANTS.API_KEY },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkir API Response:', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch provinces',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('RajaOngkir API Error:', error.response?.data);
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch provinces',
        );
      }
      appLogger.error('Unexpected error in fetchProvinces:', error);
      throw error;
    }
  }

  static async fetchCities(provinceId: number): Promise<ICity[]> {
    try {
      const response = await axios.get<IRajaOngkirResponse<ICity[]>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/destination/city/${provinceId}`,
        {
          headers: { key: RAJAONGKIR_CONSTANTS.API_KEY },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkir API Response:', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch cities',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('RajaOngkir API Error:', error.response?.data);
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch cities',
        );
      }
      appLogger.error('Unexpected error in fetchCities:', error);
      throw error;
    }
  }

  static async fetchDistricts(cityId: number): Promise<IDistrict[]> {
    try {
      const response = await axios.get<IRajaOngkirResponse<IDistrict[]>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/destination/district/${cityId}`,
        {
          headers: { key: RAJAONGKIR_CONSTANTS.API_KEY },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkiri API Response:', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch districts',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('RajaOngkiri API Error:', error.response?.data);
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch districts',
        );
      }
      appLogger.error('Unexpected error in fetchDistricts:', error);
      throw error;
    }
  }

  static async fetchSubDistricts(districtId: number): Promise<ISubDistrict[]> {
    try {
      const response = await axios.get<IRajaOngkirResponse<ISubDistrict[]>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/destination/sub-district/${districtId}`,
        {
          headers: { key: RAJAONGKIR_CONSTANTS.API_KEY },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkiri API Response:', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch subdistricts',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('RajaOngkiri API Error:', error.response?.data);
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch subdistricts',
        );
      }
      appLogger.error('Unexpected error in fetchSubDistricts:', error);
      throw error;
    }
  }

  static async fetchShippingOptions(
    payload: ICostCheckPayload,
  ): Promise<IShippingOption[]> {
    try {
      const response = await axios.post<IRajaOngkirResponse<IShippingOption[]>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/calculate/domestic-cost`,
        qs.stringify(payload),
        {
          headers: {
            key: RAJAONGKIR_CONSTANTS.API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkiri API Response:', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch shipping options',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error('RajaOngkiri API Error:', error.response?.data);
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch shipping options',
        );
      }
      appLogger.error('Unexpected error in fetchShippingOptions:', error);
      throw error;
    }
  }

  static async fetchWaybill(payload: ICheckWaybill): Promise<IWaybillResponse> {
    try {
      const response = await axios.post<IRajaOngkirResponse<IWaybillResponse>>(
        `${RAJAONGKIR_CONSTANTS.API_URL}/track/waybill`,
        qs.stringify(payload),
        {
          headers: {
            key: RAJAONGKIR_CONSTANTS.API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (currentEnv === Env.DEVELOPMENT || currentEnv === Env.TESTING) {
        appLogger.info('RajaOngkir API Response (Waybill):', response.data);
      }

      const { meta, data } = response.data;
      if (meta.status !== 'success') {
        throw new ResponseError(
          meta.code,
          meta.message || 'Failed to fetch waybill',
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        appLogger.error(
          'RajaOngkir API Error (Waybill):',
          error.response?.data,
        );
        const meta = (error.response?.data as IRajaOngkirResponse<null>)?.meta;
        throw new ResponseError(
          meta?.code ||
            error.response?.status ||
            StatusCodes.INTERNAL_SERVER_ERROR,
          meta?.message || 'Failed to fetch waybill',
        );
      }
      appLogger.error('Unexpected error in fetchWaybill:', error);
      throw error;
    }
  }

  static async mockWaybill(payload: ICheckWaybill): Promise<IWaybillResponse> {
    const mocks: Record<
      string,
      Record<string, Record<string, IWaybillResponse>>
    > = {
      jne: {
        JNE123456: {
          '33333': {
            delivered: true,
            summary: {
              courier_code: 'jne',
              courier_name: 'Jalur Nugraha Ekakurir',
              waybill_number: 'JNE123456',
              waybill_date: '2024-10-10',
              shipper_name: 'TOKO ABC',
              receiver_name: 'BUDI',
              origin: 'Jakarta',
              destination: 'Bandung',
              status: 'DELIVERED',
            },
            delivery_status: {
              status: 'DELIVERED',
              pod_receiver: 'BUDI',
              pod_date: '2024-10-12',
              pod_time: '14:30:00',
            },
            manifest: [
              {
                manifest_description: 'Diterima di Checkpoint Jakarta',
                manifest_date: '2024-10-10',
                manifest_time: '08:00:00',
              },
              {
                manifest_description: 'Proses pengiriman ke Bandung',
                manifest_date: '2024-10-11',
                manifest_time: '09:00:00',
              },
              {
                manifest_description: 'Diterima oleh BUDI',
                manifest_date: '2024-10-12',
                manifest_time: '14:30:00',
              },
            ],
          },
        },
        JNE654321: {
          '11111': {
            delivered: false,
            summary: {
              courier_code: 'jne',
              courier_name: 'Jalur Nugraha Ekakurir',
              waybill_number: 'JNE654321',
              waybill_date: '2024-10-15',
              shipper_name: 'TOKO DEF',
              receiver_name: 'RINA',
              origin: 'Jakarta',
              destination: 'Semarang',
              status: 'ON PROCESS',
            },
            delivery_status: {
              status: 'ON PROCESS',
              pod_receiver: null,
              pod_date: null,
              pod_time: null,
            },
            manifest: [
              {
                manifest_description: 'Diterima di Checkpoint Jakarta',
                manifest_date: '2024-10-15',
                manifest_time: '10:00:00',
              },
            ],
          },
        },
      },
      sicepat: {
        SCP123456: {
          '': {
            delivered: false,
            summary: {
              courier_code: 'sicepat',
              courier_name: 'SiCepat Express',
              waybill_number: 'SCP123456',
              waybill_date: '2024-10-11',
              shipper_name: 'TOKO XYZ',
              receiver_name: 'ANI',
              origin: 'Surabaya',
              destination: 'Yogyakarta',
              status: 'ON PROCESS',
            },
            delivery_status: {
              status: 'ON PROCESS',
              pod_receiver: null,
              pod_date: null,
              pod_time: null,
            },
            manifest: [
              {
                manifest_description: 'Diterima di Surabaya',
                manifest_date: '2024-10-11',
                manifest_time: '10:00:00',
              },
              {
                manifest_description: 'Dalam perjalanan ke Yogyakarta',
                manifest_date: '2024-10-12',
                manifest_time: '11:15:00',
              },
            ],
          },
        },
      },
      jnt: {
        JNT123456: {
          '': {
            delivered: true,
            summary: {
              courier_code: 'jnt',
              courier_name: 'J&T Express',
              waybill_number: 'JNT123456',
              waybill_date: '2024-10-09',
              shipper_name: 'TOKO DEF',
              receiver_name: 'SITI',
              origin: 'Medan',
              destination: 'Aceh',
              status: 'DELIVERED',
            },
            delivery_status: {
              status: 'DELIVERED',
              pod_receiver: 'SITI',
              pod_date: '2024-10-11',
              pod_time: '12:00:00',
            },
            manifest: [
              {
                manifest_description: 'Diterima di Medan',
                manifest_date: '2024-10-09',
                manifest_time: '07:30:00',
              },
              {
                manifest_description: 'Pengiriman ke Aceh',
                manifest_date: '2024-10-10',
                manifest_time: '09:00:00',
              },
              {
                manifest_description: 'Diterima oleh SITI',
                manifest_date: '2024-10-11',
                manifest_time: '12:00:00',
              },
            ],
          },
        },
      },
      pos: {
        POS123456: {
          '': {
            delivered: false,
            summary: {
              courier_code: 'pos',
              courier_name: 'Pos Indonesia',
              waybill_number: 'POS123456',
              waybill_date: '2024-10-08',
              shipper_name: 'TOKO GHI',
              receiver_name: 'ANDI',
              origin: 'Denpasar',
              destination: 'Makassar',
              status: 'ON PROCESS',
            },
            delivery_status: {
              status: 'ON PROCESS',
              pod_receiver: null,
              pod_date: null,
              pod_time: null,
            },
            manifest: [
              {
                manifest_description: 'Diterima di Denpasar',
                manifest_date: '2024-10-08',
                manifest_time: '09:00:00',
              },
              {
                manifest_description: 'Dalam perjalanan ke Makassar',
                manifest_date: '2024-10-09',
                manifest_time: '14:00:00',
              },
            ],
          },
        },
      },
    };

    if (!mocks[payload.courier]) {
      throw new ResponseError(StatusCodes.BAD_REQUEST, 'Kurir tidak didukung');
    }

    if (payload.courier === 'jne') {
      if (!payload.last_phone_number) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Nomor telepon terakhir wajib diisi untuk JNE',
        );
      }
      const awbRecords = mocks.jne[payload.awb];
      if (!awbRecords) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Waybill tidak ditemukan',
        );
      }
      const response = awbRecords[payload.last_phone_number];
      if (!response) {
        throw new ResponseError(
          StatusCodes.BAD_REQUEST,
          'Nomor telepon tidak cocok',
        );
      }
      return response;
    } else {
      const awbRecords = mocks[payload.courier][payload.awb];
      if (!awbRecords) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Waybill tidak ditemukan',
        );
      }
      const response = awbRecords[''];
      if (!response) {
        throw new ResponseError(
          StatusCodes.NOT_FOUND,
          'Waybill tidak ditemukan',
        );
      }
      return response;
    }
  }
}
