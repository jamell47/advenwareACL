import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export class BcryptUtil {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
