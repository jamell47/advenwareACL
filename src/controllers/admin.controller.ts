import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AdminService } from "../services/admin.service";
import { AuditLogService } from "../services/auditLog.service";
import { SystemSettingService } from "../services/systemSetting.service";
import { BcryptUtil } from "../utils/bcrypt.util";
import { ROLE_PERMISSIONS } from "../utils/permissions";

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({ success: true, message: "Dashboard stats retrieved", data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getStudents({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        institution: req.query.institution as string | undefined,
        course: req.query.course as string | undefined,
        agentId: req.query.agentId as string | undefined,
      });
      res.status(200).json({ success: true, message: "Students retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await AdminService.getStudentById(req.params.id);
      res.status(200).json({ success: true, message: "Student retrieved", data: student });
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await AdminService.updateStudent(req.params.id, req.body);
      await AuditLogService.log(
        "STUDENT_EDITED",
        req.user!.id,
        "User",
        req.params.id,
        `Student ${req.params.id} updated by admin ${req.user!.id}`,
      );
      res.status(200).json({ success: true, message: "Student updated", data: student });
    } catch (error) {
      next(error);
    }
  }

  static async suspendStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.suspendStudent(req.params.id);
      res.status(200).json({ success: true, message: "Student suspended", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async activateStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.activateStudent(req.params.id);
      res.status(200).json({ success: true, message: "Student activated", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAdmins({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      });
      res.status(200).json({ success: true, message: "Admins retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const passwordHash = await BcryptUtil.hashPassword(req.body.password);
      const admin = await prisma.user.create({
        data: {
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          passwordHash,
          role: req.body.role,
          status: "ACTIVE",
          isActive: true,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true, createdAt: true },
      });

      await AuditLogService.log(
        "ADMIN_CREATED",
        req.user!.id,
        "User",
        admin.id,
        `Admin ${admin.email} created by ${req.user!.email}`,
      );

      res.status(201).json({ success: true, message: "Admin created", data: admin });
    } catch (error) {
      next(error);
    }
  }

  static async updateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          role: req.body.role,
          status: req.body.status,
          isActive: req.body.isActive,
        },
      });

      await AuditLogService.log(
        "ADMIN_EDITED",
        req.user!.id,
        "User",
        req.params.id,
        `Admin ${admin.email} updated by ${req.user!.email}`,
      );

      res.status(200).json({ success: true, message: "Admin updated", data: admin });
    } catch (error) {
      next(error);
    }
  }

  static async disableAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false, status: "SUSPENDED" },
      });

      await AuditLogService.log(
        "ADMIN_DISABLED",
        req.user!.id,
        "User",
        req.params.id,
        `Admin ${admin.email} disabled by ${req.user!.email}`,
      );

      res.status(200).json({ success: true, message: "Admin disabled", data: { id: admin.id, isActive: admin.isActive } });
    } catch (error) {
      next(error);
    }
  }

  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await AdminService.getRoles();
      const permissions = ROLE_PERMISSIONS;
      res.status(200).json({ success: true, message: "Roles and permissions retrieved", data: { roles, permissions } });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAuditLogs({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        action: req.query.action as string | undefined,
        entityType: req.query.entityType as string | undefined,
        userId: req.query.userId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      });
      res.status(200).json({ success: true, message: "Audit logs retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SystemSettingService.getSettings();
      res.status(200).json({ success: true, message: "System settings retrieved", data: settings });
    } catch (error) {
      next(error);
    }
  }

  static async updateSystemSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const setting = await SystemSettingService.updateSetting(req.params.key, req.body.value, req.user!.id);
      res.status(200).json({ success: true, message: "Setting updated", data: setting });
    } catch (error) {
      next(error);
    }
  }
}
