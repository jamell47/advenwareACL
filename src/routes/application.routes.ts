import { Router } from "express";
import { ApplicationController } from "../controllers/application.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { CreateApplicationSchema, UpdateApplicationSchema } from "../schemas/student.schema";
import { APIError } from "../middleware/errorHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Attachment application management
 */

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get the authenticated student's attachment application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, ApplicationController.getMyApplication);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create or update attachment application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticate, validate(CreateApplicationSchema), ApplicationController.createApplication);

/**
 * @swagger
 * /applications/{id}:
 *   patch:
 *     summary: Update an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:id", authenticate, validate(UpdateApplicationSchema), ApplicationController.updateApplication);

/**
 * @swagger
 * /applications/admin:
 *   get:
 *     summary: Get all applications (admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, ApplicationController.getAdminApplications);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a specific application by ID (admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, ApplicationController.getAdminApplicationById);

export default router;
