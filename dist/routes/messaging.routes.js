"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messaging_controller_1 = require("../controllers/messaging.controller");
const validation_1 = require("../middleware/validation");
const messaging_schema_1 = require("../schemas/messaging.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Messaging
 *   description: Messaging and conversations
 */
/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get all conversations for the authenticated student
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations", auth_1.authenticate, messaging_controller_1.MessagingController.getConversations);
/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations", auth_1.authenticate, (0, validation_1.validate)(messaging_schema_1.CreateConversationSchema), messaging_controller_1.MessagingController.createConversation);
/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations/:id", auth_1.authenticate, messaging_controller_1.MessagingController.getConversationMessages);
/**
 * @swagger
 * /conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations/:id/messages", auth_1.authenticate, (0, validation_1.validate)(messaging_schema_1.SendMessageSchema), messaging_controller_1.MessagingController.sendMessage);
/**
 * @swagger
 * /conversations/{id}/read:
 *   patch:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/conversations/:id/read", auth_1.authenticate, messaging_controller_1.MessagingController.markMessagesAsRead);
exports.default = router;
//# sourceMappingURL=messaging.routes.js.map