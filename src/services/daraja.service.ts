import axios from "axios";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";
import { CommissionService } from "./commission.service";

export class DarajaService {
  private static readonly BASE_URL =
    env.darajaEnvironment === "production"
      ? "https://apisandbox.m-pesa.org"
      : "https://apisandbox.m-pesa.org";

  private static readonly AUTH_URL = "https://apisandbox.m-pesa.org/oauth/v1/generate";

  static async getAccessToken(): Promise<string> {
    if (!env.darajaConsumerKey || !env.darajaConsumerSecret) {
      throw new APIError("Daraja credentials not configured", 500, "DARAJA_NOT_CONFIGURED");
    }

    const auth = Buffer.from(`${env.darajaConsumerKey}:${env.darajaConsumerSecret}`).toString("base64");

    try {
      const response = await axios.get(this.AUTH_URL, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        params: {
          grant_type: "client_credentials",
        },
      });

      return response.data.access_token;
    } catch (error: any) {
      throw new APIError("Failed to get Daraja access token", 500, "DARAJA_AUTH_FAILED");
    }
  }

  static async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
    userId: string,
  ): Promise<any> {
    if (!env.darajaShortcode || !env.darajaPasskey) {
      throw new APIError("Daraja shortcode or passkey not configured", 500, "DARAJA_NOT_CONFIGURED");
    }

    const accessToken = await this.getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const password = Buffer.from(`${env.darajaShortcode}${env.darajaPasskey}${timestamp}`).toString("base64");

    const stkUrl = `${this.BASE_URL}/mpesa/stkpush/v1/processrequest`;

    try {
      const response = await axios.post(
        stkUrl,
        {
          BusinessShortCode: env.darajaShortcode,
          Password: password,
          Timestamp: timestamp,
          PartyA: phoneNumber,
          PartyB: env.darajaShortcode,
          PhoneNumber: phoneNumber,
          CallBackURL: env.darajaCallbackUrl,
          AccountReference: accountReference,
          TransactionDesc: transactionDesc,
          Amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new APIError("Failed to initiate STK push", 500, "STK_PUSH_FAILED");
    }
  }

  static async handleCallback(callbackData: any): Promise<void> {
    const { stkCallback } = callbackData.Body;
    const { checkoutRequestId, resultCode, resultDesc, callbackMetadata } = stkCallback;

    const payment = await prisma.payment.findFirst({
      where: { checkoutRequestId },
    });

    if (!payment) {
      return;
    }

    await prisma.$transaction(async (tx) => {
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
          where: { id: payment.placementId! },
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

          await NotificationService.createNotification({
            userId: placement.userId,
            type: "PAYMENT_SUCCESSFUL",
            title: "Payment Successful",
            message: `Your placement fee of KSh ${amount} has been successfully processed.`,
            data: { paymentId: payment.id, amount, placementId: placement.id },
          });

          await AuditLogService.log(
            "PAYMENT_COMPLETED",
            placement.userId,
            "Payment",
            payment.id,
            `Payment of KSh ${amount} completed for placement ${placement.id}`,
          );

          if (placement.user.agentId) {
            await CommissionService.createCommissionForPayment(payment.id).catch((err: any) => {
              console.error("Failed to create commission for payment:", err);
            });

            await NotificationService.createNotification({
              userId: placement.user.agentId,
              type: "PAYMENT_SUCCESSFUL",
              title: "Student Payment Successful",
              message: `Commission eligibility created for student ${placement.userId} payment of KSh ${amount}`,
              data: { paymentId: payment.id, placementId: placement.id, amount: placement.commissionAmount || 500 },
            });
          }
        }
      } else {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            callbackData: JSON.parse(JSON.stringify(callbackData)),
            confirmedAt: new Date(),
          },
        });

        await NotificationService.createNotification({
          userId: payment.userId,
          type: "PAYMENT_FAILED",
          title: "Payment Failed",
          message: `Your payment attempt failed: ${resultDesc || "Unknown error"}. Please try again.`,
          data: { paymentId: payment.id, resultCode, resultDesc },
        });

        await AuditLogService.log(
          "PAYMENT_FAILED",
          payment.userId,
          "Payment",
          payment.id,
          `Payment failed with result code ${resultCode}: ${resultDesc}`,
        );
      }
    });
  }

  static async initiateB2C(phoneNumber: string, amount: number, accountReference: string): Promise<any> {
    if (!env.darajaShortcode || !env.darajaConsumerSecret) {
      throw new APIError("Daraja credentials not configured", 500, "DARAJA_NOT_CONFIGURED");
    }

    const accessToken = await this.getAccessToken();

    const b2cUrl = `${this.BASE_URL}/mpesa/b2c/v3/payment/register`;

    try {
      const response = await axios.post(
        b2cUrl,
        {
          OriginatorConversationID: accountReference,
          Initiator: env.darajaShortcode,
          PartyA: env.darajaShortcode,
          PartyB: phoneNumber,
          Amount: amount,
          CallbackURL: env.darajaCallbackUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw new APIError("Failed to initiate B2C payout", 500, "B2C_FAILED");
    }
  }

  static async handleB2CCallback(callbackData: any): Promise<void> {
    const { Result } = callbackData;
    const { conversationId, resultType, resultCode, resultDesc, parameters } = Result;

    const withdrawal = await prisma.withdrawal.findFirst({
      where: { id: conversationId },
    });

    if (!withdrawal) {
      return;
    }

    const transactionId = parameters?.find((p: any) => p.key === "TransactionID")?.value;
    const transactionAmount = parameters?.find((p: any) => p.key === "TransactionAmount")?.value;
    const receiverPartyPublicName = parameters?.find((p: any) => p.key === "ReceiverPartyPublicName")?.value;

    let status = "FAILED";
    if (resultCode === 0) {
      status = "SUCCESS";
    } else if (resultCode === 1) {
      status = "FAILED";
    }

    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: status as any,
        paymentRef: transactionId,
        paidAt: status === "SUCCESS" ? new Date() : undefined,
      },
    });

    await AuditLogService.log(
      "B2C_PAYOUT_RESULT",
      undefined,
      "Withdrawal",
      withdrawal.id,
      `B2C payout result: ${resultDesc} (code: ${resultCode})`,
      { resultCode, resultDesc, transactionId, transactionAmount, receiverPartyPublicName },
    );

    await NotificationService.createNotification({
      userId: withdrawal.agentId,
      type: "SYSTEM",
      title: status === "SUCCESS" ? "Withdrawal Processed" : "Withdrawal Failed",
      message:
        status === "SUCCESS"
          ? `Your withdrawal of KSh ${withdrawal.amount} has been processed successfully.`
          : `Your withdrawal of KSh ${withdrawal.amount} failed. Reason: ${resultDesc}`,
      data: { withdrawalId: withdrawal.id, resultCode, resultDesc },
    });
  }
}
