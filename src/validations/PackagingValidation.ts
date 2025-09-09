import { z, ZodType } from 'zod';

export class PackagingValidation {
  static readonly CREATE: ZodType = z.object({
    name: z
      .string({
        required_error: 'Nama kemasan tidak boleh kosong',
        invalid_type_error: 'Nama kemasan tidak valid',
      })
      .min(1, 'Nama kemasan tidak boleh kosong')
      .max(255, 'Nama kemasan terlalu panjang'),
  });

  static readonly GET_BY_ID: ZodType = z.object({
    id: z
      .string({
        required_error: 'ID Kemasan tidak boleh kosong',
        invalid_type_error: 'ID Kemasan tidak valid',
      })
      .min(1, 'ID Kemasan tidak boleh kosong'),
  });

  static readonly GET_ALL: ZodType = z.object({
    search: z
      .string({
        invalid_type_error: 'Pencarian tidak valid',
      })
      .nullish()
      .optional(),
    page: z
      .number({
        invalid_type_error: 'Jumlah halaman tidak valid',
      })
      .nullish()
      .optional(),
    limit: z
      .number({
        invalid_type_error: 'Jumlah limit tidak valid',
      })
      .nullish()
      .optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z
      .string({
        required_error: 'ID Kemasan tidak boleh kosong',
        invalid_type_error: 'ID Kemasan tidak valid',
      })
      .min(1, 'ID Kemasan tidak boleh kosong'),
    name: z
      .string({
        required_error: 'Nama kemasan tidak boleh kosong',
        invalid_type_error: 'Nama kemasan tidak valid',
      })
      .min(1, 'Nama kemasan tidak boleh kosong')
      .max(255, 'Nama kemasan terlalu panjang'),
  });

  static readonly DELETE: ZodType = z.object({
    id: z
      .string({
        required_error: 'ID Kemasan tidak boleh kosong',
        invalid_type_error: 'ID Kemasan tidak valid',
      })
      .min(1, 'ID Kemasan tidak boleh kosong'),
  });
}
