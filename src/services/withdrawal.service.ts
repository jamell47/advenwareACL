import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";
import { env } from "../config/env";
import { DarajaService } from "./daraja.service";
import { WithdrawalStatus, CommissionStatus } from "@prisma/client";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totals?: Record<string, number>;
  };
}

export class WithdrawalService {
  static async getAllWithdrawals(params: {
    page?: number;
    limit?: number;
    status?: string;
    agentId?: string;
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.agentId) where.agentId = params.agentId;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    const [pendingTotal, approvedTotal, paidTotal, rejectedTotal] = await Promise.all([
      prisma.withdrawal.aggregate({
        where: { status: WithdrawalStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { status: WithdrawalStatus.APPROVED },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { status: WithdrawalStatus.SUCCESS },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { status: WithdrawalStatus.REJECTED },
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

  static async getWithdrawalById(withdrawalId: string): Promise<any> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: {
        agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
      },
    });

    if (!withdrawal) {
      throw new APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
    }

    return withdrawal;
  }

  static async approveWithdrawal(withdrawalId: string, adminUserId: string): Promise<any> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) {
      throw new APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new APIError(`Withdrawal is in ${withdrawal.status} status and cannot be approved`, 400, "INVALID_STATUS");
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: WithdrawalStatus.APPROVED,
        paidAt: new Date(),
      },
    });

    await AuditLogService.log(
      "WITHDRAWAL_APPROVED",
      adminUserId,
      "Withdrawal",
      withdrawalId,
      `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} approved`,
    );

    await NotificationService.createNotification({
      userId: withdrawal.agentId,
      type: "SYSTEM",
      title: "Withdrawal Approved",
      message: `Your withdrawal request of KSh ${withdrawal.amount} has been approved and is being processed.`,
      data: { withdrawalId, amount: withdrawal.amount },
    });

    return updated;
  }

  static async rejectWithdrawal(withdrawalId: string, adminUserId: string, reason: string): Promise<any> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) {
      throw new APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new APIError(`Withdrawal is in ${withdrawal.status} status and cannot be rejected`, 400, "INVALID_STATUS");
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: WithdrawalStatus.REJECTED },
    });

    await AuditLogService.log(
      "WITHDRAWAL_REJECTED",
      adminUserId,
      "Withdrawal",
      withdrawalId,
      `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} rejected. Reason: ${reason}`,
      { reason },
    );

    await NotificationService.createNotification({
      userId: withdrawal.agentId,
      type: "SYSTEM",
      title: "Withdrawal Rejected",
      message: `Your withdrawal request of KSh ${withdrawal.amount} has been rejected. Reason: ${reason}`,
      data: { withdrawalId, amount: withdrawal.amount, reason },
    });

    return updated;
  }

  static async processWithdrawalB2C(withdrawalId: string, adminUserId: string): Promise<any> {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { agent: true },
    });

    if (!withdrawal) {
      throw new APIError("Withdrawal not found", 404, "WITHDRAWAL_NOT_FOUND");
    }

    if (!env.darajaConsumerKey || !env.darajaConsumerSecret) {
      return {
        withdrawal,
        message: "Daraja is not configured. Cannot process B2C payment.",
        configured: false,
      };
    }

    if (withdrawal.status !== WithdrawalStatus.APPROVED) {
      throw new APIError("Withdrawal must be approved before processing", 400, "INVALID_STATUS");
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: WithdrawalStatus.PROCESSING },
    });

    try {
      const b2cResponse = await DarajaService.initiateB2C(
        withdrawal.phone || withdrawal.agent.phoneNumber || "",
        withdrawal.amount,
        `ACL-WITHDRAWAL-${withdrawal.id.slice(0, 8)}`,
      );

      await AuditLogService.log(
        "B2C_PAYOUT_INITIATED",
        adminUserId,
        "Withdrawal",
        withdrawalId,
        `B2C payout initiated for KSh ${withdrawal.amount} to agent ${withdrawal.agentId}`,
        { b2cResponse },
      );

      return { withdrawal, b2cResponse };
    } catch (error: any) {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: WithdrawalStatus.FAILED },
      });

      throw new APIError("B2C payout failed. Contact support.", 500, "B2C_FAILED");
    }
  }

  static async getAgentWithdrawalStats(agentId: string): Promise<any> {
    const [eligibleCommission] = await Promise.all([
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
    ]);

    return {
      availableBalance: eligibleCommission._sum.amount || 0,
    };
  }
}
