import { stringify } from 'csv-stringify/sync';
import { DateTime } from 'luxon';

export class CsvUtils {
  // Convert array of objects to CSV string with headers inferred from keys
  static toCsv<T extends Record<string, any>>(rows: T[]): string {
    if (!rows || rows.length === 0) return '';

    // Normalize values: convert Date to ISO, objects/arrays to JSON string
    const normalized = rows.map(row => {
      const obj: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value instanceof Date) {
          // Special-case createdAt/updatedAt for Excel-friendly format: dd/MM/yyyy
          if (key === 'createdAt' || key === 'updatedAt') {
            obj[key] = DateTime.fromJSDate(value)
              .setZone('Asia/Jakarta')
              .toFormat('dd/LL/yyyy');
          } else {
            obj[key] = value.toISOString();
          }
        } else if (typeof value === 'object' && value !== null) {
          obj[key] = JSON.stringify(value);
        } else {
          obj[key] = value as any;
        }
      }
      return obj;
    });

    const header = Object.keys(normalized[0]);
    return stringify(normalized, { header: true, columns: header });
  }
}
