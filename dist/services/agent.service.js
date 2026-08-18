"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const notification_service_1 = require("./notification.service");
const client_1 = require("@prisma/client");
const bcrypt_util_1 = require("../utils/bcrypt.util");
class AgentService {
    static async getAgentDashboard(agentId) {
        const agentStudentIds = (await prisma_1.prisma.user.findMany({ where: { agentId }, select: { id: true } })).map((u) => u.id);
        const [totalStudents, placedStudents, pendingStudents, eligibleCommission, paidCommission, availableBalance, pendingWithdrawal,] = await Promise.all([
            prisma_1.prisma.user.count({ where: { agentId } }),
            prisma_1.prisma.placement.count({
                where: {
                    userId: { in: agentStudentIds },
                    status: { in: [client_1.PlacementStatus.CONFIRMED] },
                },
            }),
            prisma_1.prisma.user.count({
                where: {
                    agentId,
                    placements: {
                        none: {},
                    },
                },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.ELIGIBLE },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.PAID },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.ELIGIBLE },
                _sum: { amount: true },
            }),
            prisma_1.prisma.withdrawal.aggregate({
                where: { agentId, status: client_1.WithdrawalStatus.PENDING },
                _sum: { amount: true },
            }),
        ]);
        return {
            totalStudents,
            placedStudents,
            pendingStudents,
            eligibleCommission: eligibleCommission._sum.amount || 0,
            paidCommission: paidCommission._sum.amount || 0,
            availableBalance: availableBalance._sum.amount || 0,
            pendingWithdrawal: pendingWithdrawal._sum.amount || 0,
        };
    }
    static async getAgents(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { role: client_1.UserRole.AGENT };
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
        const [agents, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    agentProfile: { include: { organization: true } },
                    _count: {
                        select: {
                            students: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const agentIds = agents.map((a) => a.id);
        const placementCounts = await prisma_1.prisma.placement.groupBy({
            where: { userId: { in: agentIds.length > 0 ? agentIds : undefined } },
            by: ["userId"],
            _count: { _all: true },
        });
        const commissionsAgg = await prisma_1.prisma.commission.groupBy({
            where: { agentId: { in: agentIds.length > 0 ? agentIds : undefined } },
            by: ["agentId", "status"],
            _sum: { amount: true },
        });
        const formatted = agents.map((agent) => {
            const totalCommissions = commissionsAgg
                .filter((c) => c.agentId === agent.id && c.status === "PAID")
                .reduce((sum, c) => sum + (c._sum.amount || 0), 0);
            const eligibleCommissions = commissionsAgg
                .filter((c) => c.agentId === agent.id && c.status === "ELIGIBLE")
                .reduce((sum, c) => sum + (c._sum.amount || 0), 0);
            const paidCommissions = commissionsAgg
                .filter((c) => c.agentId === agent.id && c.status === "PAID")
                .reduce((sum, c) => sum + (c._sum.amount || 0), 0);
            return {
                id: agent.id,
                email: agent.email,
                firstName: agent.firstName,
                lastName: agent.lastName,
                phoneNumber: agent.phoneNumber,
                profileImage: agent.profileImage,
                role: agent.role,
                status: agent.status,
                isActive: agent.isActive,
                organization: agent.agentProfile?.organization
                    ? {
                        id: agent.agentProfile.organization.id,
                        name: agent.agentProfile.organization.name,
                    }
                    : null,
                registrationDate: agent.agentProfile?.registrationDate,
                isApproved: agent.agentProfile?.isApproved,
                commissionRate: agent.agentProfile?.commissionRate,
                studentsRegistered: agent._count.students,
                placedStudents: placementCounts.find((p) => p.userId === agent.id)?._count._all || 0,
                totalCommissions,
                eligibleCommissions,
                paidCommissions,
                availableBalance: eligibleCommissions,
                createdAt: agent.createdAt,
                updatedAt: agent.updatedAt,
            };
        });
        return {
            data: formatted,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async getAgentById(agentId) {
        const agent = await prisma_1.prisma.user.findUnique({
            where: { id: agentId },
            include: {
                agentProfile: { include: { organization: true } },
                students: {
                    include: {
                        studentProfile: true,
                        placements: { include: { payment: true } },
                    },
                },
                commissions: {
                    include: { placement: { include: { user: true } } },
                    orderBy: { createdAt: "desc" },
                },
                withdrawals: { orderBy: { createdAt: "desc" } },
            },
        });
        if (!agent) {
            throw new errorHandler_1.APIError("Agent not found", 404, "AGENT_NOT_FOUND");
        }
        return {
            id: agent.id,
            email: agent.email,
            firstName: agent.firstName,
            lastName: agent.lastName,
            phoneNumber: agent.phoneNumber,
            profileImage: agent.profileImage,
            role: agent.role,
            status: agent.status,
            isActive: agent.isActive,
            organization: agent.agentProfile?.organization
                ? { id: agent.agentProfile.organization.id, name: agent.agentProfile.organization.name }
                : null,
            registrationDate: agent.agentProfile?.registrationDate,
            isApproved: agent.agentProfile?.isApproved,
            commissionRate: agent.agentProfile?.commissionRate,
            students: agent.students.map((s) => ({
                id: s.id,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                phoneNumber: s.phoneNumber,
                institution: s.studentProfile?.institution,
                course: s.studentProfile?.course,
                placements: s.placements,
            })),
            commissions: agent.commissions,
            withdrawals: agent.withdrawals,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
        };
    }
    static async approveAgent(agentId) {
        const agent = await prisma_1.prisma.user.findUnique({
            where: { id: agentId },
            include: { agentProfile: true },
        });
        if (!agent) {
            throw new errorHandler_1.APIError("Agent not found", 404, "AGENT_NOT_FOUND");
        }
        if (agent.role !== client_1.UserRole.AGENT) {
            throw new errorHandler_1.APIError("User is not an agent", 400, "INVALID_ROLE");
        }
        await prisma_1.prisma.agentProfile.upsert({
            where: { userId: agentId },
            update: { isApproved: true },
            create: { userId: agentId, isApproved: true },
        });
        await auditLog_service_1.AuditLogService.log("AGENT_APPROVED", undefined, "User", agentId, `Agent ${agent.email} approved`);
        await notification_service_1.NotificationService.createNotification({
            userId: agentId,
            type: "SYSTEM",
            title: "Agent Approved",
            message: "Your agent account has been approved. You can now start registering students.",
            data: { agentId },
        });
        return { id: agent.id, isApproved: true };
    }
    static async suspendAgent(agentId) {
        const agent = await prisma_1.prisma.user.update({
            where: { id: agentId },
            data: { status: "SUSPENDED", isActive: false },
        });
        await auditLog_service_1.AuditLogService.log("AGENT_SUSPENDED", undefined, "User", agentId, `Agent ${agent.email} suspended`);
        await notification_service_1.NotificationService.createNotification({
            userId: agentId,
            type: "SYSTEM",
            title: "Account Suspended",
            message: "Your agent account has been suspended.",
            data: { agentId },
        });
        return { id: agent.id, status: agent.status, isActive: agent.isActive };
    }
    static async activateAgent(agentId) {
        const agent = await prisma_1.prisma.user.update({
            where: { id: agentId },
            data: { status: "ACTIVE", isActive: true },
        });
        await auditLog_service_1.AuditLogService.log("AGENT_ACTIVATED", undefined, "User", agentId, `Agent ${agent.email} activated`);
        return { id: agent.id, status: agent.status, isActive: agent.isActive };
    }
    static async getAgentStudents(agentId, params) {
        const studentIds = await prisma_1.prisma.user.findMany({
            where: { agentId },
            select: { id: true },
        });
        const studentIdArray = studentIds.map((s) => s.id);
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {
            id: { in: studentIdArray.length > 0 ? studentIdArray : undefined },
        };
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
        const [students, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    studentProfile: true,
                    placements: { take: 1, orderBy: { createdAt: "desc" } },
                },
            }),
            prisma_1.prisma.user.count({ where }),
        ]);
        const formatted = students.map((s) => {
            const profile = s.studentProfile;
            const placement = s.placements?.[0];
            return {
                id: s.id,
                email: s.email,
                firstName: s.firstName,
                lastName: s.lastName,
                phoneNumber: s.phoneNumber,
                institution: profile?.institution,
                course: profile?.course,
                applicationStatus: null,
                placementStatus: placement?.status,
                paymentStatus: null,
                commissionStatus: null,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            };
        });
        return {
            data: formatted,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async registerStudentByAgent(agentId, data) {
        const agent = await prisma_1.prisma.user.findUnique({
            where: { id: agentId },
            select: { role: true, isActive: true, phoneNumber: true },
        });
        if (!agent || agent.role !== client_1.UserRole.AGENT) {
            throw new errorHandler_1.APIError("Agent not found or not authorized", 403, "NOT_AN_AGENT");
        }
        if (!agent.isActive) {
            throw new errorHandler_1.APIError("Agent account is inactive", 403, "AGENT_INACTIVE");
        }
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: { OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }] },
            select: { id: true },
        });
        if (existingUser) {
            throw new errorHandler_1.APIError("Email or phone number already registered", 409, "USER_EXISTS");
        }
        const passwordHash = await bcrypt_util_1.BcryptUtil.hashPassword(data.password || "TempPass123!");
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                phoneNumber: data.phoneNumber,
                passwordHash,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                role: client_1.UserRole.STUDENT,
                status: "ACTIVE",
                isActive: true,
                agentId,
                studentProfile: {
                    create: {
                        institution: data.institution,
                        course: data.course,
                        department: data.department,
                        studentRegistrationNumber: data.studentRegistrationNumber,
                        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
                        nationality: data.nationality,
                        gender: data.gender,
                        idNumber: data.idNumber,
                        idType: data.idType,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        await auditLog_service_1.AuditLogService.log("STUDENT_REGISTERED_BY_AGENT", agentId, "User", user.id, `Student ${user.email} registered by agent ${agentId}`);
        await notification_service_1.NotificationService.createNotification({
            userId: user.id,
            type: "SYSTEM",
            title: "Account Created",
            message: `Your account was created by agent ${agentId}. You can now log in using your credentials.`,
            data: { userId: user.id, agentId },
        });
        return user;
    }
    static async getAgentCommissionHistory(agentId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const [commissions, total] = await Promise.all([
            prisma_1.prisma.commission.findMany({
                where: { agentId },
                include: { placement: { include: { user: true } } },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.commission.count({ where: { agentId } }),
        ]);
        const [eligible, paid] = await Promise.all([
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.ELIGIBLE },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.PAID },
                _sum: { amount: true },
            }),
        ]);
        return {
            data: commissions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                eligibleTotal: eligible._sum.amount || 0,
                paidTotal: paid._sum.amount || 0,
                availableBalance: eligible._sum.amount || 0,
            },
        };
    }
    static async getAgentWithdrawals(agentId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const [withdrawals, total] = await Promise.all([
            prisma_1.prisma.withdrawal.findMany({
                where: { agentId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.withdrawal.count({ where: { agentId } }),
        ]);
        return {
            data: withdrawals,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async requestWithdrawal(agentId, data) {
        const agent = await prisma_1.prisma.user.findUnique({
            where: { id: agentId },
            select: { role: true, isActive: true, phoneNumber: true },
        });
        if (!agent || agent.role !== client_1.UserRole.AGENT) {
            throw new errorHandler_1.APIError("Agent not found or not authorized", 403, "NOT_AN_AGENT");
        }
        if (data.amount <= 0) {
            throw new errorHandler_1.APIError("Invalid withdrawal amount", 400, "INVALID_AMOUNT");
        }
        const eligible = await prisma_1.prisma.commission.aggregate({
            where: { agentId, status: client_1.CommissionStatus.ELIGIBLE },
            _sum: { amount: true },
        });
        const availableBalance = eligible._sum.amount || 0;
        if (data.amount > availableBalance) {
            throw new errorHandler_1.APIError(`Insufficient balance. Available: KSh ${availableBalance}`, 400, "INSUFFICIENT_BALANCE");
        }
        const pendingWithdrawal = await prisma_1.prisma.withdrawal.findFirst({
            where: { agentId, status: client_1.WithdrawalStatus.PENDING },
        });
        if (pendingWithdrawal) {
            throw new errorHandler_1.APIError("You already have a pending withdrawal request", 400, "WITHDRAWAL_PENDING");
        }
        const settings = await prisma_1.prisma.systemSetting.findMany({
            where: { group: "withdrawal" },
        });
        const minWithdrawalSetting = settings.find((s) => s.key === "min_amount");
        const minWithdrawal = minWithdrawalSetting ? parseInt(minWithdrawalSetting.value, 10) : 100;
        if (data.amount < minWithdrawal) {
            throw new errorHandler_1.APIError(`Minimum withdrawal amount is KSh ${minWithdrawal}`, 400, "BELOW_MINIMUM");
        }
        const withdrawal = await prisma_1.prisma.withdrawal.create({
            data: {
                agentId,
                amount: data.amount,
                currency: "KES",
                method: data.method || "BANK_TRANSFER",
                phone: data.phone || agent.phoneNumber,
                status: client_1.WithdrawalStatus.PENDING,
            },
        });
        await auditLog_service_1.AuditLogService.log("WITHDRAWAL_REQUESTED", agentId, "Withdrawal", withdrawal.id, `Agent ${agentId} requested KSh ${data.amount} withdrawal`);
        await notification_service_1.NotificationService.createNotification({
            userId: agentId,
            type: "SYSTEM",
            title: "Withdrawal Request Submitted",
            message: `Your withdrawal request of KSh ${data.amount} has been submitted and is pending review.`,
            data: { withdrawalId: withdrawal.id, amount: data.amount },
        });
        return withdrawal;
    }
    static async createCommission(placementId, agentId, amount) {
        const commission = await prisma_1.prisma.commission.create({
            data: {
                placementId,
                agentId,
                amount,
                currency: "KES",
                status: client_1.CommissionStatus.PENDING,
            },
        });
        await auditLog_service_1.AuditLogService.log("COMMISSION_CREATED", undefined, "Commission", commission.id, `Commission of KSh ${amount} created for agent ${agentId} from placement ${placementId}`);
        return commission;
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=agent.service.js.map