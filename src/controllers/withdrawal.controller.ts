import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { WithdrawalService } from "../services/withdrawal.service";
import { AuditLogService } from "../services/auditLog.service";
import { APIError } from "../middleware/errorHandler";

export class WithdrawalController {
  static async getAllWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WithdrawalService.getAllWithdrawals({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        status: req.query.status as string | undefined,
        agentId: req.query.agentId as string | undefined,
      });
      res.status(200).json({ success: true, message: "Withdrawals retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getWithdrawalById(req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawal = await WithdrawalService.getWithdrawalById(req.params.id);
      res.status(200).json({ success: true, message: "Withdrawal retrieved", data: withdrawal });
    } catch (error) {
      next(error);
    }
  }

  static async approveWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawal = await WithdrawalService.approveWithdrawal(req.params.id, req.user!.id);
      await AuditLogService.log(
        "WITHDRAWAL_APPROVED",
        req.user!.id,
        "Withdrawal",
        req.params.id,
        `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} approved`,
      );
      res.status(200).json({ success: true, message: "Withdrawal approved", data: withdrawal });
    } catch (error) {
      next(error);
    }
  }

  static async rejectWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      if (!reason) {
        throw new APIError("Rejection reason is required", 400, "REASON_REQUIRED");
      }
      const withdrawal = await WithdrawalService.rejectWithdrawal(req.params.id, req.user!.id, reason);
      await AuditLogService.log(
        "WITHDRAWAL_REJECTED",
        req.user!.id,
        "Withdrawal",
        req.params.id,
        `Withdrawal of KSh ${withdrawal.amount} rejected. Reason: ${reason}`,
      );
      res.status(200).json({ success: true, message: "Withdrawal rejected", data: withdrawal });
    } catch (error) {
      next(error);
    }
  }

  static async processB2C(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WithdrawalService.processWithdrawalB2C(req.params.id, req.user!.id);
      await AuditLogService.log(
        "B2C_PAYOUT_PROCESSED",
        req.user!.id,
        "Withdrawal",
        req.params.id,
        `B2C payout processed for withdrawal ${req.params.id}`,
      );
      res.status(200).json({ success: true, message: "B2C payout processed", data: result });
    } catch (error) {
      next(error);
    }
  }
}
