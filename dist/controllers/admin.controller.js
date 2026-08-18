"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_1 = require("../config/prisma");
const admin_service_1 = require("../services/admin.service");
const auditLog_service_1 = require("../services/auditLog.service");
const systemSetting_service_1 = require("../services/systemSetting.service");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const permissions_1 = require("../utils/permissions");
class AdminController {
    static async getDashboard(req, res, next) {
        try {
            const stats = await admin_service_1.AdminService.getDashboardStats();
            res.status(200).json({ success: true, message: "Dashboard stats retrieved", data: stats });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStudents(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getStudents({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
                institution: req.query.institution,
                course: req.query.course,
                agentId: req.query.agentId,
            });
            res.status(200).json({ success: true, message: "Students retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getStudentById(req, res, next) {
        try {
            const student = await admin_service_1.AdminService.getStudentById(req.params.id);
            res.status(200).json({ success: true, message: "Student retrieved", data: student });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStudent(req, res, next) {
        try {
            const student = await admin_service_1.AdminService.updateStudent(req.params.id, req.body);
            await auditLog_service_1.AuditLogService.log("STUDENT_EDITED", req.user.id, "User", req.params.id, `Student ${req.params.id} updated by admin ${req.user.id}`);
            res.status(200).json({ success: true, message: "Student updated", data: student });
        }
        catch (error) {
            next(error);
        }
    }
    static async suspendStudent(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.suspendStudent(req.params.id);
            res.status(200).json({ success: true, message: "Student suspended", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async activateStudent(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.activateStudent(req.params.id);
            res.status(200).json({ success: true, message: "Student activated", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdmins(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getAdmins({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
            });
            res.status(200).json({ success: true, message: "Admins retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async createAdmin(req, res, next) {
        try {
            const passwordHash = await bcrypt_util_1.BcryptUtil.hashPassword(req.body.password);
            const admin = await prisma_1.prisma.user.create({
                data: {
                    email: req.body.email,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNumber: req.body.phoneNumber,
                    passwordHash,
                    role: req.body.role,
                    status: "ACTIVE",
                    isActive: true,
                },
                select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
            });
            await auditLog_service_1.AuditLogService.log("ADMIN_CREATED", req.user.id, "User", admin.id, `Admin ${admin.email} created by ${req.user.email}`);
            res.status(201).json({ success: true, message: "Admin created", data: admin });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAdmin(req, res, next) {
        try {
            const admin = await prisma_1.prisma.user.update({
                where: { id: req.params.id },
                data: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNumber: req.body.phoneNumber,
                    role: req.body.role,
                    status: req.body.status,
                    isActive: req.body.isActive,
                },
            });
            await auditLog_service_1.AuditLogService.log("ADMIN_EDITED", req.user.id, "User", req.params.id, `Admin ${admin.email} updated by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Admin updated", data: admin });
        }
        catch (error) {
            next(error);
        }
    }
    static async disableAdmin(req, res, next) {
        try {
            const admin = await prisma_1.prisma.user.update({
                where: { id: req.params.id },
                data: { isActive: false, status: "SUSPENDED" },
            });
            await auditLog_service_1.AuditLogService.log("ADMIN_DISABLED", req.user.id, "User", req.params.id, `Admin ${admin.email} disabled by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Admin disabled", data: { id: admin.id, isActive: admin.isActive } });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRoles(req, res, next) {
        try {
            const roles = await admin_service_1.AdminService.getRoles();
            const permissions = permissions_1.ROLE_PERMISSIONS;
            res.status(200).json({ success: true, message: "Roles and permissions retrieved", data: { roles, permissions } });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const result = await admin_service_1.AdminService.getAuditLogs({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                action: req.query.action,
                entityType: req.query.entityType,
                userId: req.query.userId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Audit logs retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getSystemSettings(req, res, next) {
        try {
            const settings = await systemSetting_service_1.SystemSettingService.getSettings();
            res.status(200).json({ success: true, message: "System settings retrieved", data: settings });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSystemSetting(req, res, next) {
        try {
            const setting = await systemSetting_service_1.SystemSettingService.updateSetting(req.params.key, req.body.value, req.user.id);
            res.status(200).json({ success: true, message: "Setting updated", data: setting });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map