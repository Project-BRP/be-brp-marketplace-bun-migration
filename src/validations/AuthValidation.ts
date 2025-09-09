// eslint-disable-next-line
import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z
      .string({
        required_error: 'Nama tidak boleh kosong',
        invalid_type_error: 'Nama tidak valid',
      })
      .max(255, 'Nama tidak boleh lebih dari 255 karakter'),

    email: z
      .string({
        required_error: 'Email tidak boleh kosong',
        invalid_type_error: 'Email tidak valid',
      })
      .email('Email tidak valid'),

    password: z
      .string({
        required_error: 'Kata sandi tidak boleh kosong',
        invalid_type_error: 'Kata sandi tidak valid',
      })
      .max(255, 'Kata sandi tidak boleh lebih dari 255 karakter')
      .min(8, 'Kata sandi harus minimal 8 karakter')
      .regex(/\d/, 'Kata sandi harus mengandung setidaknya 1 angka'),

    phoneNumber: z
      .string({
        required_error: 'Nomor telepon tidak boleh kosong',
        invalid_type_error: 'Format nomor telepon tidak valid',
      })
      .min(10, 'Nomor telepon harus minimal 10 digit')
      .max(15, 'Nomor telepon tidak boleh lebih dari 15 digit')
      .regex(
        /^(?:\+62|0)[2-9]{1}[0-9]{7,13}$/,
        'Nomor telepon harus dimulai dengan +62 atau 0 dan hanya berupa angka',
      ),
  });

  static readonly VERIFY_EMAIL: ZodType = z.object({
    token: z.string({
      required_error: 'Unauthorized!',
      invalid_type_error: 'Unauthorized!',
    }),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z
      .string({
        required_error: 'Email tidak boleh kosong',
        invalid_type_error: 'Email tidak valid',
      })
      .email('Email tidak valid'),

    password: z
      .string({
        required_error: 'Password tidak boleh kosong',
        invalid_type_error: 'Password tidak valid',
      })
      .max(255, 'Password tidak boleh lebih dari 255 karakter'),
  });

  static readonly GET_ALL_USER: ZodType = z.object({
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
    isActive: z
      .boolean({
        invalid_type_error: 'Parameter isActive tidak valid',
      })
      .nullish()
      .optional(),
  });

  static readonly UPDATE: ZodType = z
    .object({
      name: z
        .string({
          invalid_type_error: 'Name tidak valid',
        })
        .max(255, 'Name tidak boleh lebih dari 255 karakter')
        .optional(),

      photoProfile: z
        .string({
          invalid_type_error: 'Photo profile tidak valid',
        })
        .optional(),

      phoneNumber: z
        .string({
          required_error: 'Nomor telepon tidak boleh kosong',
          invalid_type_error: 'Format nomor telepon tidak valid',
        })
        .min(10, 'Nomor telepon harus minimal 10 digit')
        .max(15, 'Nomor telepon tidak boleh lebih dari 15 digit')
        .regex(
          /^(?:\+62|0)[2-9]{1}[0-9]{7,13}$/,
          'Nomor telepon harus dimulai dengan +62 atau 0 dan hanya berupa angka',
        )
        .optional(),

      password: z
        .string({
          invalid_type_error: 'Password tidak valid',
        })
        .max(255, 'Password tidak boleh lebih dari 255 karakter')
        .optional(),

      oldPassword: z
        .string({
          invalid_type_error: 'Old password tidak valid',
        })
        .max(255, 'Old password tidak boleh lebih dari 255 karakter')
        .optional(),
    })

    .refine(
      data => {
        const keys = Object.keys(data).filter(
          key => data[key as keyof typeof data] !== undefined && key !== 'id',
        );
        return keys.length > 0;
      },
      {
        message: 'Setidaknya satu field harus diisi untuk update',
        path: [],
      },
    )

    .refine(data => !data.password || data.oldPassword, {
      message: 'Password lama wajib diisi jika password diubah',
      path: ['oldPassword'],
    });

  static readonly FORGOT_PASSWORD: ZodType = z.object({
    email: z
      .string({
        required_error: 'Email tidak boleh kosong',
        invalid_type_error: 'Email tidak valid',
      })
      .email('Email tidak valid'),
  });

  static readonly CHECK_RESET_TOKEN: ZodType = z.object({
    token: z.string({
      required_error: 'Unauthorized!',
      invalid_type_error: 'Unauthorized!',
    }),
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    token: z.string({
      required_error: 'Unauthorized!',
      invalid_type_error: 'Unauthorized!',
    }),

    password: z
      .string({
        required_error: 'Password tidak boleh kosong',
        invalid_type_error: 'Password tidak valid',
      })
      .max(255, 'Password tidak boleh lebih dari 255 karakter')
      .min(8, 'Password harus minimal 8 karakter')
      .regex(/\d/, 'Password harus mengandung setidaknya 1 angka'),

    confirmPassword: z
      .string({
        required_error: 'Konfirmasi password tidak boleh kosong',
        invalid_type_error: 'Konfirmasi password tidak valid',
      })
      .max(255, 'Konfirmasi password tidak boleh lebih dari 255 karakter'),
  });
}
