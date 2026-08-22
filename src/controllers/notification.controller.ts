import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { isRead, page, limit } = req.query || {};

      const result = await NotificationService.getMyNotifications(req.user!.id, {
        isRead: isRead !== undefined ? isRead === "true" : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);

      res.status(200).json({
        success: true,
        message: "Unread count retrieved successfully",
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.deleteNotification(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
