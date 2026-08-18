"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middleware/validation");
const auth_schema_1 = require("../schemas/auth.schema");
const router = (0, express_1.Router)();
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
router.post("/register", (0, validation_1.validate)(auth_schema_1.RegisterSchema), auth_controller_1.AuthController.register);
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
router.post("/login", (0, validation_1.validate)(auth_schema_1.LoginSchema), auth_controller_1.AuthController.login);
router.post("/refresh", (0, validation_1.validate)(auth_schema_1.RefreshTokenSchema), auth_controller_1.AuthController.refresh);
router.post("/logout", auth_controller_1.AuthController.logout);
router.post("/forgot-password", (0, validation_1.validate)(auth_schema_1.ForgotPasswordSchema), auth_controller_1.AuthController.forgotPassword);
router.post("/reset-password", (0, validation_1.validate)(auth_schema_1.ResetPasswordSchema), auth_controller_1.AuthController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map