import { Router } from "express";
import { StudentController } from "../controllers/student.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UpdateStudentProfileSchema } from "../schemas/student.schema";

const router = Router();

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
router.get("/me", authenticate, StudentController.getMyProfile);

/**
 * @swagger
 * /students/me:
 *   patch:
 *     summary: Update the authenticated student's profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.patch("/me", authenticate, validate(UpdateStudentProfileSchema), StudentController.updateMyProfile);

export default router;
