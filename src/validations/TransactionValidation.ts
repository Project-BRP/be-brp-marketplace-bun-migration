import { z, ZodType } from 'zod';

export class TransactionValidation {
  static readonly CREATE: ZodType = z.object({
    userId: z
      .string({
        required_error: 'User ID tidak boleh kosong',
        invalid_type_error: 'User ID tidak valid',
      })
      .min(1, 'User ID tidak boleh kosong'),
    shippingAddress: z
      .string({
        required_error: 'Alamat pengiriman tidak boleh kosong',
        invalid_type_error: 'Alamat pengiriman tidak valid',
      })
      .min(1, 'Alamat pengiriman tidak boleh kosong'),
    district: z
      .number({
        required_error: 'District tidak boleh kosong',
        invalid_type_error: 'District tidak valid',
      })
      .min(1, 'District tidak boleh kosong'),
    subDistrict: z
      .number({
        required_error: 'Sub-District tidak boleh kosong',
        invalid_type_error: 'Sub-District tidak valid',
      })
      .min(1, 'Sub-District tidak boleh kosong'),
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
    shippingCode: z
      .string({
        invalid_type_error: 'Shipping code tidak valid',
      })
      .min(1, 'Shipping code tidak boleh kosong')
      .optional(),
    shippingService: z
      .string({
        invalid_type_error: 'Shipping service tidak valid',
      })
      .min(1, 'Shipping service tidak boleh kosong')
      .optional(),
    postalCode: z
      .string({
        required_error: 'Postal code tidak boleh kosong',
        invalid_type_error: 'Postal code tidak valid',
      })
      .min(1, 'Postal code tidak boleh kosong'),
    method: z.enum(['DELIVERY', 'MANUAL'], {
      required_error: 'Metode transaksi tidak boleh kosong',
      invalid_type_error: 'Metode transaksi tidak valid',
    }),
  });

  static readonly REQUEST_PAYMENT: ZodType = z.object({
    transactionId: z.string({
      required_error: 'Transaction ID tidak boleh kosong',
      invalid_type_error: 'Transaction ID tidak valid',
    }),
    userId: z.string({
      required_error: 'User ID tidak boleh kosong',
      invalid_type_error: 'User ID tidak valid',
    }),
  });

  static readonly NOTIF: ZodType = z.object({
    transactionId: z.string(),
    signatureKey: z.string(),
    transactionStatus: z.string(),
    fraudStatus: z.string(),
    statusCode: z.string(),
    grossAmount: z.string(),
    paymentType: z.string(),
  });

  static readonly GET_BY_ID: ZodType = z.object({
    userRole: z
      .string({
        required_error: 'User role tidak boleh kosong',
        invalid_type_error: 'User role tidak valid',
      })
      .min(1, 'User role tidak boleh kosong'),
    userId: z
      .string({
        required_error: 'User ID tidak boleh kosong',
        invalid_type_error: 'User ID tidak valid',
      })
      .min(1, 'User ID tidak boleh kosong'),
    id: z
      .string({
        required_error: 'ID tidak boleh kosong',
        invalid_type_error: 'ID tidak valid',
      })
      .min(1, 'ID tidak boleh kosong'),
  });

  static readonly GET_ALL: ZodType = z
    .object({
      method: z
        .enum(['DELIVERY', 'MANUAL'], {
          required_error: 'Metode transaksi tidak boleh kosong',
          invalid_type_error: 'Metode transaksi tidak valid',
        })
        .nullish()
        .optional(),
      search: z
        .string({
          invalid_type_error: 'Pencarian tidak valid',
        })
        .nullish()
        .optional(),
      status: z
        .string({
          invalid_type_error: 'Status tidak valid',
        })
        .nullish()
        .optional(),
      startYear: z.coerce
        .number({
          invalid_type_error: 'Start year tidak valid',
        })
        .nullish()
        .optional(),
      startMonth: z.coerce
        .number({
          invalid_type_error: 'Start month tidak valid',
        })
        .nullish()
        .optional(),
      startDay: z.coerce
        .number({
          invalid_type_error: 'Start day tidak valid',
        })
        .nullish()
        .optional(),
      endYear: z.coerce
        .number({
          invalid_type_error: 'End year tidak valid',
        })
        .nullish()
        .optional(),
      endMonth: z.coerce
        .number({
          invalid_type_error: 'End month tidak valid',
        })
        .nullish()
        .optional(),
      endDay: z.coerce
        .number({
          invalid_type_error: 'End day tidak valid',
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
      isStockIssue: z
        .boolean({ invalid_type_error: 'isStockIssue tidak valid' })
        .nullish()
        .optional(),
    })
    .superRefine((data, ctx) => {
      // start date validation
      if (data.startYear !== undefined && data.startMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start month wajib diisi jika start year diisi',
          path: ['startMonth'],
        });
      }
      if (data.startDay !== undefined) {
        if (data.startYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start year wajib diisi jika start day diisi',
            path: ['startYear'],
          });
        }
        if (data.startMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start month wajib diisi jika start day diisi',
            path: ['startMonth'],
          });
        }
      }
      // end date validation
      if (data.endYear !== undefined && data.endMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End month wajib diisi jika end year diisi',
          path: ['endMonth'],
        });
      }
      if (data.endDay !== undefined) {
        if (data.endYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End year wajib diisi jika end day diisi',
            path: ['endYear'],
          });
        }
        if (data.endMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End month wajib diisi jika end day diisi',
            path: ['endMonth'],
          });
        }
      }
    });

  static readonly GET_ALL_BY_USER: ZodType = z
    .object({
      userId: z
        .string({
          required_error: 'User ID tidak boleh kosong',
          invalid_type_error: 'User ID tidak valid',
        })
        .min(1, 'User ID tidak boleh kosong'),
      currentUserId: z
        .string({
          required_error: 'Current User ID tidak boleh kosong',
          invalid_type_error: 'Current User ID tidak valid',
        })
        .min(1, 'Current User ID tidak boleh kosong'),
      currentUserRole: z
        .string({
          required_error: 'Current User Role tidak boleh kosong',
          invalid_type_error: 'Current User Role tidak valid',
        })
        .min(1, 'Current User Role tidak boleh kosong'),
      method: z
        .enum(['DELIVERY', 'MANUAL'], {
          required_error: 'Metode transaksi tidak boleh kosong',
          invalid_type_error: 'Metode transaksi tidak valid',
        })
        .nullish()
        .optional(),
      search: z
        .string({
          invalid_type_error: 'Pencarian tidak valid',
        })
        .nullish()
        .optional(),
      status: z
        .string({
          invalid_type_error: 'Status tidak valid',
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
      startYear: z.coerce
        .number({
          invalid_type_error: 'Start year tidak valid',
        })
        .nullish()
        .optional(),
      startMonth: z.coerce
        .number({
          invalid_type_error: 'Start month tidak valid',
        })
        .nullish()
        .optional(),
      startDay: z.coerce
        .number({
          invalid_type_error: 'Start day tidak valid',
        })
        .nullish()
        .optional(),
      endYear: z.coerce
        .number({
          invalid_type_error: 'End year tidak valid',
        })
        .nullish()
        .optional(),
      endMonth: z.coerce
        .number({
          invalid_type_error: 'End month tidak valid',
        })
        .nullish()
        .optional(),
      endDay: z.coerce
        .number({
          invalid_type_error: 'End day tidak valid',
        })
        .nullish()
        .optional(),
      isStockIssue: z
        .boolean({ invalid_type_error: 'isStockIssue tidak valid' })
        .nullish()
        .optional(),
    })
    .superRefine((data, ctx) => {
      // start date validation
      if (data.startYear !== undefined && data.startMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start month wajib diisi jika start year diisi',
          path: ['startMonth'],
        });
      }
      if (data.startDay !== undefined) {
        if (data.startYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start year wajib diisi jika start day diisi',
            path: ['startYear'],
          });
        }
        if (data.startMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Start month wajib diisi jika start day diisi',
            path: ['startMonth'],
          });
        }
      }
      // end date validation
      if (data.endYear !== undefined && data.endMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End month wajib diisi jika end year diisi',
          path: ['endMonth'],
        });
      }
      if (data.endDay !== undefined) {
        if (data.endYear === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End year wajib diisi jika end day diisi',
            path: ['endYear'],
          });
        }
        if (data.endMonth === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End month wajib diisi jika end day diisi',
            path: ['endMonth'],
          });
        }
      }
    });

  static readonly UPDATE: ZodType = z.object({
    id: z
      .string({
        required_error: 'ID transaksi tidak boleh kosong',
        invalid_type_error: 'ID transaksi tidak valid',
      })
      .min(1, 'ID transaksi tidak boleh kosong'),
    deliveryStatus: z.string().optional(),
    manualStatus: z.string().optional(),
    shippingReceipt: z
      .string({
        invalid_type_error: 'Shipping receipt tidak valid',
      })
      .min(1, 'Shipping receipt tidak boleh kosong')
      .optional(),
  });

  static readonly UPDATE_SHIPPING_RECEIPT: ZodType = z.object({
    transactionId: z
      .string({
        required_error: 'Transaction ID tidak boleh kosong',
        invalid_type_error: 'Transaction ID tidak valid',
      })
      .min(1, 'Transaction ID tidak boleh kosong'),
    shippingReceipt: z
      .string({
        required_error: 'Shipping receipt tidak boleh kosong',
        invalid_type_error: 'Shipping receipt tidak valid',
      })
      .min(1, 'Shipping receipt tidak boleh kosong'),
  });

  static readonly ADD_MANUAL_SHIPPING_COST: ZodType = z.object({
    transactionId: z
      .string({
        required_error: 'Transaction ID tidak boleh kosong',
        invalid_type_error: 'Transaction ID tidak valid',
      })
      .min(1, 'Transaction ID tidak boleh kosong'),
    manualShippingCost: z
      .number({
        required_error: 'Manual shipping cost tidak boleh kosong',
        invalid_type_error: 'Manual shipping cost tidak valid',
      })
      .min(0, 'Manual shipping cost tidak boleh kurang dari 0'),
  });

  static readonly CANCEL: ZodType = z.object({
    id: z
      .string({
        required_error: 'ID transaksi tidak boleh kosong',
        invalid_type_error: 'ID transaksi tidak valid',
      })
      .min(1, 'ID transaksi tidak boleh kosong'),
    userId: z
      .string({
        required_error: 'User ID tidak boleh kosong',
        invalid_type_error: 'User ID tidak valid',
      })
      .min(1, 'User ID tidak boleh kosong'),
    userRole: z
      .string({
        required_error: 'User role tidak boleh kosong',
        invalid_type_error: 'User role tidak valid',
      })
      .min(1, 'User role tidak boleh kosong'),
    cancelReason: z
      .string({
        required_error: 'Alasan pembatalan tidak boleh kosong',
        invalid_type_error: 'Alasan pembatalan tidak valid',
      })
      .min(1, 'Alasan pembatalan tidak boleh kosong'),
  });

  static readonly RESOLVE_STOCK_ISSUE_ITEM: ZodType = z.object({
    transactionItemId: z
      .string({
        required_error: 'ID item transaksi tidak boleh kosong',
        invalid_type_error: 'ID item transaksi tidak valid',
      })
      .min(1, 'ID item transaksi tidak boleh kosong'),
    stock: z
      .number({
        required_error: 'Jumlah stok yang ditambahkan tidak boleh kosong',
        invalid_type_error: 'Jumlah stok yang ditambahkan tidak valid',
      })
      .min(1, 'Jumlah stok yang ditambahkan minimal 1'),
  });
}
