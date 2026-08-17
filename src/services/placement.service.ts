import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { PlacementStatus } from "@prisma/client";

export class PlacementService {
  static async getMyPlacement(userId: string): Promise<any> {
    const placement = await prisma.placement.findFirst({
      where: { userId },
      include: {
        payment: true,
      },
    });

    if (!placement) {
      return null;
    }

    return this.formatPlacement(placement);
  }

  static async getAllPlacements(userId: string): Promise<any[]> {
    const placements = await prisma.placement.findMany({
      where: { userId },
      include: {
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return placements.map((p) => this.formatPlacement(p));
  }

  static async createPlacement(data: {
    userId: string;
    organizationName: string;
    department?: string;
    positionTitle: string;
    location: string;
    supervisorName?: string;
    supervisorPhone?: string;
    supervisorEmail?: string;
    startDate: Date;
    endDate: Date;
    applicationId?: string;
    placementFee?: number;
  }): Promise<any> {
    const placement = await prisma.placement.create({
      data: {
        userId: data.userId,
        applicationId: data.applicationId,
        organizationName: data.organizationName,
        department: data.department,
        positionTitle: data.positionTitle,
        location: data.location,
        supervisorName: data.supervisorName,
        supervisorPhone: data.supervisorPhone,
        supervisorEmail: data.supervisorEmail,
        startDate: data.startDate,
        endDate: data.endDate,
        status: PlacementStatus.MATCHED,
        placementFee: data.placementFee || 1500,
        feeAmount: 1500,
        commissionAmount: 500,
        matchedAt: new Date(),
      },
      include: {
        payment: true,
      },
    });

    return this.formatPlacement(placement);
  }

  static async confirmPlacement(userId: string, placementId: string): Promise<any> {
    const placement = await prisma.placement.findFirst({
      where: { id: placementId, userId },
    });

    if (!placement) {
      throw new APIError("Placement not found", 404, "PLACEMENT_NOT_FOUND");
    }

    const updated = await prisma.placement.update({
      where: { id: placementId },
      data: {
        status: PlacementStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: {
        payment: true,
      },
    });

    await prisma.payment.create({
      data: {
        userId,
        placementId: placement.id,
        amount: placement.feeAmount || 1500,
        currency: "KES",
        method: "MPESA",
        status: "PENDING",
      },
    });

    return this.formatPlacement(updated);
  }

  private static formatPlacement(placement: any) {
    return {
      id: placement.id,
      userId: placement.userId,
      applicationId: placement.applicationId,
      organizationName: placement.organizationName,
      department: placement.department,
      positionTitle: placement.positionTitle,
      location: placement.location,
      supervisorName: placement.supervisorName,
      supervisorPhone: placement.supervisorPhone,
      supervisorEmail: placement.supervisorEmail,
      startDate: placement.startDate,
      endDate: placement.endDate,
      status: placement.status,
      placementFee: placement.placementFee,
      feeAmount: placement.feeAmount,
      commissionAmount: placement.commissionAmount,
      createdAt: placement.createdAt,
      updatedAt: placement.updatedAt,
      confirmedAt: placement.confirmedAt,
      matchedAt: placement.matchedAt,
      payment: placement.payment
        ? {
            id: placement.payment.id,
            amount: placement.payment.amount,
            currency: placement.payment.currency,
            method: placement.payment.method,
            status: placement.payment.status,
            confirmedAt: placement.payment.confirmedAt,
          }
        : null,
    };
  }
}
