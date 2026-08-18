"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptUtil = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const BCRYPT_ROUNDS = 12;
class BcryptUtil {
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(BCRYPT_ROUNDS);
        return bcryptjs_1.default.hash(password, salt);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
}
exports.BcryptUtil = BcryptUtil;
//# sourceMappingURL=bcrypt.util.js.map