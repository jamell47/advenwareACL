"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../config/prisma");
class NotificationService {
    static async createNotification(data) {
        const notification = await prisma_1.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data,
            },
        });
        return notification;
    }
    static async getMyNotifications(userId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (params.isRead !== undefined) {
            where.isRead = params.isRead;
        }
        const [notifications, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.notification.count({ where }),
        ]);
        const unreadCount = await prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    static async getUnreadCount(userId) {
        return prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    static async markAsRead(userId, notificationId) {
        const notification = await prisma_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        return prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    static async markAllAsRead(userId) {
        await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    static async deleteNotification(userId, notificationId) {
        const notification = await prisma_1.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error("Notification not found");
        }
        await prisma_1.prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map