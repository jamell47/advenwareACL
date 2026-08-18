"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const payment_schema_1 = require("../schemas/payment.schema");
const router = (0, express_1.Router)();
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
router.get("/me", auth_1.authenticate, payment_controller_1.PaymentController.getMyPayments);
/**
 * @swagger
 * /payments/stk-push:
 *   post:
 *     summary: Initiate M-Pesa STK Push payment (requires confirmed placement)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.post("/stk-push", auth_1.authenticate, (0, validation_1.validate)(payment_schema_1.STKPushSchema), payment_controller_1.PaymentController.initiateSTKPush);
/**
 * @swagger
 * /payments/callback:
 *   post:
 *     summary: Daraja STK callback endpoint (no auth required)
 *     tags: [Payments]
 */
router.post("/callback", (0, validation_1.validate)(payment_schema_1.CallbackSchema), payment_controller_1.PaymentController.handleCallback);
/**
 * @swagger
 * /payments/admin:
 *   get:
 *     summary: Get all payments (admin)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, payment_controller_1.PaymentController.getAdminPayments);
router.get("/admin/:id", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, payment_controller_1.PaymentController.getAdminPaymentById);
router.post("/admin/:id/verify", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, payment_controller_1.PaymentController.verifyPayment);
/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a specific payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth_1.authenticate, payment_controller_1.PaymentController.getPaymentById);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map