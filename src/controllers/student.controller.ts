import { Request, Response, NextFunction } from "express";
import { StudentService } from "../services/student.service";
import { APIError } from "../middleware/errorHandler";

export class StudentController {
  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await StudentService.getMyProfile(req.user!.id);
      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await StudentService.updateMyProfile(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return next(new APIError("No file provided", 400, "NO_FILE"));
      }

      const profile = await StudentService.uploadProfileImage(req.user!.id, file);
      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}
