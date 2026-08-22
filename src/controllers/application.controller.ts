import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ApplicationService } from "../services/application.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";
import { APIError } from "../middleware/errorHandler";
import { sanitizeQueryParams } from "../utils/query.util";

export class ApplicationController {
  static async getMyApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.getMyApplication(req.user!.id);

      if (!application || !("exists" in application)) {
        return res.status(200).json({
          success: true,
          message: "Application retrieved successfully",
          data: application,
        });
      }

      if (application.exists === false) {
        return res.status(200).json({
          success: true,
          message: "No application found",
          data: { exists: false },
        });
      }

      res.status(200).json({
        success: true,
        message: "Application retrieved successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.createApplication(req.user!.id, req.body);

      await AuditLogService.log(
        "APPLICATION_CREATED",
        req.user!.id,
        "AttachmentApplication",
        application.id,
        "Application created/updated",
      );

      res.status(201).json({
        success: true,
        message: "Application created successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.updateApplication(
        req.user!.id,
        req.params.id,
        req.body,
      );

      await AuditLogService.log(
        "APPLICATION_UPDATED",
        req.user!.id,
        "AttachmentApplication",
        req.params.id,
        "Application updated",
      );

      res.status(200).json({
        success: true,
        message: "Application updated successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminApplications(req: Request, res: Response, next: NextFunction) {
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
        ];
      }

      const [applications, total] = await Promise.all([
        prisma.attachmentApplication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              include: { studentProfile: true },
            },
            placement: true,
          },
        }),
        prisma.attachmentApplication.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        message: "Applications retrieved successfully",
        data: applications,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await prisma.attachmentApplication.findUnique({
        where: { id: req.params.id },
        include: {
          user: { include: { studentProfile: true } },
          placement: { include: { payment: true } },
        },
      });

      if (!application) {
        return next(new APIError("Application not found", 404, "NOT_FOUND"));
      }

      res.status(200).json({
        success: true,
        message: "Application retrieved successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
}
