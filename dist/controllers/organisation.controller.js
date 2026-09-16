"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationController = void 0;
const organisation_service_1 = require("../services/organisation.service");
const auditLog_service_1 = require("../services/auditLog.service");
const errorHandler_1 = require("../middleware/errorHandler");
class OrganisationController {
    static async register(req, res, next) {
        try {
            console.log("ORG REGISTER HEADERS:", JSON.stringify(req.headers));
            console.log("ORG REGISTER BODY:", JSON.stringify(req.body));
            const result = await organisation_service_1.OrganisationService.register(req.body);
            await auditLog_service_1.AuditLogService.log("ORGANISATION_REGISTERED", undefined, "Organisation", result.organisation.id, `Organisation ${result.organisation.phone ?? result.organisation.email ?? "organisation"} registered via API`, undefined, req.ip, req.get("user-agent"));
            res.status(201).json({
                success: true,
                message: "Organisation registered successfully",
                data: {
                    organisation: result.organisation,
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
            const result = await organisation_service_1.OrganisationService.login(req.body);
            await auditLog_service_1.AuditLogService.log("ORGANISATION_LOGIN", undefined, "Organisation", result.organisation.id, `Organisation ${result.organisation.phone ?? result.organisation.email ?? "organisation"} logged in via API`, undefined, req.ip, req.get("user-agent"));
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    organisation: result.organisation,
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
            const result = await organisation_service_1.OrganisationService.refresh(req.body.refreshToken);
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: {
                    accessToken: result.accessToken,
                    organisation: result.organisation,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            await organisation_service_1.OrganisationService.logout(req.body.refreshToken);
            res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            const organisation = await organisation_service_1.OrganisationService.getMe(req.organisation.id);
            res.status(200).json({
                success: true,
                message: "Organisation profile retrieved successfully",
                data: { organisation },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMe(req, res, next) {
        try {
            const organisation = await organisation_service_1.OrganisationService.updateMe(req.organisation.id, req.body);
            res.status(200).json({
                success: true,
                message: "Organisation profile updated successfully",
                data: { organisation },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadProfileImage(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return next(new errorHandler_1.APIError("No file provided", 400, "NO_FILE"));
            }
            const organisation = await organisation_service_1.OrganisationService.uploadProfileImage(req.organisation.id, file);
            res.status(200).json({
                success: true,
                message: "Profile image uploaded successfully",
                data: { organisation },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrganisationController = OrganisationController;
//# sourceMappingURL=organisation.controller.js.map