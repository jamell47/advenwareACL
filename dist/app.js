"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./config/logger");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = env_1.env.corsOrigin
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        console.log("CORS Origin:", origin);
        console.log("Allowed Origins:", allowedOrigins);
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.error(`Blocked CORS origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use(logger_1.morganMiddleware);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimitWindowMs,
    max: env_1.env.rateLimitMax,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
        error: { code: "RATE_LIMIT_EXCEEDED" },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ADVENWARE CAREER LINK (ACL) API",
        version: "1.0.0",
        docs: "/api/docs",
        status: "running",
    });
});
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/v1", routes_1.default);
(0, swagger_1.setupSwagger)(app);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map