import { DateTime } from 'luxon';

export class TimeUtils {
  static now(): Date {
    return DateTime.now().setZone('Asia/Jakarta').toJSDate();
  }

  /**
   * Mengembalikan tanggal awal suatu bulan (tanggal 1, jam 00:00:00).
   * @param year Tahun
   * @param month Bulan (1-12)
   * @returns Objek Date pada awal bulan.
   */
  static getStartOfMonth(year: number, month: number): Date {
    return DateTime.fromObject(
      { year, month, day: 1 },
      { zone: 'Asia/Jakarta' },
    )
      .startOf('day')
      .toJSDate();
  }

  /**
   * Mengembalikan tanggal akhir suatu bulan (misal: 31, jam 23:59:59).
   * @param year Tahun
   * @param month Bulan (1-12)
   * @returns Objek Date pada akhir bulan.
   */
  static getEndOfMonth(year: number, month: number): Date {
    return DateTime.fromObject(
      { year, month, day: 1 },
      { zone: 'Asia/Jakarta' },
    )
      .endOf('month')
      .toJSDate();
  }

  static getStartOfDay(year: number, month: number, day: number): Date {
    return DateTime.fromObject({ year, month, day }, { zone: 'Asia/Jakarta' })
      .startOf('day')
      .toJSDate();
  }

  static getEndOfDay(year: number, month: number, day: number): Date {
    return DateTime.fromObject({ year, month, day }, { zone: 'Asia/Jakarta' })
      .endOf('day')
      .toJSDate();
  }
}
