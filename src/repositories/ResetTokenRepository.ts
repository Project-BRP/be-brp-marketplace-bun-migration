import { redisClient } from '../configs/redis';

export class ResetTokenRepository {
  static async set(userId: string, token: string, expiresIn: number) {
    return await redisClient.set(`reset-token:${userId}`, token, {
      EX: expiresIn,
    });
  }

  static async get(userId: string) {
    return await redisClient.get(`reset-token:${userId}`);
  }

  static async delete(userId: string) {
    return await redisClient.del(`reset-token:${userId}`);
  }
}
