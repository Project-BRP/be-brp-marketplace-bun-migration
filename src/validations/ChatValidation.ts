import { z, ZodType } from 'zod';

export class ChatValidation {
  static readonly CREATE_MESSAGE: ZodType = z.object({
    userId: z
      .string({ invalid_type_error: 'User ID tidak valid' })
      .min(1, 'User ID tidak boleh kosong')
      .optional(),
    content: z
      .string({ invalid_type_error: 'Konten tidak valid' })
      .min(1, 'Konten tidak boleh kosong')
      .optional(),
  });

  static readonly GET_ALL_ROOMS: ZodType = z.object({
    search: z.string().nullable().optional(),
    page: z
      .number({ invalid_type_error: 'Halaman tidak valid' })
      .int('Halaman tidak valid')
      .positive('Halaman tidak valid')
      .nullable()
      .optional(),
    limit: z
      .number({ invalid_type_error: 'Batas tidak valid' })
      .int('Batas tidak valid')
      .positive('Batas tidak valid')
      .nullable()
      .optional(),
  });

  static readonly GET_ROOM_DETAIL: ZodType = z.object({
    roomId: z
      .string({ invalid_type_error: 'Room ID tidak valid' })
      .min(1, 'Room ID tidak boleh kosong'),
  });

  static readonly GET_ROOM_DETAIL_BY_USER: ZodType = z.object({
    userId: z
      .string({ invalid_type_error: 'User ID tidak valid' })
      .min(1, 'User ID tidak boleh kosong'),
  });

  static readonly DELETE_ROOM: ZodType = z.object({
    roomId: z
      .string({ invalid_type_error: 'Room ID tidak valid' })
      .min(1, 'Room ID tidak boleh kosong'),
  });
}
