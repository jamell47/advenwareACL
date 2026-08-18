"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints (Super Admin, Agents, Students, Roles, Audit)
 */
router.use(auth_1.authenticate, (0, adminAuth_1.requireAdmin)("SUPER_ADMIN", "ADMIN", "PLACEMENT_ADMIN", "DOCUMENT_ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "AGENT_MANAGER", "PARTNERSHIP_ADMIN"));
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", admin_controller_1.AdminController.getDashboard);
/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students", admin_controller_1.AdminController.getStudents);
/**
 * @swagger
 * /admin/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students/:id", admin_controller_1.AdminController.getStudentById);
/**
 * @swagger
 * /admin/students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/students/:id", admin_controller_1.AdminController.updateStudent);
/**
 * @swagger
 * /admin/students/{id}/suspend:
 *   post:
 *     summary: Suspend student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students/:id/suspend", admin_controller_1.AdminController.suspendStudent);
/**
 * @swagger
 * /admin/students/{id}/activate:
 *   post:
 *     summary: Activate student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students/:id/activate", admin_controller_1.AdminController.activateStudent);
/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admins", admin_controller_1.AdminController.getAdmins);
/**
 * @swagger
 * /admin/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admins", admin_controller_1.AdminController.createAdmin);
/**
 * @swagger
 * /admin/admins/{id}:
 *   put:
 *     summary: Update admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/admins/:id", admin_controller_1.AdminController.updateAdmin);
/**
 * @swagger
 * /admin/admins/{id}/disable:
 *   post:
 *     summary: Disable admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admins/:id/disable", admin_controller_1.AdminController.disableAdmin);
/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles and permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/roles", admin_controller_1.AdminController.getRoles);
/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/audit-logs", admin_controller_1.AdminController.getAuditLogs);
/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/settings", admin_controller_1.AdminController.getSystemSettings);
/**
 * @swagger
 * /admin/settings/{key}:
 *   put:
 *     summary: Update system setting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/settings/:key", admin_controller_1.AdminController.updateSystemSetting);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map