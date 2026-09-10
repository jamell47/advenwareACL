"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const daraja_service_1 = require("./daraja.service");
const notification_service_1 = require("./notification.service");
const auditLog_service_1 = require("./auditLog.service");
class PaymentService {
    static async getMyPayments(userId) {
        const payments = await prisma_1.prisma.payment.findMany({
            where: { userId },
            include: {
                placement: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return payments.map((p) => this.formatPayment(p));
    }
    static async getPaymentById(userId, paymentId) {
        const payment = await prisma_1.prisma.payment.findFirst({
            where: { id: paymentId, userId },
            include: {
                placement: true,
            },
        });
        if (!payment) {
            throw new errorHandler_1.APIError("Payment not found", 404, "PAYMENT_NOT_FOUND");
        }
        return this.formatPayment(payment);
    }
    static async initiateSTKPush(userId, phoneNumber) {
        let placement = await prisma_1.prisma.placement.findFirst({
            where: { userId, status: "CONFIRMED" },
        });
        // Allow payment even without a confirmed placement - create a standalone payment
        if (!placement) {
            placement = await prisma_1.prisma.placement.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
        }
        const feeAmount = placement?.feeAmount || 1500;
        const placementId = placement?.id || null;
        const existingPayment = await prisma_1.prisma.payment.findFirst({
            where: {
                userId,
                placementId: placementId || undefined,
                status: { in: ["PENDING", "PROCESSING"] },
            },
            include: {
                placement: true,
            },
        });
        let payment;
        if (existingPayment) {
            payment = existingPayment;
        }
        else {
            payment = await prisma_1.prisma.payment.create({
                data: {
                    userId,
                    placementId: placementId,
                    amount: feeAmount,
                    currency: "KES",
                    method: "MPESA",
                    status: "PROCESSING",
                },
                include: {
                    placement: true,
                },
            });
        }
        if (placementId && !payment.placementId) {
            await prisma_1.prisma.payment.update({
                where: { id: payment.id },
                data: { placementId: placementId },
            });
        }
        const accountReference = `ACL-PAY-${payment.id.slice(0, 8)}`;
        const transactionDesc = "ACL Placement Fee";
        const stkResponse = await daraja_service_1.DarajaService.initiateSTKPush(phoneNumber, payment.amount, accountReference, transactionDesc, userId);
        await prisma_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                checkoutRequestId: stkResponse?.CheckoutRequestID || payment.checkoutRequestId,
                mpesaReceiptNumber: stkResponse?.CheckoutRequestID || null,
            },
        });
        await auditLog_service_1.AuditLogService.log("STK_PUSH_INITIATED", userId, "Payment", payment.id, `STK push initiated for KSh ${payment.amount} to ${phoneNumber}`);
        await notification_service_1.NotificationService.createNotification({
            userId,
            type: "PAYMENT_REQUIRED",
            title: "Payment Initiated",
            message: `Your payment request for KSh ${payment.amount} has been sent. Check your phone for the M-Pesa prompt.`,
            data: { paymentId: payment.id, checkoutRequestId: stkResponse?.CheckoutRequestID },
        });
        return {
            paymentId: payment.id,
            checkoutRequestId: stkResponse?.CheckoutRequestID,
            amount: payment.amount,
            currency: payment.currency,
            phoneNumber,
            status: "PROCESSING",
            message: "STK push sent. Check your phone to complete payment.",
            mpesaPrompt: true,
            placement: payment.placement
                ? {
                    id: payment.placement.id,
                    organizationName: payment.placement.organizationName,
                    positionTitle: payment.placement.positionTitle,
                    startDate: payment.placement.startDate,
                    endDate: payment.placement.endDate,
                }
                : null,
        };
    }
    static async handleCallback(callbackData) {
        return daraja_service_1.DarajaService.handleCallback(callbackData);
    }
    static formatPayment(payment) {
        return {
            id: payment.id,
            userId: payment.userId,
            placementId: payment.placementId,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            status: payment.status,
            mpesaPhoneNumber: payment.mpesaPhoneNumber,
            mpesaReceiptNumber: payment.mpesaReceiptNumber,
            transactionId: payment.transactionId,
            checkoutRequestId: payment.checkoutRequestId,
            confirmedAt: payment.confirmedAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            placement: payment.placement
                ? {
                    id: payment.placement.id,
                    organizationName: payment.placement.organizationName,
                    positionTitle: payment.placement.positionTitle,
                    location: payment.placement.location,
                    startDate: payment.placement.startDate,
                    endDate: payment.placement.endDate,
                    status: payment.placement.status,
                }
                : null,
        };
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map