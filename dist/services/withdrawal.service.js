"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const notification_service_1 = require("./notification.service");
const env_1 = require("../config/env");
const daraja_service_1 = require("./daraja.service");
const client_1 = require("@prisma/client");
class WithdrawalService {
    static async getAllWithdrawals(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.status)
            where.status = params.status;
        if (params.agentId)
            where.agentId = params.agentId;
        const [withdrawals, total] = await Promise.all([
            prisma_1.prisma.withdrawal.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
                },
            }),
            prisma_1.prisma.withdrawal.count({ where }),
        ]);
        const [pendingTotal, approvedTotal, paidTotal, rejectedTotal] = await Promise.all([
            prisma_1.prisma.withdrawal.aggregate({
                where: { status: client_1.WithdrawalStatus.PENDING },
                _sum: { amount: true },
            }),
            prisma_1.prisma.withdrawal.aggregate({
                where: { status: client_1.WithdrawalStatus.APPROVED },
                _sum: { amount: true },
            }),
            prisma_1.prisma.withdrawal.aggregate({
                where: { status: client_1.WithdrawalStatus.SUCCESS },
                _sum: { amount: true },
            }),
            prisma_1.prisma.withdrawal.aggregate({
                where: { status: client_1.WithdrawalStatus.REJECTED },
                _sum: { amount: true },
            }),
        ]);
        return {
            data: withdrawals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totals: {
                    pending: pendingTotal._sum.amount || 0,
                    approved: approvedTotal._sum.amount || 0,
                    paid: paidTotal._sum.amount || 0,
                    rejected: rejectedTotal._sum.amount || 0,
                },
            },
        };
    }
    static async getWithdrawalById(withdrawalId) {
        const withdrawal = await prisma_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: {
                agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
            },
        });
        if (!withdrawal) {
            throw new errorHandler_1.APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
        }
        return withdrawal;
    }
    static async approveWithdrawal(withdrawalId, adminUserId) {
        const withdrawal = await prisma_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: { agent: true },
        });
        if (!withdrawal) {
            throw new errorHandler_1.APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
        }
        if (withdrawal.status !== client_1.WithdrawalStatus.PENDING) {
            throw new errorHandler_1.APIError(`Withdrawal is in ${withdrawal.status} status and cannot be approved`, 400, "INVALID_STATUS");
        }
        const updated = await prisma_1.prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
                status: client_1.WithdrawalStatus.APPROVED,
                paidAt: new Date(),
            },
        });
        await auditLog_service_1.AuditLogService.log("WITHDRAWAL_APPROVED", adminUserId, "Withdrawal", withdrawalId, `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} approved`);
        await notification_service_1.NotificationService.createNotification({
            userId: withdrawal.agentId,
            type: "SYSTEM",
            title: "Withdrawal Approved",
            message: `Your withdrawal request of KSh ${withdrawal.amount} has been approved and is being processed.`,
            data: { withdrawalId, amount: withdrawal.amount },
        });
        return updated;
    }
    static async rejectWithdrawal(withdrawalId, adminUserId, reason) {
        const withdrawal = await prisma_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: { agent: true },
        });
        if (!withdrawal) {
            throw new errorHandler_1.APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
        }
        if (withdrawal.status !== client_1.WithdrawalStatus.PENDING) {
            throw new errorHandler_1.APIError(`Withdrawal is in ${withdrawal.status} status and cannot be rejected`, 400, "INVALID_STATUS");
        }
        const updated = await prisma_1.prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: client_1.WithdrawalStatus.REJECTED },
        });
        await auditLog_service_1.AuditLogService.log("WITHDRAWAL_REJECTED", adminUserId, "Withdrawal", withdrawalId, `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} rejected. Reason: ${reason}`, { reason });
        await notification_service_1.NotificationService.createNotification({
            userId: withdrawal.agentId,
            type: "SYSTEM",
            title: "Withdrawal Rejected",
            message: `Your withdrawal request of KSh ${withdrawal.amount} has been rejected. Reason: ${reason}`,
            data: { withdrawalId, amount: withdrawal.amount, reason },
        });
        return updated;
    }
    static async processWithdrawalB2C(withdrawalId, adminUserId) {
        const withdrawal = await prisma_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: { agent: true },
        });
        if (!withdrawal) {
            throw new errorHandler_1.APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
        }
        if (!env_1.env.darajaConsumerKey || !env_1.env.darajaConsumerSecret) {
            return {
                withdrawal,
                message: "Daraja is not configured. Cannot process B2C payment.",
                configured: false,
            };
        }
        if (withdrawal.status !== client_1.WithdrawalStatus.APPROVED) {
            throw new errorHandler_1.APIError("Withdrawal must be approved before processing", 400, "INVALID_STATUS");
        }
        await prisma_1.prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: client_1.WithdrawalStatus.PROCESSING },
        });
        try {
            const b2cResponse = await daraja_service_1.DarajaService.initiateB2C(withdrawal.phone || withdrawal.agent.phoneNumber || "", withdrawal.amount, `ACL-WITHDRAWAL-${withdrawal.id.slice(0, 8)}`);
            await auditLog_service_1.AuditLogService.log("B2C_PAYOUT_INITIATED", adminUserId, "Withdrawal", withdrawalId, `B2C payout initiated for KSh ${withdrawal.amount} to agent ${withdrawal.agentId}`, { b2cResponse });
            return { withdrawal, b2cResponse };
        }
        catch (error) {
            await prisma_1.prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: { status: client_1.WithdrawalStatus.FAILED },
            });
            throw new errorHandler_1.APIError("B2C payout failed. Contact support.", 500, "B2C_FAILED");
        }
    }
    static async getAgentWithdrawalStats(agentId) {
        const [eligibleCommission] = await Promise.all([
            prisma_1.prisma.commission.aggregate({
                where: { agentId, status: client_1.CommissionStatus.ELIGIBLE },
                _sum: { amount: true },
            }),
        ]);
        return {
            availableBalance: eligibleCommission._sum.amount || 0,
        };
    }
}
exports.WithdrawalService = WithdrawalService;
//# sourceMappingURL=withdrawal.service.js.map