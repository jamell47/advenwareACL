"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const prisma_1 = require("../config/prisma");
const payment_service_1 = require("../services/payment.service");
const errorHandler_1 = require("../middleware/errorHandler");
class PaymentController {
    static async getMyPayments(req, res, next) {
        try {
            const payments = await payment_service_1.PaymentService.getMyPayments(req.user.id);
            res.status(200).json({
                success: true,
                message: "Payments retrieved successfully",
                data: payments,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPaymentById(req, res, next) {
        try {
            const payment = await payment_service_1.PaymentService.getPaymentById(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Payment retrieved successfully",
                data: payment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminPayments(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (req.query.status)
                where.status = req.query.status;
            if (req.query.search) {
                where.OR = [
                    { user: { firstName: { contains: req.query.search, mode: "insensitive" } } },
                    { user: { lastName: { contains: req.query.search, mode: "insensitive" } } },
                    { user: { email: { contains: req.query.search, mode: "insensitive" } } },
                    { mpesaReceiptNumber: { contains: req.query.search, mode: "insensitive" } },
                    { transactionId: { contains: req.query.search, mode: "insensitive" } },
                ];
            }
            const [payments, total] = await Promise.all([
                prisma_1.prisma.payment.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
                            include: { studentProfile: true },
                        },
                        placement: true,
                    },
                }),
                prisma_1.prisma.payment.count({ where }),
            ]);
            const formatted = payments.map((p) => ({
                ...p,
                user: p.user
                    ? {
                        id: p.user.id,
                        firstName: p.user.firstName,
                        lastName: p.user.lastName,
                        email: p.user.email,
                        phoneNumber: p.user.phoneNumber,
                        institution: p.user.studentProfile?.institution,
                        course: p.user.studentProfile?.course,
                    }
                    : null,
            }));
            res.status(200).json({
                success: true,
                message: "Payments retrieved successfully",
                data: formatted,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminPaymentById(req, res, next) {
        try {
            const payment = await prisma_1.prisma.payment.findUnique({
                where: { id: req.params.id },
                include: {
                    user: { include: { studentProfile: true } },
                    placement: true,
                },
            });
            if (!payment) {
                return next(new errorHandler_1.APIError("Payment not found", 404, "NOT_FOUND"));
            }
            res.status(200).json({
                success: true,
                message: "Payment retrieved successfully",
                data: payment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyPayment(req, res, next) {
        try {
            const payment = await prisma_1.prisma.payment.findUnique({
                where: { id: req.params.id },
            });
            if (!payment) {
                return next(new errorHandler_1.APIError("Payment not found", 404, "NOT_FOUND"));
            }
            res.status(200).json({
                success: true,
                message: "Payment verification status retrieved",
                data: payment,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async initiateSTKPush(req, res, next) {
        try {
            const result = await payment_service_1.PaymentService.initiateSTKPush(req.user.id, req.body.phoneNumber);
            res.status(200).json({
                success: true,
                message: "STK push initiated successfully",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async handleCallback(req, res, next) {
        try {
            await payment_service_1.PaymentService.handleCallback(req.body);
            res.status(200).json({
                success: true,
                message: "Callback processed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map