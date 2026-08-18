"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const organization_service_1 = require("../services/organization.service");
const auditLog_service_1 = require("../services/auditLog.service");
class OrganizationController {
    static async getOrganizations(req, res, next) {
        try {
            const result = await organization_service_1.OrganizationService.getOrganizations({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
            });
            res.status(200).json({ success: true, message: "Organizations retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrganizationById(req, res, next) {
        try {
            const org = await organization_service_1.OrganizationService.getOrganizationById(req.params.id);
            res.status(200).json({ success: true, message: "Organization retrieved", data: org });
        }
        catch (error) {
            next(error);
        }
    }
    static async createOrganization(req, res, next) {
        try {
            const org = await organization_service_1.OrganizationService.createOrganization(req.body);
            await auditLog_service_1.AuditLogService.log("ORGANIZATION_CREATED", req.user.id, "Organization", org.id, `Organization ${org.name} created by ${req.user.email}`);
            res.status(201).json({ success: true, message: "Organization created", data: org });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOrganization(req, res, next) {
        try {
            const org = await organization_service_1.OrganizationService.updateOrganization(req.params.id, req.body);
            await auditLog_service_1.AuditLogService.log("ORGANIZATION_UPDATED", req.user.id, "Organization", req.params.id, `Organization ${org.name} updated by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Organization updated", data: org });
        }
        catch (error) {
            next(error);
        }
    }
    static async suspendOrganization(req, res, next) {
        try {
            const org = await organization_service_1.OrganizationService.suspendOrganization(req.params.id);
            await auditLog_service_1.AuditLogService.log("ORGANIZATION_SUSPENDED", req.user.id, "Organization", req.params.id, `Organization ${org.name} suspended by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Organization suspended", data: org });
        }
        catch (error) {
            next(error);
        }
    }
    static async activateOrganization(req, res, next) {
        try {
            const org = await organization_service_1.OrganizationService.activateOrganization(req.params.id);
            await auditLog_service_1.AuditLogService.log("ORGANIZATION_ACTIVATED", req.user.id, "Organization", req.params.id, `Organization ${org.name} activated by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Organization activated", data: org });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrganizationController = OrganizationController;
//# sourceMappingURL=organization.controller.js.map