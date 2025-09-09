import bcrypt from 'bcrypt';

export class PasswordUtils {
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
