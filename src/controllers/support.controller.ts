import { Request, Response, NextFunction } from "express";
import { SupportService } from "../services/support.service";
import { env } from "../config/env";

export class SupportController {
  static async getSupportInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const info = await SupportService.getSupportInfo();

      res.status(200).json({
        success: true,
        message: "Support information retrieved successfully",
        data: info,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSupportConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await SupportService.updateSupportConfig(req.body);

      res.status(200).json({
        success: true,
        message: "Support configuration updated successfully",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }
}
