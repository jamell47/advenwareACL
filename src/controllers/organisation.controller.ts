import { Request, Response, NextFunction } from "express";
import { OrganisationService } from "../services/organisation.service";
import { AuditLogService } from "../services/auditLog.service";
import { APIError } from "../middleware/errorHandler";
import { AuthenticatedOrganisationRequest } from "../middleware/organisationAuth";

export class OrganisationController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganisationService.register(req.body);

      await AuditLogService.log(
        "ORGANISATION_REGISTERED",
        undefined,
        "Organisation",
        result.organisation.id,
        `Organisation ${result.organisation.phone ?? result.organisation.email ?? "organisation"} registered via API`,
        undefined,
        req.ip,
        req.get("user-agent"),
      );

      res.status(201).json({
        success: true,
        message: "Organisation registered successfully",
        data: {
          organisation: result.organisation,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganisationService.login(req.body);

      await AuditLogService.log(
        "ORGANISATION_LOGIN",
        undefined,
        "Organisation",
        result.organisation.id,
        `Organisation ${result.organisation.phone ?? result.organisation.email ?? "organisation"} logged in via API`,
        undefined,
        req.ip,
        req.get("user-agent"),
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          organisation: result.organisation,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OrganisationService.refresh(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
          organisation: result.organisation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await OrganisationService.logout(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const organisation = await OrganisationService.getMe(req.organisation!.id);

      res.status(200).json({
        success: true,
        message: "Organisation profile retrieved successfully",
        data: { organisation },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const organisation = await OrganisationService.updateMe(req.organisation!.id, req.body);

      res.status(200).json({
        success: true,
        message: "Organisation profile updated successfully",
        data: { organisation },
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfileImage(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return next(new APIError("No file provided", 400, "NO_FILE"));
      }

      const organisation = await OrganisationService.uploadProfileImage(req.organisation!.id, file);

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: { organisation },
      });
    } catch (error) {
      next(error);
    }
  }
}
