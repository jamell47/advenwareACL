"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const application_controller_1 = require("../controllers/application.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const student_schema_1 = require("../schemas/student.schema");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
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
router.get("/me", auth_1.authenticate, application_controller_1.ApplicationController.getMyApplication);
/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Create or update attachment application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", auth_1.authenticate, (0, validation_1.validate)(student_schema_1.CreateApplicationSchema), application_controller_1.ApplicationController.createApplication);
/**
 * @swagger
 * /applications/{id}:
 *   patch:
 *     summary: Update an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/:id", auth_1.authenticate, (0, validation_1.validate)(student_schema_1.UpdateApplicationSchema), application_controller_1.ApplicationController.updateApplication);
/**
 * @swagger
 * /applications/admin:
 *   get:
 *     summary: Get all applications (admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, application_controller_1.ApplicationController.getAdminApplications);
/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a specific application by ID (admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, application_controller_1.ApplicationController.getAdminApplicationById);
exports.default = router;
//# sourceMappingURL=application.routes.js.map