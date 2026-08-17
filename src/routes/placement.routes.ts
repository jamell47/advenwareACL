import { Router } from "express";
import { PlacementController } from "../controllers/placement.controller";
import { authenticate } from "../middleware/auth";

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

export default router;
