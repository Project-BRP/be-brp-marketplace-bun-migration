import { z, ZodType } from 'zod';

export class ShippingValidation {
  static readonly GET_CITIES: ZodType = z.object({
    provinceId: z
      .number({
        required_error: 'ID Provinsi tidak boleh kosong',
        invalid_type_error: 'ID Provinsi tidak valid',
      })
      .min(1, 'ID Provinsi tidak boleh kurang dari 1'),
  });

  static readonly GET_DISTRICTS: ZodType = z.object({
    provinceId: z
      .number({
        required_error: 'ID Provinsi tidak boleh kosong',
        invalid_type_error: 'ID Provinsi tidak valid',
      })
      .min(1, 'ID Provinsi tidak boleh kurang dari 1'),
    cityId: z
      .number({
        required_error: 'ID Kota tidak boleh kosong',
        invalid_type_error: 'ID Kota tidak valid',
      })
      .min(1, 'ID Kota tidak boleh kurang dari 1'),
  });

  static readonly GET_SUB_DISTRICTS: ZodType = z.object({
    provinceId: z
      .number({
        required_error: 'ID Provinsi tidak boleh kosong',
        invalid_type_error: 'ID Provinsi tidak valid',
      })
      .min(1, 'ID Provinsi tidak boleh kurang dari 1'),
    cityId: z
      .number({
        required_error: 'ID Kota tidak boleh kosong',
        invalid_type_error: 'ID Kota tidak valid',
      })
      .min(1, 'ID Kota tidak boleh kurang dari 1'),
    districtId: z
      .number({
        required_error: 'ID Kecamatan tidak boleh kosong',
        invalid_type_error: 'ID Kecamatan tidak valid',
      })
      .min(1, 'ID Kecamatan tidak boleh kurang dari 1'),
  });

  static readonly CHECK_COST: ZodType = z.object({
    destinationProvince: z
      .number({
        required_error: 'ID Provinsi Tujuan tidak boleh kosong',
        invalid_type_error: 'ID Provinsi Tujuan tidak valid',
      })
      .min(1, 'ID Provinsi Tujuan tidak boleh kurang dari 1'),
    destinationCity: z
      .number({
        required_error: 'ID Kota Tujuan tidak boleh kosong',
        invalid_type_error: 'ID Kota Tujuan tidak valid',
      })
      .min(1, 'ID Kota Tujuan tidak boleh kurang dari 1'),
    destinationDistrict: z
      .number({
        required_error: 'Destination tidak boleh kosong',
        invalid_type_error: 'Destination tidak valid',
      })
      .min(1, 'Destination tidak boleh kosong'),
    destinationSubDistrict: z
      .number({
        required_error: 'ID Sub-District Tujuan tidak boleh kosong',
        invalid_type_error: 'ID Sub-District Tujuan tidak valid',
      })
      .min(1, 'ID Sub-District Tujuan tidak boleh kurang dari 1'),
    weight_in_kg: z
      .number({
        required_error: 'Weight tidak boleh kosong',
        invalid_type_error: 'Weight tidak valid',
      })
      .min(1, 'Weight tidak boleh kurang dari 1'),
  });

  static readonly TRACK_WAYBILL: ZodType = z.object({
    transactionId: z
      .string({
        required_error: 'ID Transaksi tidak boleh kosong',
        invalid_type_error: 'ID Transaksi tidak valid',
      })
      .min(1, 'ID Transaksi tidak boleh kosong'),
    userId: z
      .string({
        required_error: 'ID User tidak boleh kosong',
        invalid_type_error: 'ID User tidak valid',
      })
      .min(1, 'ID User tidak boleh kosong'),
    userRole: z
      .string({
        required_error: 'Role User tidak boleh kosong',
        invalid_type_error: 'Role User tidak valid',
      })
      .min(1, 'Role User tidak boleh kosong'),
  });
}
