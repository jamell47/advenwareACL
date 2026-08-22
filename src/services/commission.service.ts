import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { CommissionStatus } from "@prisma/client";
import { sanitizeQueryParams } from "../utils/query.util";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totals?: Record<string, number>;
    [key: string]: any;
  };
}

export class CommissionService {
  static async getAllCommissions(params: {
    page?: number;
    limit?: number;
    status?: string;
    agentId?: string;
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = {};
    if (cleanParams.status) where.status = cleanParams.status;
    if (cleanParams.agentId) where.agentId = cleanParams.agentId;

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          placement: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
          agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        },
      }),
      prisma.commission.count({ where }),
    ]);

    const [eligibleTotal, paidTotal, pendingTotal] = await Promise.all([
      prisma.commission.aggregate({
        where: { status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { status: CommissionStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { status: CommissionStatus.PENDING },
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

  static async getCommissionById(commissionId: string): Promise<any> {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        placement: { include: { user: true } },
        agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
      },
    });

    if (!commission) {
      throw new APIError("Commission not found", 404, "COMMISSION_NOT_FOUND");
    }

    return commission;
  }

  static async updateCommissionStatus(commissionId: string, status: CommissionStatus, paymentRef?: string): Promise<any> {
    const commission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status,
        paymentRef,
        paidAt: status === CommissionStatus.PAID ? new Date() : undefined,
        eligibleAt: status === CommissionStatus.ELIGIBLE ? new Date() : undefined,
      },
    });

    await AuditLogService.log(
      "COMMISSION_STATUS_CHANGED",
      undefined,
      "Commission",
      commissionId,
      `Commission ${commissionId} status changed to ${status}`,
      { status, paymentRef },
    );

    return commission;
  }

  static async createCommissionForPayment(paymentId: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
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
      throw new APIError("Payment or placement not found", 404, "PAYMENT_NOT_FOUND");
    }

    const placement = payment.placement;
    const student = placement.user;

    if (!student.agentId) {
      return null;
    }

    const existingCommission = await prisma.commission.findFirst({
      where: { placementId: placement.id, agentId: student.agentId },
    });

    if (existingCommission) {
      return existingCommission;
    }

    const commissionAmount = placement.commissionAmount || 500;

    const commission = await prisma.commission.create({
      data: {
        placementId: placement.id,
        agentId: student.agentId,
        amount: commissionAmount,
        currency: "KES",
        status: CommissionStatus.ELIGIBLE,
        eligibleAt: new Date(),
      },
    });

    await AuditLogService.log(
      "COMMISSION_CREATED",
      undefined,
      "Commission",
      commission.id,
      `Commission of KSh ${commissionAmount} created for agent ${student.agentId} from placement ${placement.id}`,
    );

    return commission;
  }
}
