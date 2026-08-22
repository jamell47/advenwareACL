import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { MessagingController } from "../controllers/messaging.controller";
import { validate } from "../middleware/validation";
import { CreateConversationSchema, SendMessageSchema } from "../schemas/messaging.schema";
import { APIError } from "../middleware/errorHandler";
import { z } from "zod";

const router = Router();

const CreateAgentConversationSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  subject: z.string().max(200).optional(),
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
router.get("/conversations", authenticate, MessagingController.getConversations);

/**
 * @swagger
 * /messaging/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.post("/conversations", authenticate, validate(CreateConversationSchema), MessagingController.createConversation);

/**
 * @swagger
 * /messaging/conversations/{id}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/conversations/:id", authenticate, MessagingController.getConversationMessages);

/**
 * @swagger
 * /messaging/conversations/{id}/messages:
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
 * /messaging/conversations/{id}/read:
 *   patch:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/conversations/:id/read", authenticate, MessagingController.markMessagesAsRead);

/**
 * @swagger
 * /messaging/agent/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated agent
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 */
router.get("/agent/conversations", authenticate, (req, res, next) => {
  if (req.user!.role !== "AGENT") {
    return next(new APIError("Agent access required", 403, "FORBIDDEN"));
  }
  next();
}, MessagingController.getConversations);

router.post("/agent/conversations", authenticate, (req, res, next) => {
  if (req.user!.role !== "AGENT") {
    return next(new APIError("Agent access required", 403, "FORBIDDEN"));
  }
  next();
}, validate(CreateAgentConversationSchema), MessagingController.createAgentConversation);

export default router;
