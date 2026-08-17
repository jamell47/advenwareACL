import { Router } from "express";
import { SupportController } from "../controllers/support.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support configuration and information
 */

/**
 * @swagger
 * /support:
 *   get:
 *     summary: Get support information (public)
 *     tags: [Support]
 */
router.get("/", SupportController.getSupportInfo);

/**
 * @swagger
 * /support/config:
 *   put:
 *     summary: Update support configuration (admin only)
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/config",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  SupportController.updateSupportConfig,
);

export default router;
