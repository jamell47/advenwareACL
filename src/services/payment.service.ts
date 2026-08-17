import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { DarajaService } from "./daraja.service";
import { NotificationService } from "./notification.service";
import { AuditLogService } from "./auditLog.service";

export class PaymentService {
  static async getMyPayments(userId: string): Promise<any[]> {
    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        placement: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return payments.map((p) => this.formatPayment(p));
  }

  static async getPaymentById(userId: string, paymentId: string): Promise<any> {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: {
        placement: true,
      },
    });

    if (!payment) {
      throw new APIError("Payment not found", 404, "PAYMENT_NOT_FOUND");
    }

    return this.formatPayment(payment);
  }

  static async initiateSTKPush(userId: string, phoneNumber: string): Promise<any> {
    const placement = await prisma.placement.findFirst({
      where: { userId, status: "CONFIRMED" },
    });

    if (!placement) {
      throw new APIError("No confirmed placement found. Payment is only available after placement confirmation.", 400, "NO_CONFIRMED_PLACEMENT");
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        placementId: placement.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    let payment;

    if (existingPayment) {
      payment = existingPayment;
    } else {
      const feeAmount = placement.feeAmount || 1500;
      payment = await prisma.payment.create({
        data: {
          userId,
          placementId: placement.id,
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

    if (!payment.placementId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { placementId: placement.id },
      });
    }

    const accountReference = `ACL-PAY-${payment.id.slice(0, 8)}`;
    const transactionDesc = "ACL Placement Fee";

    const stkResponse = await DarajaService.initiateSTKPush(
      phoneNumber,
      payment.amount,
      accountReference,
      transactionDesc,
      userId,
    );

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutRequestId: stkResponse?.CheckoutRequestID || payment.checkoutRequestId,
        mpesaReceiptNumber: stkResponse?.CheckoutRequestID || null,
      },
    });

    await AuditLogService.log(
      "STK_PUSH_INITIATED",
      userId,
      "Payment",
      payment.id,
      `STK push initiated for KSh ${payment.amount} to ${phoneNumber}`,
    );

    await NotificationService.createNotification({
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
      placement: {
        id: placement.id,
        organizationName: placement.organizationName,
        positionTitle: placement.positionTitle,
        startDate: placement.startDate,
        endDate: placement.endDate,
      },
    };
  }

  static async handleCallback(callbackData: any): Promise<any> {
    return DarajaService.handleCallback(callbackData);
  }

  private static formatPayment(payment: any) {
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
