"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new errorHandler_1.APIError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt_util_1.JwtUtil.verifyAccessToken(token);
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        return next(new errorHandler_1.APIError("Invalid or expired access token", 401, "INVALID_TOKEN"));
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.APIError("Authentication required", 401, "AUTH_REQUIRED"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errorHandler_1.APIError("Insufficient permissions", 403, "FORBIDDEN"));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map