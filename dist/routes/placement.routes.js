"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placement_controller_1 = require("../controllers/placement.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
router.get("/me", auth_1.authenticate, placement_controller_1.PlacementController.getMyPlacement);
/**
 * @swagger
 * /placements/all:
 *   get:
 *     summary: Get all placements for the student
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/all", auth_1.authenticate, placement_controller_1.PlacementController.getAllPlacements);
/**
 * @swagger
 * /placements/{id}/confirm:
 *   post:
 *     summary: Confirm a placement (triggers payment creation)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/confirm", auth_1.authenticate, placement_controller_1.PlacementController.confirmPlacement);
exports.default = router;
//# sourceMappingURL=placement.routes.js.map