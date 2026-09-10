"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messaging_controller_1 = require("../controllers/messaging.controller");
const validation_1 = require("../middleware/validation");
const messaging_schema_1 = require("../schemas/messaging.schema");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const CreateAgentConversationSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1, "Student ID is required"),
    subject: zod_1.z.string().max(200).optional(),
});
/**
 * @swagger
 * tags:
 *   name: Messaging
 *   description: Messaging and conversations
 */
/**
 * @swagger
 * /messaging/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated student
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations", auth_1.authenticate, messaging_controller_1.MessagingController.getConversations);
/**
 * @swagger
 * /messaging/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations", auth_1.authenticate, (0, validation_1.validate)(messaging_schema_1.CreateConversationSchema), messaging_controller_1.MessagingController.createConversation);
/**
 * @swagger
 * /messaging/conversations/{id}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations/:id", auth_1.authenticate, messaging_controller_1.MessagingController.getConversationMessages);
/**
 * @swagger
 * /messaging/conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations/:id/messages", auth_1.authenticate, (0, validation_1.validate)(messaging_schema_1.SendMessageSchema), messaging_controller_1.MessagingController.sendMessage);
/**
 * @swagger
 * /messaging/conversations/{id}/read:
 *   patch:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/conversations/:id/read", auth_1.authenticate, messaging_controller_1.MessagingController.markMessagesAsRead);
/**
 * @swagger
 * /messaging/agent/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated agent
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/agent/conversations", auth_1.authenticate, (req, res, next) => {
    if (req.user.role !== "AGENT") {
        return next(new errorHandler_1.APIError("Agent access required", 403, "FORBIDDEN"));
    }
    next();
}, messaging_controller_1.MessagingController.getConversations);
router.post("/agent/conversations", auth_1.authenticate, (req, res, next) => {
    if (req.user.role !== "AGENT") {
        return next(new errorHandler_1.APIError("Agent access required", 403, "FORBIDDEN"));
    }
    next();
}, (0, validation_1.validate)(CreateAgentConversationSchema), messaging_controller_1.MessagingController.createAgentConversation);
exports.default = router;
//# sourceMappingURL=messaging.routes.js.map