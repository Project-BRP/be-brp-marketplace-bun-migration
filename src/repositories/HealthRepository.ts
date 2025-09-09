import { db } from '../configs/database';

export class HealthRepository {
  static async dbCheck() {
    return await db.$queryRaw`SELECT 1`;
  }
}
