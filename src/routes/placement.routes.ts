import { Router } from "express";
import { PlacementController } from "../controllers/placement.controller";
import { authenticate } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Placements
 *   description: Placement management
 */

/**
 * @swagger
 * /placements/me:
 *   get:
 *     summary: Get the authenticated student's placement
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, PlacementController.getMyPlacement);

/**
 * @swagger
 * /placements/all:
 *   get:
 *     summary: Get all placements for the student
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", authenticate, PlacementController.getAllPlacements);

/**
 * @swagger
 * /placements/{id}/confirm:
 *   post:
 *     summary: Confirm a placement (triggers payment creation)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/confirm", authenticate, PlacementController.confirmPlacement);

/**
 * @swagger
 * /placements/admin:
 *   get:
 *     summary: Get all placements (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PlacementController.getAdminPlacements);

/**
 * @swagger
 * /placements/admin/{id}:
 *   get:
 *     summary: Get placement by ID (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin/:id", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PlacementController.getAdminPlacementById);

/**
 * @swagger
 * /placements/admin:
 *   post:
 *     summary: Create placement (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admin", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PlacementController.createPlacement);

/**
 * @swagger
 * /placements/admin/{id}:
 *   patch:
 *     summary: Update placement (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/admin/:id", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PlacementController.updatePlacement);

export default router;
