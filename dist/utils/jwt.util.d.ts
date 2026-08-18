import { TokenPayload } from "../interfaces/auth.interface";
export declare class JwtUtil {
    static generateAccessToken(payload: {
        userId: string;
        email: string;
        role: string;
    }): string;
    static generateRefreshToken(payload: {
        userId: string;
        email: string;
        role: string;
    }): string;
    static verifyAccessToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): TokenPayload;
}
//# sourceMappingURL=jwt.util.d.ts.map