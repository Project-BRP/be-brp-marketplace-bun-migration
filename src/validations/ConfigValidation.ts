import { z, ZodType } from 'zod';

export class ConfigValidation {
  static UPLOAD_LOGO: ZodType = z.object({
    file: z.instanceof(File, {
      message: 'Logo harus berupa file',
    }),
  });
}
