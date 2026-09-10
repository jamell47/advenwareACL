"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const prisma_1 = require("../config/prisma");
const payment_service_1 = require("../services/payment.service");
const errorHandler_1 = require("../middleware/errorHandler");
const query_util_1 = require("../utils/query.util");
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
            const cleanParams = (0, query_util_1.sanitizeQueryParams)(req.query);
            const where = {};
            if (cleanParams.status)
                where.status = cleanParams.status;
            if (cleanParams.search) {
                where.OR = [
                    { user: { firstName: { contains: cleanParams.search, mode: "insensitive" } } },
                    { user: { lastName: { contains: cleanParams.search, mode: "insensitive" } } },
                    { user: { email: { contains: cleanParams.search, mode: "insensitive" } } },
                    { mpesaReceiptNumber: { contains: cleanParams.search, mode: "insensitive" } },
                    { transactionId: { contains: cleanParams.search, mode: "insensitive" } },
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
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phoneNumber: true,
                                studentProfile: {
                                    select: {
                                        institution: true,
                                        course: true,
                                    },
                                },
                            },
                        },
                        placement: true,
                    },
                }),
                prisma_1.prisma.payment.count({ where }),
            ]);
            const formatted = payments.map((p) => ({
                id: p.id,
                userId: p.userId,
                placementId: p.placementId,
                amount: p.amount,
                currency: p.currency,
                method: p.method,
                status: p.status,
                mpesaPhoneNumber: p.mpesaPhoneNumber,
                mpesaReceiptNumber: p.mpesaReceiptNumber,
                transactionId: p.transactionId,
                checkoutRequestId: p.checkoutRequestId,
                confirmedAt: p.confirmedAt,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                placement: p.placement
                    ? {
                        id: p.placement.id,
                        organizationName: p.placement.organizationName,
                        positionTitle: p.placement.positionTitle,
                        location: p.placement.location,
                        startDate: p.placement.startDate,
                        endDate: p.placement.endDate,
                        status: p.placement.status,
                    }
                    : null,
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