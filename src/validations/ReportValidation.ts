import { z, ZodType } from 'zod';

const DateRangeFilterSchema = z
  .object({
    startMonth: z.coerce
      .number({
        invalid_type_error: 'Bulan awal tidak valid',
      })
      .min(1, 'Bulan awal tidak boleh kurang dari 1')
      .max(12, 'Bulan awal tidak boleh lebih dari 12')
      .optional(),
    startYear: z.coerce
      .number({
        invalid_type_error: 'Tahun awal tidak valid',
      })
      .min(2000, 'Tahun awal tidak boleh kurang dari 2000')
      .optional(),
    endMonth: z.coerce
      .number({
        invalid_type_error: 'Bulan akhir tidak valid',
      })
      .min(1, 'Bulan akhir tidak boleh kurang dari 1')
      .max(12, 'Bulan akhir tidak boleh lebih dari 12')
      .optional(),
    endYear: z.coerce
      .number({
        invalid_type_error: 'Tahun akhir tidak valid',
      })
      .min(2000, 'Tahun akhir tidak boleh kurang dari 2000')
      .optional(),
  })
  .refine(
    data => {
      const filledCount = Object.values(data).filter(
        v => v !== undefined,
      ).length;
      return filledCount === 0 || filledCount === 4;
    },
    {
      message:
        'Semua field (tahun bulan mulai dan akhir) harus diisi jika salah satu diisi',
      path: ['startMonth'],
    },
  );

export class ReportValidation {
  // Gunakan skema yang sama untuk semua validasi laporan
  static readonly GET_REVENUE: ZodType = DateRangeFilterSchema;
  static readonly GET_TOTAL_TRANSACTIONS: ZodType = DateRangeFilterSchema;
  static readonly GET_TOTAL_PRODUCTS_SOLD: ZodType = DateRangeFilterSchema;
  static readonly GET_TOTAL_ACTIVE_USERS: ZodType = DateRangeFilterSchema;
  static readonly GET_MONTHLY_REVENUE: ZodType = DateRangeFilterSchema;
  static readonly GET_MOST_SOLD_PRODUCTS_DISTRIBUTION: ZodType =
    DateRangeFilterSchema;
  static readonly EXPORT_DATA: ZodType = z
    .object({
      tables: z
        .array(
          z.enum([
            'users',
            'products',
            'product_variants',
            'product_types',
            'packagings',
            'transactions',
            'transaction_items',
          ] as const),
        )
        .optional(),
      startYear: z.coerce.number().optional(),
      startMonth: z.coerce.number().optional(),
      startDay: z.coerce.number().optional(),
      endYear: z.coerce.number().optional(),
      endMonth: z.coerce.number().optional(),
      endDay: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
      // Validate start triplet
      if (data.startYear !== undefined && data.startMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startMonth'],
          message: 'Start month wajib diisi jika start year diisi',
        });
      }
      if (data.startDay !== undefined) {
        if (data.startYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['startYear'],
            message: 'Start year wajib diisi jika start day diisi',
          });
        }
        if (data.startMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['startMonth'],
            message: 'Start month wajib diisi jika start day diisi',
          });
        }
      }
      // Validate end triplet
      if (data.endYear !== undefined && data.endMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endMonth'],
          message: 'End month wajib diisi jika end year diisi',
        });
      }
      if (data.endDay !== undefined) {
        if (data.endYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endYear'],
            message: 'End year wajib diisi jika end day diisi',
          });
        }
        if (data.endMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['endMonth'],
            message: 'End month wajib diisi jika end day diisi',
          });
        }
      }
    });
}
