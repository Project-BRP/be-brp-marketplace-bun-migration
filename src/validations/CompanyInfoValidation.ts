import { z, ZodType } from 'zod';

export class CompanyInfoValidation {
  static readonly CREATE_COMPANY_INFO: ZodType = z.object({
    companyName: z
      .string({
        required_error: 'Nama Perusahaan tidak boleh kosong',
        invalid_type_error: 'Nama Perusahaan tidak valid',
      })
      .min(1, 'Nama Perusahaan tidak boleh kosong'),
    email: z
      .string({
        required_error: 'Email tidak boleh kosong',
        invalid_type_error: 'Email tidak valid',
      })
      .email('Format email tidak valid'),
    phoneNumber: z
      .string({
        required_error: 'Nomor telepon tidak boleh kosong',
        invalid_type_error: 'Nomor telepon tidak valid',
      })
      .min(1, 'Nomor telepon tidak boleh kosong'),
    province: z
      .number({
        required_error: 'Provinsi tidak boleh kosong',
        invalid_type_error: 'Provinsi tidak valid',
      })
      .min(1, 'Provinsi tidak boleh kosong'),
    city: z
      .number({
        required_error: 'Kota tidak boleh kosong',
        invalid_type_error: 'Kota tidak valid',
      })
      .min(1, 'Kota tidak boleh kosong'),
    district: z
      .number({
        required_error: 'Kecamatan tidak boleh kosong',
        invalid_type_error: 'Kecamatan tidak valid',
      })
      .min(1, 'Kecamatan tidak boleh kosong'),
    subDistrict: z
      .number({
        required_error: 'Kelurahan/Desa tidak boleh kosong',
        invalid_type_error: 'Kelurahan/Desa tidak valid',
      })
      .min(1, 'Kelurahan/Desa tidak boleh kosong'),
    fullAddress: z
      .string({
        required_error: 'Alamat lengkap tidak boleh kosong',
        invalid_type_error: 'Alamat lengkap tidak valid',
      })
      .min(1, 'Alamat lengkap tidak boleh kosong'),
    npwp: z
      .string({
        required_error: 'NPWP tidak boleh kosong',
        invalid_type_error: 'NPWP tidak valid',
      })
      .min(1, 'NPWP tidak boleh kosong'),
  });

  static readonly UPDATE_COMPANY_INFO: ZodType = z
    .object({
      companyName: z
        .string({
          invalid_type_error: 'Nama Perusahaan tidak valid',
        })
        .min(1, 'Nama Perusahaan tidak boleh kosong')
        .optional(),
      email: z
        .string({
          invalid_type_error: 'Email tidak valid',
        })
        .email('Format email tidak valid')
        .optional(),
      phoneNumber: z
        .string({
          invalid_type_error: 'Nomor telepon tidak valid',
        })
        .min(1, 'Nomor telepon tidak boleh kosong')
        .optional(),
      province: z
        .number({
          invalid_type_error: 'Provinsi tidak valid',
        })
        .min(1, 'Provinsi tidak boleh kosong')
        .optional(),
      city: z
        .number({
          invalid_type_error: 'Kota tidak valid',
        })
        .min(1, 'Kota tidak boleh kosong')
        .optional(),
      district: z
        .number({
          invalid_type_error: 'Kecamatan tidak valid',
        })
        .min(1, 'Kecamatan tidak boleh kosong')
        .optional(),
      subDistrict: z
        .number({
          invalid_type_error: 'Kelurahan/Desa tidak valid',
        })
        .min(1, 'Kelurahan/Desa tidak boleh kosong')
        .optional(),
      fullAddress: z
        .string({
          invalid_type_error: 'Alamat lengkap tidak valid',
        })
        .min(1, 'Alamat lengkap tidak boleh kosong')
        .optional(),
      npwp: z
        .string({
          invalid_type_error: 'NPWP tidak valid',
        })
        .min(1, 'NPWP tidak boleh kosong')
        .optional(),
    })
    .refine(
      data =>
        !!data.companyName ||
        !!data.email ||
        !!data.phoneNumber ||
        !!data.province ||
        !!data.city ||
        !!data.district ||
        !!data.subDistrict ||
        !!data.fullAddress ||
        !!data.npwp,
      {
        message: 'Minimal satu data harus diisi',
        path: [],
      },
    );
}
