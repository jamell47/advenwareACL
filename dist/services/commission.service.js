"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const client_1 = require("@prisma/client");
class CommissionService {
    static async getAllCommissions(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.status)
            where.status = params.status;
        if (params.agentId)
            where.agentId = params.agentId;
        const [commissions, total] = await Promise.all([
            prisma_1.prisma.commission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    placement: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
                    agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
                },
            }),
            prisma_1.prisma.commission.count({ where }),
        ]);
        const [eligibleTotal, paidTotal, pendingTotal] = await Promise.all([
            prisma_1.prisma.commission.aggregate({
                where: { status: client_1.CommissionStatus.ELIGIBLE },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { status: client_1.CommissionStatus.PAID },
                _sum: { amount: true },
            }),
            prisma_1.prisma.commission.aggregate({
                where: { status: client_1.CommissionStatus.PENDING },
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
                totals: {
                    eligible: eligibleTotal._sum.amount || 0,
                    paid: paidTotal._sum.amount || 0,
                    pending: pendingTotal._sum.amount || 0,
                },
            },
        };
    }
    static async getCommissionById(commissionId) {
        const commission = await prisma_1.prisma.commission.findUnique({
            where: { id: commissionId },
            include: {
                placement: { include: { user: true } },
                agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
            },
        });
        if (!commission) {
            throw new errorHandler_1.APIError("Commission not found", 404, "COMMISSION_NOT_FOUND");
        }
        return commission;
    }
    static async updateCommissionStatus(commissionId, status, paymentRef) {
        const commission = await prisma_1.prisma.commission.update({
            where: { id: commissionId },
            data: {
                status,
                paymentRef,
                paidAt: status === client_1.CommissionStatus.PAID ? new Date() : undefined,
                eligibleAt: status === client_1.CommissionStatus.ELIGIBLE ? new Date() : undefined,
            },
        });
        await auditLog_service_1.AuditLogService.log("COMMISSION_STATUS_CHANGED", undefined, "Commission", commissionId, `Commission ${commissionId} status changed to ${status}`, { status, paymentRef });
        return commission;
    }
    static async createCommissionForPayment(paymentId) {
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                placement: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!payment || !payment.placementId || !payment.placement) {
            throw new errorHandler_1.APIError("Payment or placement not found", 404, "PAYMENT_NOT_FOUND");
        }
        const placement = payment.placement;
        const student = placement.user;
        if (!student.agentId) {
            return null;
        }
        const existingCommission = await prisma_1.prisma.commission.findFirst({
            where: { placementId: placement.id, agentId: student.agentId },
        });
        if (existingCommission) {
            return existingCommission;
        }
        const commissionAmount = placement.commissionAmount || 500;
        const commission = await prisma_1.prisma.commission.create({
            data: {
                placementId: placement.id,
                agentId: student.agentId,
                amount: commissionAmount,
                currency: "KES",
                status: client_1.CommissionStatus.ELIGIBLE,
                eligibleAt: new Date(),
            },
        });
        await auditLog_service_1.AuditLogService.log("COMMISSION_CREATED", undefined, "Commission", commission.id, `Commission of KSh ${commissionAmount} created for agent ${student.agentId} from placement ${placement.id}`);
        return commission;
    }
}
exports.CommissionService = CommissionService;
//# sourceMappingURL=commission.service.js.map