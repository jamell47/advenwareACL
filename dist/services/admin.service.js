"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = require("../config/prisma");
const auditLog_service_1 = require("./auditLog.service");
const notification_service_1 = require("./notification.service");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class AdminService {
    static async getDashboardStats() {
        const [totalStudents, totalAgents, totalAdmins, totalApplications, totalPlacements, successfulPlacements, pendingApplications, pendingDocuments, totalPayments, totalRevenue, eligibleCommissions, paidCommissions, pendingWithdrawals, totalOrganizations,] = await Promise.all([
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.STUDENT } }),
            prisma_1.prisma.user.count({ where: { role: client_1.UserRole.AGENT } }),
            prisma_1.prisma.user.count({ where: { role: { in: [client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.PLACEMENT_ADMIN, client_1.UserRole.DOCUMENT_ADMIN, client_1.UserRole.SUPPORT] } } }),
            prisma_1.prisma.attachmentApplication.count(),
            prisma_1.prisma.placement.count(),
            prisma_1.prisma.placement.count({ where: { status: client_1.PlacementStatus.CONFIRMED } }),
            prisma_1.prisma.attachmentApplication.count({ where: { status: { in: [client_1.ApplicationStatus.UNDER_REVIEW, client_1.ApplicationStatus.DRAFT] } } }),
            prisma_1.prisma.document.count({ where: { status: { in: [client_1.DocumentStatus.PENDING_REVIEW, client_1.DocumentStatus.REUPLOAD_REQUIRED] } } }),
            prisma_1.prisma.payment.count({ where: { status: client_1.PaymentStatus.SUCCESSFUL } }),
            prisma_1.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.SUCCESSFUL },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.count({ where: { status: client_1.CommissionStatus.ELIGIBLE } }),
            prisma_1.prisma.commission.count({ where: { status: client_1.CommissionStatus.PAID } }),
            prisma_1.prisma.withdrawal.count({ where: { status: "PENDING" } }),
            prisma_1.prisma.organization.count({ where: { status: "ACTIVE" } }),
        ]);
        return {
            totalStudents,
            totalAgents,
            totalAdmins,
            totalApplications,
            totalPlacements,
            successfulPlacements,
            pendingApplications,
            pendingDocuments,
            totalPayments,
            totalRevenue: totalRevenue._sum.amount || 0,
            eligibleCommissions,
            paidCommissions,
            pendingWithdrawals,
            totalOrganizations,
        };
    }
    static async getStudents(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            role: client_1.UserRole.STUDENT,
        };
        if (params.search) {
            where.OR = [
                { firstName: { contains: params.search, mode: "insensitive" } },
                { lastName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
                { phoneNumber: { contains: params.search, mode: "insensitive" } },
            ];
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.institution) {
            where.studentProfile = {
                institution: { contains: params.institution, mode: "insensitive" },
            };
        }
        if (params.course) {
            where.studentProfile = {
                ...where.studentProfile,
                course: { contains: params.course, mode: "insensitive" },
            };
        }
        if (params.agentId) {
            where.agentId = params.agentId;
        }
        const [students, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    studentProfile: true,
                    agent: { select: { id: true, firstName: true, lastName: true, email: true } },
                    placements: { take: 1, orderBy: { createdAt: "desc" } },
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const formatted = students.map((s) => this.formatStudent(s));
        return {
            data: formatted,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static formatStudent(user) {
        const profile = user.studentProfile;
        const placement = user.placements?.[0];
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            status: user.status,
            isActive: user.isActive,
            institution: profile?.institution,
            course: profile?.course,
            department: profile?.department,
            currentYear: profile?.currentYear,
            idNumber: profile?.idNumber,
            applicationStatus: placement?.status,
            placementStatus: placement?.status,
            agent: user.agent ? { id: user.agent.id, name: `${user.agent.firstName} ${user.agent.lastName}`, email: user.agent.email } : null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    static async getStudentById(studentId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: studentId },
            include: {
                studentProfile: {
                    include: { educations: true },
                },
                placements: { include: { payment: true } },
                payments: true,
                documents: true,
                applications: true,
                agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
                auditLogs: { orderBy: { createdAt: "desc" }, take: 50 },
            },
        });
        if (!user) {
            throw new errorHandler_1.APIError("Student not found", 404, "STUDENT_NOT_FOUND");
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            status: user.status,
            isActive: user.isActive,
            role: user.role,
            agent: user.agent ? { id: user.agent.id, name: `${user.agent.firstName} ${user.agent.lastName}`, email: user.agent.email } : null,
            profile: user.studentProfile
                ? {
                    id: user.studentProfile.id,
                    dateOfBirth: user.studentProfile.dateOfBirth,
                    nationality: user.studentProfile.nationality,
                    gender: user.studentProfile.gender,
                    idNumber: user.studentProfile.idNumber,
                    idType: user.studentProfile.idType,
                    studentRegistrationNumber: user.studentProfile.studentRegistrationNumber,
                    institution: user.studentProfile.institution,
                    course: user.studentProfile.course,
                    department: user.studentProfile.department,
                    currentYear: user.studentProfile.currentYear,
                    expectedGraduation: user.studentProfile.expectedGraduation,
                    preferredStartDate: user.studentProfile.preferredStartDate,
                    preferredEndDate: user.studentProfile.preferredEndDate,
                    preferredLocation: user.studentProfile.preferredLocation,
                    preferredIndustry: user.studentProfile.preferredIndustry,
                    preferredPlacementArea: user.studentProfile.preferredPlacementArea,
                    profileCompleteness: user.studentProfile.profileCompleteness,
                    educations: user.studentProfile.educations,
                    createdAt: user.studentProfile.createdAt,
                    updatedAt: user.studentProfile.updatedAt,
                }
                : null,
            placements: user.placements,
            payments: user.payments,
            documents: user.documents,
            applications: user.applications,
            auditLogs: user.auditLogs,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    static async updateStudent(studentId, data) {
        const user = await prisma_1.prisma.user.update({
            where: { id: studentId },
            data: {
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                status: data.status,
                isActive: data.isActive,
                studentProfile: data.profile
                    ? {
                        upsert: {
                            where: { userId: studentId },
                            update: data.profile,
                            create: { userId: studentId, ...data.profile },
                        },
                    }
                    : undefined,
            },
            include: { studentProfile: true },
        });
        await auditLog_service_1.AuditLogService.log("STUDENT_EDITED", undefined, "User", studentId, `Student ${user.email} profile updated by admin`, { changes: data });
        return this.formatStudent(user);
    }
    static async suspendStudent(studentId) {
        const user = await prisma_1.prisma.user.update({
            where: { id: studentId },
            data: { status: client_1.UserStatus.SUSPENDED, isActive: false },
        });
        await auditLog_service_1.AuditLogService.log("STUDENT_SUSPENDED", undefined, "User", studentId, `Student ${user.email} suspended by admin`);
        await notification_service_1.NotificationService.createNotification({
            userId: studentId,
            type: "SYSTEM",
            title: "Account Suspended",
            message: "Your account has been suspended. Contact support for assistance.",
            data: { studentId },
        });
        return { id: user.id, status: user.status, isActive: user.isActive };
    }
    static async activateStudent(studentId) {
        const user = await prisma_1.prisma.user.update({
            where: { id: studentId },
            data: { status: client_1.UserStatus.ACTIVE, isActive: true },
        });
        await auditLog_service_1.AuditLogService.log("STUDENT_ACTIVATED", undefined, "User", studentId, `Student ${user.email} activated by admin`);
        await notification_service_1.NotificationService.createNotification({
            userId: studentId,
            type: "SYSTEM",
            title: "Account Activated",
            message: "Your account has been activated. You can now use all features.",
            data: { studentId },
        });
        return { id: user.id, status: user.status, isActive: user.isActive };
    }
    static async getAdmins(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const adminRoles = [client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.PLACEMENT_ADMIN, client_1.UserRole.DOCUMENT_ADMIN, client_1.UserRole.SUPPORT];
        const where = { role: { in: adminRoles } };
        if (params.search) {
            where.OR = [
                { firstName: { contains: params.search, mode: "insensitive" } },
                { lastName: { contains: params.search, mode: "insensitive" } },
                { email: { contains: params.search, mode: "insensitive" } },
            ];
        }
        if (params.status) {
            where.status = params.status;
        }
        const [admins, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    role: true,
                    status: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        return {
            data: admins,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async getRoles() {
        return [
            { role: "SUPER_ADMIN", name: "Super Admin", description: "Full access to all features" },
            { role: "ADMIN", name: "Admin", description: "General administration" },
            { role: "PLACEMENT_ADMIN", name: "Operations Admin", description: "Manage placements and applications" },
            { role: "DOCUMENT_ADMIN", name: "Document Admin", description: "Review and manage documents" },
            { role: "FINANCE_ADMIN", name: "Finance Admin", description: "Manage payments, commissions, and withdrawals" },
            { role: "SUPPORT_ADMIN", name: "Support Admin", description: "Handle student and agent support" },
            { role: "AGENT_MANAGER", name: "Agent Manager", description: "Manage agents and their performance" },
            { role: "PARTNERSHIP_ADMIN", name: "Partnership Admin", description: "Manage organizations and partnerships" },
            { role: "AGENT", name: "Agent", description: "Register and manage students" },
            { role: "STUDENT", name: "Student", description: "Student user" },
        ];
    }
    static async getAuditLogs(params) {
        const page = params.page || 1;
        const limit = params.limit || 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.action)
            where.action = params.action;
        if (params.entityType)
            where.entityType = params.entityType;
        if (params.userId)
            where.userId = params.userId;
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = new Date(params.startDate);
            if (params.endDate)
                where.createdAt.lte = new Date(params.endDate);
        }
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
            }),
            prisma_1.prisma.auditLog.count({ where }),
        ]);
        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map