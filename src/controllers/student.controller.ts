import { Request, Response, NextFunction } from "express";
import { StudentService } from "../services/student.service";

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
}
