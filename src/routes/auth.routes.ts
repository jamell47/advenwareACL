import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../schemas/auth.schema";
import { APIError } from "../middleware/errorHandler";

const router = Router();

router.post("/register", (req, res, next) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return next(new APIError(message, 400, "VALIDATION_ERROR"));
    }
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
}, AuthController.register);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new student user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *               - phoneNumber
 *               - dateOfBirth
 *               - nationality
 *               - idNumber
 *               - idType
 *               - institution
 *               - course
 *               - termsAccepted
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               nationality:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               idType:
 *                 type: string
 *                 enum: [NATIONAL_ID, PASSPORT]
 *               institution:
 *                 type: string
 *               course:
 *                 type: string
 *               termsAccepted:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email or phone already registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 */
router.post("/login", validate(LoginSchema), AuthController.login);

router.post("/refresh", validate(RefreshTokenSchema), AuthController.refresh);

router.post("/logout", AuthController.logout);

router.post("/forgot-password", validate(ForgotPasswordSchema), AuthController.forgotPassword);

router.post("/reset-password", validate(ResetPasswordSchema), AuthController.resetPassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, AuthController.getMe);

export default router;
