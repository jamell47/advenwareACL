import { Request, Response, NextFunction } from "express";
export declare class MessagingController {
    static getConversations(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createConversation(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
    static sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    static markMessagesAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=messaging.controller.d.ts.map