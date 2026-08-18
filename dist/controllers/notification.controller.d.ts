import { Request, Response, NextFunction } from "express";
export declare class NotificationController {
    static getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=notification.controller.d.ts.map