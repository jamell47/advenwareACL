import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/adminAuth";
import { validate } from "../middleware/validation";
import { CreateAgentSchema, CreateStudentSchema } from "../schemas/admin.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints (Super Admin, Agents, Students, Roles, Audit)
 */

router.use(authenticate, requireAdmin("SUPER_ADMIN", "ADMIN", "PLACEMENT_ADMIN", "DOCUMENT_ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "AGENT_MANAGER", "PARTNERSHIP_ADMIN"));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", AdminController.getDashboard);

/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students (paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students", AdminController.getStudents);

/**
 * @swagger
 * /admin/students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students/:id", AdminController.getStudentById);

/**
 * @swagger
 * /admin/students/{id}:
 *   put:
 *     summary: Update student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/students/:id", AdminController.updateStudent);

/**
 * @swagger
 * /admin/students/{id}/suspend:
 *   post:
 *     summary: Suspend student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students/:id/suspend", AdminController.suspendStudent);

/**
 * @swagger
 * /admin/students/{id}/activate:
 *   post:
 *     summary: Activate student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students/:id/activate", AdminController.activateStudent);

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admins", AdminController.getAdmins);

/**
 * @swagger
 * /admin/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admins", AdminController.createAdmin);

/**
 * @swagger
 * /admin/admins/{id}:
 *   put:
 *     summary: Update admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/admins/:id", AdminController.updateAdmin);

/**
 * @swagger
 * /admin/admins/{id}/disable:
 *   post:
 *     summary: Disable admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/admins/:id/disable", AdminController.disableAdmin);

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles and permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/roles", AdminController.getRoles);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/audit-logs", AdminController.getAuditLogs);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/settings", AdminController.getSystemSettings);

/**
 * @swagger
 * /admin/dashboard/charts:
 *   get:
 *     summary: Get dashboard chart data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard/charts", AdminController.getDashboardCharts);

/**
 * @swagger
 * /admin/settings/{key}:
 *   put:
 *     summary: Update system setting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put("/settings/:key", AdminController.updateSystemSetting);

/**
 * /admin/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/agents", authenticate, requireAdmin("SUPER_ADMIN"), validate(CreateAgentSchema), AdminController.createAgent);

/**
 * /admin/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post("/students", authenticate, requireAdmin("SUPER_ADMIN"), validate(CreateStudentSchema), AdminController.createStudent);

export default router;
