import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { TokenPayload } from "../interfaces/auth.interface";

export class JwtUtil {
  static generateAccessToken(payload: { userId: string; email: string; role: string }): string {
    const fullPayload: TokenPayload = {
      ...payload,
      type: "access",
    };
    return jwt.sign(fullPayload, env.jwtSecret, {
      expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  static generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
    const fullPayload: TokenPayload = {
      ...payload,
      type: "refresh",
    };
    return jwt.sign(fullPayload, env.jwtRefreshSecret, {
      expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
  }
}
