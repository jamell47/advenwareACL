import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { PlacementStatus } from "@prisma/client";
import { sanitizeQueryParams } from "../utils/query.util";

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

  static async getAdminPlacements(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = {};
    if (cleanParams.status) where.status = cleanParams.status;
    if (cleanParams.search) {
      where.OR = [
        { organizationName: { contains: cleanParams.search, mode: "insensitive" } },
        { positionTitle: { contains: cleanParams.search, mode: "insensitive" } },
        { location: { contains: cleanParams.search, mode: "insensitive" } },
        { user: { firstName: { contains: cleanParams.search, mode: "insensitive" } } },
        { user: { lastName: { contains: cleanParams.search, mode: "insensitive" } } },
      ];
    }

    const [placements, total] = await Promise.all([
      prisma.placement.findMany({
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
              studentProfile: true,
            },
          },
          payment: true,
        },
      }),
      prisma.placement.count({ where }),
    ]);

    return {
      data: placements.map((p) => this.formatPlacement(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAdminPlacementById(placementId: string): Promise<any> {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            studentProfile: true,
          },
        },
        payment: true,
      },
    });

    if (!placement) {
      throw new APIError("Placement not found", 404, "PLACEMENT_NOT_FOUND");
    }

    return this.formatPlacement(placement);
  }

  static async adminCreatePlacement(data: {
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
    status?: string;
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
        status: (data.status as any) || PlacementStatus.MATCHED,
        placementFee: data.placementFee || 1500,
        feeAmount: 1500,
        commissionAmount: 500,
        matchedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    return this.formatPlacement(placement);
  }

  static async adminUpdatePlacement(placementId: string, data: {
    status?: string;
    organizationName?: string;
    department?: string;
    positionTitle?: string;
    location?: string;
    supervisorName?: string;
    supervisorPhone?: string;
    supervisorEmail?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const updateData: any = {};
    if (data.status) updateData.status = data.status as any;
    if (data.organizationName) updateData.organizationName = data.organizationName;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.positionTitle) updateData.positionTitle = data.positionTitle;
    if (data.location) updateData.location = data.location;
    if (data.supervisorName !== undefined) updateData.supervisorName = data.supervisorName;
    if (data.supervisorPhone !== undefined) updateData.supervisorPhone = data.supervisorPhone;
    if (data.supervisorEmail !== undefined) updateData.supervisorEmail = data.supervisorEmail;
    if (data.startDate) updateData.startDate = data.startDate;
    if (data.endDate) updateData.endDate = data.endDate;

    if (data.status === PlacementStatus.CONFIRMED && !updateData.confirmedAt) {
      updateData.confirmedAt = new Date();
    }

    const placement = await prisma.placement.update({
      where: { id: placementId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    return this.formatPlacement(placement);
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
