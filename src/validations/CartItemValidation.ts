import { z, ZodType } from 'zod';

export class CartItemValidation {
  static readonly ADD_TO_CART: ZodType = z.object({
    userId: z
      .string({
        required_error: 'ID Pengguna tidak boleh kosong',
        invalid_type_error: 'ID Pengguna tidak valid',
      })
      .min(1, 'ID Pengguna tidak boleh kosong'),
    variantId: z
      .string({
        required_error: 'ID Varian produk tidak boleh kosong',
        invalid_type_error: 'ID Varian produk tidak valid',
      })
      .min(1, 'ID Varian produk tidak boleh kosong'),
    quantity: z
      .number({
        required_error: 'Kuantitas tidak boleh kosong',
        invalid_type_error: 'Kuantitas tidak valid',
      })
      .int('Kuantitas harus bilangan bulat'),
  });

  static readonly UPDATE_CART_ITEM: ZodType = z.object({
    userId: z
      .string({
        required_error: 'ID Pengguna tidak boleh kosong',
        invalid_type_error: 'ID Pengguna tidak valid',
      })
      .min(1, 'ID Pengguna tidak boleh kosong'),
    cartItemId: z
      .string({
        required_error: 'ID Item keranjang tidak boleh kosong',
        invalid_type_error: 'ID Item keranjang tidak valid',
      })
      .min(1, 'ID Item keranjang tidak boleh kosong'),
    quantity: z
      .number({
        required_error: 'Kuantitas tidak boleh kosong',
        invalid_type_error: 'Kuantitas tidak valid',
      })
      .int('Kuantitas harus bilangan bulat'),
  });

  static readonly REMOVE_CART_ITEM: ZodType = z.object({
    userId: z
      .string({
        required_error: 'ID Pengguna tidak boleh kosong',
        invalid_type_error: 'ID Pengguna tidak valid',
      })
      .min(1, 'ID Pengguna tidak boleh kosong'),
    cartItemId: z
      .string({
        required_error: 'ID Item keranjang tidak boleh kosong',
        invalid_type_error: 'ID Item keranjang tidak valid',
      })
      .min(1, 'ID Item keranjang tidak boleh kosong'),
  });
}
