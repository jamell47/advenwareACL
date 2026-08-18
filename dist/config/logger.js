"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = void 0;
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("../config/env");
const format = env_1.env.nodeEnv === "production" ? "combined" : ":method :url :status :response-time ms - :remote-addr";
exports.morganMiddleware = (0, morgan_1.default)(format, {
    stream: {
        write: (message) => {
            const msg = message.trim();
            if (env_1.env.nodeEnv !== "test") {
                console.log(msg);
            }
        },
    },
});
//# sourceMappingURL=logger.js.map