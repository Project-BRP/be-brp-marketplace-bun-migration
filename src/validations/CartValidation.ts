import { z, ZodType } from 'zod';

export class CartValidation {
  static readonly GET_CART: ZodType = z.object({
    userId: z
      .string({
        required_error: 'ID Pengguna tidak boleh kosong',
        invalid_type_error: 'ID Pengguna tidak valid',
      })
      .min(1, 'ID Pengguna tidak boleh kosong'),
  });

  static readonly CLEAR_CART: ZodType = z.object({
    userId: z
      .string({
        required_error: 'ID Pengguna tidak boleh kosong',
        invalid_type_error: 'ID Pengguna tidak valid',
      })
      .min(1, 'ID Pengguna tidak boleh kosong'),
  });
}
