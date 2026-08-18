"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class ApplicationService {
    static async getMyApplication(userId) {
        const application = await prisma_1.prisma.attachmentApplication.findFirst({
            where: { userId },
            include: {
                placement: true,
                studentProfile: true,
            },
        });
        if (!application) {
            const profile = await prisma_1.prisma.studentProfile.findUnique({
                where: { userId },
            });
            if (profile) {
                return { exists: false };
            }
            throw new errorHandler_1.APIError("Application not found", 404, "APPLICATION_NOT_FOUND");
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
    static async createApplication(userId, data) {
        const existing = await prisma_1.prisma.attachmentApplication.findFirst({
            where: { userId },
        });
        if (existing) {
            const updated = await prisma_1.prisma.attachmentApplication.update({
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
        const application = await prisma_1.prisma.attachmentApplication.create({
            data: {
                userId,
                preferredStartDate: data.preferredStartDate,
                preferredEndDate: data.preferredEndDate,
                preferredLocation: data.preferredLocation,
                preferredIndustry: data.preferredIndustry,
                preferredPlacementArea: data.preferredPlacementArea,
                coverLetter: data.coverLetter,
                status: client_1.ApplicationStatus.DRAFT,
            },
            include: {
                placement: true,
            },
        });
        return this.formatApplication(application);
    }
    static async updateApplication(userId, applicationId, data) {
        const application = await prisma_1.prisma.attachmentApplication.findFirst({
            where: { id: applicationId, userId },
        });
        if (!application) {
            throw new errorHandler_1.APIError("Application not found", 404, "APPLICATION_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.attachmentApplication.update({
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
    static formatApplication(application) {
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
exports.ApplicationService = ApplicationService;
//# sourceMappingURL=application.service.js.map