import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { OrganizationService } from "../services/organization.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";

export class OrganizationController {
  static async getOrganizations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganizationService.getOrganizations({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      });
      res.status(200).json({ success: true, message: "Organizations retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getOrganizationById(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrganizationService.getOrganizationById(req.params.id);
      res.status(200).json({ success: true, message: "Organization retrieved", data: org });
    } catch (error) {
      next(error);
    }
  }

  static async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrganizationService.createOrganization(req.body);
      await AuditLogService.log(
        "ORGANIZATION_CREATED",
        req.user!.id,
        "Organization",
        org.id,
        `Organization ${org.name} created by ${req.user!.email}`,
      );
      res.status(201).json({ success: true, message: "Organization created", data: org });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrganizationService.updateOrganization(req.params.id, req.body);
      await AuditLogService.log(
        "ORGANIZATION_UPDATED",
        req.user!.id,
        "Organization",
        req.params.id,
        `Organization ${org.name} updated by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Organization updated", data: org });
    } catch (error) {
      next(error);
    }
  }

  static async suspendOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrganizationService.suspendOrganization(req.params.id);
      await AuditLogService.log(
        "ORGANIZATION_SUSPENDED",
        req.user!.id,
        "Organization",
        req.params.id,
        `Organization ${org.name} suspended by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Organization suspended", data: org });
    } catch (error) {
      next(error);
    }
  }

  static async activateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await OrganizationService.activateOrganization(req.params.id);
      await AuditLogService.log(
        "ORGANIZATION_ACTIVATED",
        req.user!.id,
        "Organization",
        req.params.id,
        `Organization ${org.name} activated by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Organization activated", data: org });
    } catch (error) {
      next(error);
    }
  }
}
