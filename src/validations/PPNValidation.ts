import { z, ZodType } from 'zod';

export class PPNValidation {
  static readonly UPDATE: ZodType = z.object({
    percentage: z
      .number({
        required_error: 'Persentase PPN tidak boleh kosong',
        invalid_type_error: 'Persentase PPN harus berupa angka',
      })
      .min(0, 'Persentase PPN tidak boleh kurang dari 0')
      .max(100, 'Persentase PPN tidak boleh lebih dari 100'),
  });
}
