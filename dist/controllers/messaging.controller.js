"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingController = void 0;
const messaging_service_1 = require("../services/messaging.service");
class MessagingController {
    static async getConversations(req, res, next) {
        try {
            const conversations = await messaging_service_1.MessagingService.getConversations(req.user.id);
            res.status(200).json({
                success: true,
                message: "Conversations retrieved successfully",
                data: conversations,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createConversation(req, res, next) {
        try {
            const conversation = await messaging_service_1.MessagingService.createConversation(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: "Conversation created successfully",
                data: conversation,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getConversationMessages(req, res, next) {
        try {
            const result = await messaging_service_1.MessagingService.getConversationMessages(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Messages retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendMessage(req, res, next) {
        try {
            const message = await messaging_service_1.MessagingService.sendMessage(req.user.id, req.params.id, req.body);
            res.status(201).json({
                success: true,
                message: "Message sent successfully",
                data: message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markMessagesAsRead(req, res, next) {
        try {
            await messaging_service_1.MessagingService.markMessagesAsRead(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Messages marked as read",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessagingController = MessagingController;
//# sourceMappingURL=messaging.controller.js.map