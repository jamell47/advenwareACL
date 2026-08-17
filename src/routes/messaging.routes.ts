import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { MessagingController } from "../controllers/messaging.controller";
import { validate } from "../middleware/validation";
import { CreateConversationSchema, SendMessageSchema } from "../schemas/messaging.schema";

const router = Router();

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
router.get("/conversations", authenticate, MessagingController.getConversations);

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations", authenticate, validate(CreateConversationSchema), MessagingController.createConversation);

/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations/:id", authenticate, MessagingController.getConversationMessages);

/**
 * @swagger
 * /conversations/{id}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/conversations/:id/messages",
  authenticate,
  validate(SendMessageSchema),
  MessagingController.sendMessage,
);

/**
 * @swagger
 * /conversations/{id}/read:
 *   patch:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/conversations/:id/read", authenticate, MessagingController.markMessagesAsRead);

export default router;
