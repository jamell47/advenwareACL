import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { CommissionService } from "../services/commission.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";

export class CommissionController {
  static async getAllCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CommissionService.getAllCommissions({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        status: req.query.status as string | undefined,
        agentId: req.query.agentId as string | undefined,
      });
      res.status(200).json({ success: true, message: "Commissions retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getCommissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const commission = await CommissionService.getCommissionById(req.params.id);
      res.status(200).json({ success: true, message: "Commission retrieved", data: commission });
    } catch (error) {
      next(error);
    }
  }

  static async approveCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const commission = await CommissionService.updateCommissionStatus(
        req.params.id,
        "PAID",
        req.body.paymentRef,
      );
      await AuditLogService.log(
        "COMMISSION_APPROVED",
        req.user!.id,
        "Commission",
        req.params.id,
        `Commission ${req.params.id} approved to PAID by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Commission approved", data: commission });
    } catch (error) {
      next(error);
    }
  }

  static async markEligible(req: Request, res: Response, next: NextFunction) {
    try {
      const commission = await CommissionService.updateCommissionStatus(req.params.id, "ELIGIBLE");
      await AuditLogService.log(
        "COMMISSION_ELIGIBILITY_MARKED",
        req.user!.id,
        "Commission",
        req.params.id,
        `Commission ${req.params.id} marked as ELIGIBLE by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Commission marked eligible", data: commission });
    } catch (error) {
      next(error);
    }
  }
}
