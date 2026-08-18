"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const prisma_1 = require("../config/prisma");
const application_service_1 = require("../services/application.service");
const auditLog_service_1 = require("../services/auditLog.service");
const errorHandler_1 = require("../middleware/errorHandler");
class ApplicationController {
    static async getMyApplication(req, res, next) {
        try {
            const application = await application_service_1.ApplicationService.getMyApplication(req.user.id);
            if (!application || !("exists" in application)) {
                return res.status(200).json({
                    success: true,
                    message: "Application retrieved successfully",
                    data: application,
                });
            }
            if (application.exists === false) {
                return res.status(200).json({
                    success: true,
                    message: "No application found",
                    data: { exists: false },
                });
            }
            res.status(200).json({
                success: true,
                message: "Application retrieved successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createApplication(req, res, next) {
        try {
            const application = await application_service_1.ApplicationService.createApplication(req.user.id, req.body);
            await auditLog_service_1.AuditLogService.log("APPLICATION_CREATED", req.user.id, "AttachmentApplication", application.id, "Application created/updated");
            res.status(201).json({
                success: true,
                message: "Application created successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateApplication(req, res, next) {
        try {
            const application = await application_service_1.ApplicationService.updateApplication(req.user.id, req.params.id, req.body);
            await auditLog_service_1.AuditLogService.log("APPLICATION_UPDATED", req.user.id, "AttachmentApplication", req.params.id, "Application updated");
            res.status(200).json({
                success: true,
                message: "Application updated successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminApplications(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (req.query.status)
                where.status = req.query.status;
            if (req.query.search) {
                where.OR = [
                    { user: { firstName: { contains: req.query.search, mode: "insensitive" } } },
                    { user: { lastName: { contains: req.query.search, mode: "insensitive" } } },
                    { user: { email: { contains: req.query.search, mode: "insensitive" } } },
                ];
            }
            const [applications, total] = await Promise.all([
                prisma_1.prisma.attachmentApplication.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
                            include: { studentProfile: true },
                        },
                        placement: true,
                    },
                }),
                prisma_1.prisma.attachmentApplication.count({ where }),
            ]);
            res.status(200).json({
                success: true,
                message: "Applications retrieved successfully",
                data: applications,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminApplicationById(req, res, next) {
        try {
            const application = await prisma_1.prisma.attachmentApplication.findUnique({
                where: { id: req.params.id },
                include: {
                    user: { include: { studentProfile: true } },
                    placement: { include: { payment: true } },
                },
            });
            if (!application) {
                return next(new errorHandler_1.APIError("Application not found", 404, "NOT_FOUND"));
            }
            res.status(200).json({
                success: true,
                message: "Application retrieved successfully",
                data: application,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ApplicationController = ApplicationController;
//# sourceMappingURL=application.controller.js.map