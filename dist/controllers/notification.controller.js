"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    static async getMyNotifications(req, res, next) {
        try {
            const { isRead, page, limit } = req.query;
            const result = await notification_service_1.NotificationService.getMyNotifications(req.user.id, {
                isRead: isRead !== undefined ? isRead === "true" : undefined,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.status(200).json({
                success: true,
                message: "Notifications retrieved successfully",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getUnreadCount(req, res, next) {
        try {
            const count = await notification_service_1.NotificationService.getUnreadCount(req.user.id);
            res.status(200).json({
                success: true,
                message: "Unread count retrieved successfully",
                data: { count },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const notification = await notification_service_1.NotificationService.markAsRead(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            await notification_service_1.NotificationService.markAllAsRead(req.user.id);
            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteNotification(req, res, next) {
        try {
            await notification_service_1.NotificationService.deleteNotification(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Notification deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map