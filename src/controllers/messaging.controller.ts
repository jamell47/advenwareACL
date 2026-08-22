import { Request, Response, NextFunction } from "express";
import { MessagingService } from "../services/messaging.service";
import { NotificationService } from "../services/notification.service";

export class MessagingController {
  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await MessagingService.getConversations(req.user!.id);

      res.status(200).json({
        success: true,
        message: "Conversations retrieved successfully",
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await MessagingService.createConversation(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getConversationMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MessagingService.getConversationMessages(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await MessagingService.sendMessage(req.user!.id, req.params.id, req.body);

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markMessagesAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await MessagingService.markMessagesAsRead(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAgentConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await MessagingService.createAgentConversation(
        req.user!.id,
        req.body.studentId,
        req.body.subject,
      );

      res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }
}
