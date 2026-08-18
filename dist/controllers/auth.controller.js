"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auditLog_service_1 = require("../services/auditLog.service");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            await auditLog_service_1.AuditLogService.log("USER_REGISTERED", result.user.id, "User", result.user.id, `User ${result.user.email} registered`, undefined, req.ip, req.get("user-agent"));
            res.status(201).json({
                success: true,
                message: "Registration successful. Please check your email for verification.",
                data: {
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        role: result.user.role,
                    },
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            await auditLog_service_1.AuditLogService.log("USER_LOGIN", result.user.id, "User", result.user.id, `User ${result.user.email} logged in`, undefined, req.ip, req.get("user-agent"));
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.refreshToken(req.body.refreshToken);
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: {
                    accessToken: result.accessToken,
                    user: result.user,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            await auth_service_1.AuthService.logout(req.body.refreshToken);
            await auditLog_service_1.AuditLogService.log("USER_LOGOUT", req.user?.id, "User", req.user?.id, "User logged out", undefined, req.ip, req.get("user-agent"));
            res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPassword(req, res, next) {
        try {
            await auth_service_1.AuthService.forgotPassword(req.body.email);
            res.status(200).json({
                success: true,
                message: "If an account exists with that email, a password reset link has been sent.",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            await auth_service_1.AuthService.resetPassword(req.body.token, req.body.newPassword);
            res.status(200).json({
                success: true,
                message: "Password has been reset successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role,
                },
            },
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map