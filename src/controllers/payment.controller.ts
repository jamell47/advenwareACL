import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { PaymentService } from "../services/payment.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";
import { APIError } from "../middleware/errorHandler";
import { sanitizeQueryParams } from "../utils/query.util";

export class PaymentController {
  static async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.getMyPayments(req.user!.id);

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getPaymentById(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const skip = (page - 1) * limit;

      const cleanParams = sanitizeQueryParams(req.query);

      const where: any = {};
      if (cleanParams.status) where.status = cleanParams.status;
      if (cleanParams.search) {
        where.OR = [
          { user: { firstName: { contains: cleanParams.search as string, mode: "insensitive" } } },
          { user: { lastName: { contains: cleanParams.search as string, mode: "insensitive" } } },
          { user: { email: { contains: cleanParams.search as string, mode: "insensitive" } } },
          { mpesaReceiptNumber: { contains: cleanParams.search as string, mode: "insensitive" } },
          { transactionId: { contains: cleanParams.search as string, mode: "insensitive" } },
        ];
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                studentProfile: {
                  select: {
                    institution: true,
                    course: true,
                  },
                },
              },
            },
            placement: true,
          },
        }),
        prisma.payment.count({ where }),
      ]);

      const formatted = payments.map((p) => ({
        id: p.id,
        userId: p.userId,
        placementId: p.placementId,
        amount: p.amount,
        currency: p.currency,
        method: p.method,
        status: p.status,
        mpesaPhoneNumber: p.mpesaPhoneNumber,
        mpesaReceiptNumber: p.mpesaReceiptNumber,
        transactionId: p.transactionId,
        checkoutRequestId: p.checkoutRequestId,
        confirmedAt: p.confirmedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        placement: p.placement
          ? {
              id: p.placement.id,
              organizationName: p.placement.organizationName,
              positionTitle: p.placement.positionTitle,
              location: p.placement.location,
              startDate: p.placement.startDate,
              endDate: p.placement.endDate,
              status: p.placement.status,
            }
          : null,
        user: p.user
          ? {
              id: p.user.id,
              firstName: p.user.firstName,
              lastName: p.user.lastName,
              email: p.user.email,
              phoneNumber: p.user.phoneNumber,
              institution: p.user.studentProfile?.institution,
              course: p.user.studentProfile?.course,
            }
          : null,
      }));

      res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: formatted,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
        include: {
          user: { include: { studentProfile: true } },
          placement: true,
        },
      });

      if (!payment) {
        return next(new APIError("Payment not found", 404, "NOT_FOUND"));
      }

      res.status(200).json({
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
      });

      if (!payment) {
        return next(new APIError("Payment not found", 404, "NOT_FOUND"));
      }

      res.status(200).json({
        success: true,
        message: "Payment verification status retrieved",
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async initiateSTKPush(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.initiateSTKPush(
        req.user!.id,
        req.body.phoneNumber,
      );

      res.status(200).json({
        success: true,
        message: "STK push initiated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      await PaymentService.handleCallback(req.body);

      res.status(200).json({
        success: true,
        message: "Callback processed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
