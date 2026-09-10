"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const placement_controller_1 = require("../controllers/placement.controller");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
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
/**
 * @swagger
 * /placements/admin:
 *   get:
 *     summary: Get all placements (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, placement_controller_1.PlacementController.getAdminPlacements);
/**
 * @swagger
 * /placements/admin/{id}:
 *   get:
 *     summary: Get placement by ID (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin/:id", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, placement_controller_1.PlacementController.getAdminPlacementById);
/**
 * @swagger
 * /placements/admin:
 *   post:
 *     summary: Create placement (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admin", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, placement_controller_1.PlacementController.createPlacement);
/**
 * @swagger
 * /placements/admin/{id}:
 *   patch:
 *     summary: Update placement (admin)
 *     tags: [Placements]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/admin/:id", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, placement_controller_1.PlacementController.updatePlacement);
exports.default = router;
//# sourceMappingURL=placement.routes.js.map