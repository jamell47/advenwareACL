"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = require("../controllers/student.controller");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const student_schema_1 = require("../schemas/student.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student profile management
 */
/**
 * @swagger
 * /students/me:
 *   get:
 *     summary: Get the authenticated student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", auth_1.authenticate, student_controller_1.StudentController.getMyProfile);
/**
 * @swagger
 * /students/me:
 *   patch:
 *     summary: Update the authenticated student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/me", auth_1.authenticate, (0, validation_1.validate)(student_schema_1.UpdateStudentProfileSchema), student_controller_1.StudentController.updateMyProfile);
exports.default = router;
//# sourceMappingURL=student.routes.js.map