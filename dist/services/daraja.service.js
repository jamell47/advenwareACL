"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DarajaService = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const notification_service_1 = require("./notification.service");
const commission_service_1 = require("./commission.service");
class DarajaService {
    static BASE_URL = env_1.env.darajaEnvironment === "production"
        ? "https://apisandbox.m-pesa.org"
        : "https://apisandbox.m-pesa.org";
    static AUTH_URL = "https://apisandbox.m-pesa.org/oauth/v1/generate";
    static async getAccessToken() {
        if (!env_1.env.darajaConsumerKey || !env_1.env.darajaConsumerSecret) {
            throw new errorHandler_1.APIError("Daraja credentials not configured", 500, "DARAJA_NOT_CONFIGURED");
        }
        const auth = Buffer.from(`${env_1.env.darajaConsumerKey}:${env_1.env.darajaConsumerSecret}`).toString("base64");
        try {
            const response = await axios_1.default.get(this.AUTH_URL, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
                params: {
                    grant_type: "client_credentials",
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            throw new errorHandler_1.APIError("Failed to get Daraja access token", 500, "DARAJA_AUTH_FAILED");
        }
    }
    static async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, userId) {
        if (!env_1.env.darajaShortcode || !env_1.env.darajaPasskey) {
            throw new errorHandler_1.APIError("Daraja shortcode or passkey not configured", 500, "DARAJA_NOT_CONFIGURED");
        }
        const accessToken = await this.getAccessToken();
        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, 14);
        const password = Buffer.from(`${env_1.env.darajaShortcode}${env_1.env.darajaPasskey}${timestamp}`).toString("base64");
        const stkUrl = `${this.BASE_URL}/mpesa/stkpush/v1/processrequest`;
        try {
            const response = await axios_1.default.post(stkUrl, {
                BusinessShortCode: env_1.env.darajaShortcode,
                Password: password,
                Timestamp: timestamp,
                PartyA: phoneNumber,
                PartyB: env_1.env.darajaShortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: env_1.env.darajaCallbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
                Amount: amount,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            throw new errorHandler_1.APIError("Failed to initiate STK push", 500, "STK_PUSH_FAILED");
        }
    }
    static async handleCallback(callbackData) {
        const { stkCallback } = callbackData.Body;
        const { checkoutRequestId, resultCode, resultDesc, callbackMetadata } = stkCallback;
        const payment = await prisma_1.prisma.payment.findFirst({
            where: { checkoutRequestId },
        });
        if (!payment) {
            return;
        }
        await prisma_1.prisma.$transaction(async (tx) => {
            if (resultCode === 0) {
                let amount = 0;
                let mpesaReceipt = "";
                if (callbackMetadata && callbackMetadata.item) {
                    for (const item of callbackMetadata.item) {
                        if (item.name === "Amount") {
                            amount = item.value;
                        }
                        if (item.name === "ReceiptNo" || item.name === "MpesaReceiptNumber") {
                            mpesaReceipt = item.value;
                        }
                    }
                }
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: "SUCCESSFUL",
                        mpesaReceiptNumber: mpesaReceipt,
                        transactionId: checkoutRequestId,
                        callbackData: JSON.parse(JSON.stringify(callbackMetadata || {})),
                        confirmedAt: new Date(),
                    },
                });
                const placement = await tx.placement.findUnique({
                    where: { id: payment.placementId },
                    include: { user: true },
                });
                if (placement) {
                    await tx.placement.update({
                        where: { id: placement.id },
                        data: {
                            status: "CONFIRMED",
                            confirmedAt: new Date(),
                        },
                    });
                    await notification_service_1.NotificationService.createNotification({
                        userId: placement.userId,
                        type: "PAYMENT_SUCCESSFUL",
                        title: "Payment Successful",
                        message: `Your placement fee of KSh ${amount} has been successfully processed.`,
                        data: { paymentId: payment.id, amount, placementId: placement.id },
                    });
                    await auditLog_service_1.AuditLogService.log("PAYMENT_COMPLETED", placement.userId, "Payment", payment.id, `Payment of KSh ${amount} completed for placement ${placement.id}`);
                    if (placement.user.agentId) {
                        await commission_service_1.CommissionService.createCommissionForPayment(payment.id).catch((err) => {
                            console.error("Failed to create commission for payment:", err);
                        });
                        await notification_service_1.NotificationService.createNotification({
                            userId: placement.user.agentId,
                            type: "PAYMENT_SUCCESSFUL",
                            title: "Student Payment Successful",
                            message: `Commission eligibility created for student ${placement.userId} payment of KSh ${amount}`,
                            data: { paymentId: payment.id, placementId: placement.id, amount: placement.commissionAmount || 500 },
                        });
                    }
                }
            }
            else {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: "FAILED",
                        callbackData: JSON.parse(JSON.stringify(callbackData)),
                        confirmedAt: new Date(),
                    },
                });
                await notification_service_1.NotificationService.createNotification({
                    userId: payment.userId,
                    type: "PAYMENT_FAILED",
                    title: "Payment Failed",
                    message: `Your payment attempt failed: ${resultDesc || "Unknown error"}. Please try again.`,
                    data: { paymentId: payment.id, resultCode, resultDesc },
                });
                await auditLog_service_1.AuditLogService.log("PAYMENT_FAILED", payment.userId, "Payment", payment.id, `Payment failed with result code ${resultCode}: ${resultDesc}`);
            }
        });
    }
    static async initiateB2C(phoneNumber, amount, accountReference) {
        if (!env_1.env.darajaShortcode || !env_1.env.darajaConsumerSecret) {
            throw new errorHandler_1.APIError("Daraja credentials not configured", 500, "DARAJA_NOT_CONFIGURED");
        }
        const accessToken = await this.getAccessToken();
        const b2cUrl = `${this.BASE_URL}/mpesa/b2c/v3/payment/register`;
        try {
            const response = await axios_1.default.post(b2cUrl, {
                OriginatorConversationID: accountReference,
                Initiator: env_1.env.darajaShortcode,
                PartyA: env_1.env.darajaShortcode,
                PartyB: phoneNumber,
                Amount: amount,
                CallbackURL: env_1.env.darajaCallbackUrl,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        }
        catch (error) {
            throw new errorHandler_1.APIError("Failed to initiate B2C payout", 500, "B2C_FAILED");
        }
    }
    static async handleB2CCallback(callbackData) {
        const { Result } = callbackData;
        const { conversationId, resultType, resultCode, resultDesc, parameters } = Result;
        const withdrawal = await prisma_1.prisma.withdrawal.findFirst({
            where: { id: conversationId },
        });
        if (!withdrawal) {
            return;
        }
        const transactionId = parameters?.find((p) => p.key === "TransactionID")?.value;
        const transactionAmount = parameters?.find((p) => p.key === "TransactionAmount")?.value;
        const receiverPartyPublicName = parameters?.find((p) => p.key === "ReceiverPartyPublicName")?.value;
        let status = "FAILED";
        if (resultCode === 0) {
            status = "SUCCESS";
        }
        else if (resultCode === 1) {
            status = "FAILED";
        }
        await prisma_1.prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
                status: status,
                paymentRef: transactionId,
                paidAt: status === "SUCCESS" ? new Date() : undefined,
            },
        });
        await auditLog_service_1.AuditLogService.log("B2C_PAYOUT_RESULT", undefined, "Withdrawal", withdrawal.id, `B2C payout result: ${resultDesc} (code: ${resultCode})`, { resultCode, resultDesc, transactionId, transactionAmount, receiverPartyPublicName });
        await notification_service_1.NotificationService.createNotification({
            userId: withdrawal.agentId,
            type: "SYSTEM",
            title: status === "SUCCESS" ? "Withdrawal Processed" : "Withdrawal Failed",
            message: status === "SUCCESS"
                ? `Your withdrawal of KSh ${withdrawal.amount} has been processed successfully.`
                : `Your withdrawal of KSh ${withdrawal.amount} failed. Reason: ${resultDesc}`,
            data: { withdrawalId: withdrawal.id, resultCode, resultDesc },
        });
    }
}
exports.DarajaService = DarajaService;
//# sourceMappingURL=daraja.service.js.map