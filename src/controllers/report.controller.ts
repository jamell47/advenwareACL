import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service";

export class ReportController {
  static async studentRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getStudentRegistrationsReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Student registrations report", data });
    } catch (error) {
      next(error);
    }
  }

  static async agentPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getAgentPerformanceReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Agent performance report", data });
    } catch (error) {
      next(error);
    }
  }

  static async placements(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getPlacementReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Placements report", data });
    } catch (error) {
      next(error);
    }
  }

  static async payments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getPaymentReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Payments report", data });
    } catch (error) {
      next(error);
    }
  }

  static async commissions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getCommissionReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Commissions report", data });
    } catch (error) {
      next(error);
    }
  }

  static async withdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getWithdrawalReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Withdrawals report", data });
    } catch (error) {
      next(error);
    }
  }

  static async documents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getDocumentReport({
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Documents report", data });
    } catch (error) {
      next(error);
    }
  }
}
