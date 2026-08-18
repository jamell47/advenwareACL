"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class JwtUtil {
    static generateAccessToken(payload) {
        const fullPayload = {
            ...payload,
            type: "access",
        };
        return jsonwebtoken_1.default.sign(fullPayload, env_1.env.jwtSecret, {
            expiresIn: env_1.env.jwtAccessExpiresIn,
        });
    }
    static generateRefreshToken(payload) {
        const fullPayload = {
            ...payload,
            type: "refresh",
        };
        return jsonwebtoken_1.default.sign(fullPayload, env_1.env.jwtRefreshSecret, {
            expiresIn: env_1.env.jwtRefreshExpiresIn,
        });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
    }
}
exports.JwtUtil = JwtUtil;
//# sourceMappingURL=jwt.util.js.map