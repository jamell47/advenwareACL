import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuditLogService } from "../services/auditLog.service";
import { env } from "../config/env";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      await AuditLogService.log(
        "USER_REGISTERED",
        result.user.id,
        "User",
        result.user.id,
        `User ${result.user.email} registered`,
        undefined,
        req.ip,
        req.get("user-agent"),
      );

      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email for verification.",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
          },
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
      const result = await AuthService.login(req.body);

      await AuditLogService.log(
        "USER_LOGIN",
        result.user.id,
        "User",
        result.user.id,
        `User ${result.user.email} logged in`,
        undefined,
        req.ip,
        req.get("user-agent"),
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
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
      const result = await AuthService.refreshToken(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.body.refreshToken);

      await AuditLogService.log(
        "USER_LOGOUT",
        req.user?.id,
        "User",
        req.user?.id,
        "User logged out",
        undefined,
        req.ip,
        req.get("user-agent"),
      );

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body.email);

      res.status(200).json({
        success: true,
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body.token, req.body.newPassword);

      res.status(200).json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        user: {
          id: req.user!.id,
          email: req.user!.email,
          role: req.user!.role,
        },
      },
    });
  }
}
