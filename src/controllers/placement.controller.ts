import { Request, Response, NextFunction } from "express";
import { PlacementService } from "../services/placement.service";
import { AuditLogService } from "../services/auditLog.service";

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
}
