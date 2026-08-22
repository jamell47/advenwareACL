import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { ApplicationStatus } from "@prisma/client";

interface CreateApplicationData {
  preferredStartDate?: Date;
  preferredEndDate?: Date;
  preferredLocation?: string;
  preferredIndustry?: string;
  preferredPlacementArea?: string;
  coverLetter?: string;
}

interface UpdateApplicationData {
  status?: ApplicationStatus;
  adminNotes?: string;
}

export class ApplicationService {
  static async getMyApplication(userId: string): Promise<any> {
    const application = await prisma.attachmentApplication.findFirst({
      where: { userId },
      include: {
        placement: true,
        studentProfile: true,
      },
    });

    if (!application) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        return { exists: false };
      }
      throw new APIError("Application not found", 404, "APPLICATION_NOT_FOUND");
    }

    return {
      id: application.id,
      applicationId: application.id,
      applicationDate: application.createdAt,
      preferredStartDate: application.preferredStartDate,
      preferredEndDate: application.preferredEndDate,
      preferredLocation: application.preferredLocation,
      preferredIndustry: application.preferredIndustry,
      preferredPlacementArea: application.preferredPlacementArea,
      coverLetter: application.coverLetter,
      status: application.status,
      adminNotes: application.adminNotes,
      reviewedAt: application.reviewedAt,
      reviewedBy: application.reviewedBy,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      placement: application.placement
        ? {
            id: application.placement.id,
            organizationName: application.placement.organizationName,
            department: application.placement.department,
            positionTitle: application.placement.positionTitle,
            location: application.placement.location,
            supervisorName: application.placement.supervisorName,
            supervisorPhone: application.placement.supervisorPhone,
            supervisorEmail: application.placement.supervisorEmail,
            startDate: application.placement.startDate,
            endDate: application.placement.endDate,
            status: application.placement.status,
            placementFee: application.placement.placementFee,
          }
        : null,
    };
  }

  static async createApplication(userId: string, data: CreateApplicationData): Promise<any> {
    if (!data) {
      throw new APIError("Application data is required", 400, "INVALID_DATA");
    }

    const existing = await prisma.attachmentApplication.findFirst({
      where: { userId },
    });

    if (existing) {
      const updated = await prisma.attachmentApplication.update({
        where: { id: existing.id },
        data: {
          preferredStartDate: data.preferredStartDate,
          preferredEndDate: data.preferredEndDate,
          preferredLocation: data.preferredLocation,
          preferredIndustry: data.preferredIndustry,
          preferredPlacementArea: data.preferredPlacementArea,
          coverLetter: data.coverLetter,
          updatedAt: new Date(),
        },
        include: {
          placement: true,
        },
      });

      return this.formatApplication(updated);
    }

    const application = await prisma.attachmentApplication.create({
      data: {
        userId,
        preferredStartDate: data.preferredStartDate,
        preferredEndDate: data.preferredEndDate,
        preferredLocation: data.preferredLocation,
        preferredIndustry: data.preferredIndustry,
        preferredPlacementArea: data.preferredPlacementArea,
        coverLetter: data.coverLetter,
        status: ApplicationStatus.DRAFT,
      },
      include: {
        placement: true,
      },
    });

    return this.formatApplication(application);
  }

  static async updateApplication(userId: string, applicationId: string, data: UpdateApplicationData): Promise<any> {
    const application = await prisma.attachmentApplication.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new APIError("Application not found", 404, "APPLICATION_NOT_FOUND");
    }

    const updated = await prisma.attachmentApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
      },
      include: {
        placement: true,
      },
    });

    return this.formatApplication(updated);
  }

  private static formatApplication(application: any) {
    return {
      id: application.id,
      applicationId: application.id,
      applicationDate: application.createdAt,
      preferredStartDate: application.preferredStartDate,
      preferredEndDate: application.preferredEndDate,
      preferredLocation: application.preferredLocation,
      preferredIndustry: application.preferredIndustry,
      preferredPlacementArea: application.preferredPlacementArea,
      coverLetter: application.coverLetter,
      status: application.status,
      adminNotes: application.adminNotes,
      reviewedAt: application.reviewedAt,
      reviewedBy: application.reviewedBy,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      placement: application.placement
        ? {
            id: application.placement.id,
            organizationName: application.placement.organizationName,
            department: application.placement.department,
            positionTitle: application.placement.positionTitle,
            location: application.placement.location,
            supervisorName: application.placement.supervisorName,
            supervisorPhone: application.placement.supervisorPhone,
            supervisorEmail: application.placement.supervisorEmail,
            startDate: application.placement.startDate,
            endDate: application.placement.endDate,
            status: application.placement.status,
            placementFee: application.placement.placementFee,
          }
        : null,
    };
  }
}
