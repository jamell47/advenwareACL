export declare class NotificationService {
    static createNotification(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
    }): Promise<any>;
    static getMyNotifications(userId: string, params: {
        isRead?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        meta: any;
    }>;
    static getUnreadCount(userId: string): Promise<number>;
    static markAsRead(userId: string, notificationId: string): Promise<any>;
    static markAllAsRead(userId: string): Promise<void>;
    static deleteNotification(userId: string, notificationId: string): Promise<void>;
}
//# sourceMappingURL=notification.service.d.ts.map