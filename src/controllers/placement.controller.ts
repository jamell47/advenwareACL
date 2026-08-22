import { Request, Response, NextFunction } from "express";
import { PlacementService } from "../services/placement.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";
import { APIError } from "../middleware/errorHandler";
import { sanitizeQueryParams } from "../utils/query.util";

export class PlacementController {
  static async getMyPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = await PlacementService.getMyPlacement(req.user!.id);

      res.status(200).json({
        success: true,
        message: "Placement retrieved successfully",
        data: placement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPlacements(req: Request, res: Response, next: NextFunction) {
    try {
      const placements = await PlacementService.getAllPlacements(req.user!.id);

      res.status(200).json({
        success: true,
        message: "Placements retrieved successfully",
        data: placements,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = await PlacementService.confirmPlacement(req.user!.id, req.params.id);

      await AuditLogService.log(
        "PLACEMENT_CONFIRMED",
        req.user!.id,
        "Placement",
        req.params.id,
        "Placement confirmed by student",
      );

      res.status(200).json({
        success: true,
        message: "Placement confirmed successfully",
        data: placement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminPlacements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const cleanParams = sanitizeQueryParams(req.query);
      const status = cleanParams.status as string | undefined;
      const search = cleanParams.search as string | undefined;

      const result = await PlacementService.getAdminPlacements({ page, limit, status, search });

      res.status(200).json({
        success: true,
        message: "Placements retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminPlacementById(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = await PlacementService.getAdminPlacementById(req.params.id);

      if (!placement) {
        return next(new APIError("Placement not found", 404, "NOT_FOUND"));
      }

      res.status(200).json({
        success: true,
        message: "Placement retrieved successfully",
        data: placement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = await PlacementService.adminCreatePlacement(req.body);

      await AuditLogService.log(
        "PLACEMENT_CREATED",
        req.user!.id,
        "Placement",
        placement.id,
        `Placement created for student ${req.body.userId}`,
      );

      res.status(201).json({
        success: true,
        message: "Placement created successfully",
        data: placement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const placement = await PlacementService.adminUpdatePlacement(req.params.id, req.body);

      await AuditLogService.log(
        "PLACEMENT_UPDATED",
        req.user!.id,
        "Placement",
        req.params.id,
        `Placement updated`,
      );

      res.status(200).json({
        success: true,
        message: "Placement updated successfully",
        data: placement,
      });
    } catch (error) {
      next(error);
    }
  }
}
