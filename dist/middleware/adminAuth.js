"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = exports.requireSuperAdmin = exports.requireAdmin = exports.requirePermission = void 0;
const errorHandler_1 = require("./errorHandler");
const permissions_1 = require("../utils/permissions");
Object.defineProperty(exports, "PERMISSIONS", { enumerable: true, get: function () { return permissions_1.PERMISSIONS; } });
const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.APIError("Authentication required", 401, "AUTH_REQUIRED"));
        }
        if (!req.user.role) {
            return next(new errorHandler_1.APIError("Role not found", 403, "ROLE_NOT_FOUND"));
        }
        for (const permission of requiredPermissions) {
            if (!(0, permissions_1.hasPermission)(req.user.role, permission)) {
                return next(new errorHandler_1.APIError("Insufficient permissions", 403, "FORBIDDEN"));
            }
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAdmin = (...allowedRoles) => {
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
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new errorHandler_1.APIError("Authentication required", 401, "AUTH_REQUIRED"));
    }
    if (req.user.role !== "SUPER_ADMIN") {
        return next(new errorHandler_1.APIError("Super Admin access required", 403, "FORBIDDEN"));
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=adminAuth.js.map