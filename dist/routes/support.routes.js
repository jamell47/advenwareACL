"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_controller_1 = require("../controllers/support.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
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
router.get("/", support_controller_1.SupportController.getSupportInfo);
/**
 * @swagger
 * /support/config:
 *   put:
 *     summary: Update support configuration (admin only)
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 */
router.put("/config", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "SUPER_ADMIN"), support_controller_1.SupportController.updateSupportConfig);
exports.default = router;
//# sourceMappingURL=support.routes.js.map