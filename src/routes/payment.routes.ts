import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { STKPushSchema, CallbackSchema } from "../schemas/payment.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing (M-Pesa / Daraja)
 */

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get payment history for the authenticated student
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authenticate, PaymentController.getMyPayments);

/**
 * @swagger
 * /payments/stk-push:
 *   post:
 *     summary: Initiate M-Pesa STK Push payment (requires confirmed placement)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/stk-push",
  authenticate,
  validate(STKPushSchema),
  PaymentController.initiateSTKPush,
);

/**
 * @swagger
 * /payments/callback:
 *   post:
 *     summary: Daraja STK callback endpoint (no auth required)
 *     tags: [Payments]
 */
router.post(
  "/callback",
  validate(CallbackSchema),
  PaymentController.handleCallback,
);

/**
 * @swagger
 * /payments/admin:
 *   get:
 *     summary: Get all payments (admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PaymentController.getAdminPayments);

router.get("/admin/:id", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PaymentController.getAdminPaymentById);

router.post("/admin/:id/verify", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, PaymentController.verifyPayment);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a specific payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, PaymentController.getPaymentById);

export default router;
