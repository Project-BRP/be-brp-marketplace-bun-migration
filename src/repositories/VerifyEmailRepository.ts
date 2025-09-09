import { redisClient } from '../configs/redis';

export class VerifyEmailRepository {
  static async set(email: string, token: string, expiresIn: number) {
    return await redisClient.set(`verify-email:${email}`, token, {
      EX: expiresIn,
    });
  }

  static async get(email: string) {
    return await redisClient.get(`verify-email:${email}`);
  }

  static async delete(email: string) {
    return await redisClient.del(`verify-email:${email}`);
  }
}
