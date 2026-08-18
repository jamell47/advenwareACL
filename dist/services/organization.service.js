"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const client_1 = require("@prisma/client");
class OrganizationService {
    static async getOrganizations(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: "insensitive" } },
                { industry: { contains: params.search, mode: "insensitive" } },
                { location: { contains: params.search, mode: "insensitive" } },
            ];
        }
        if (params.status) {
            where.status = params.status;
        }
        const [organizations, total] = await Promise.all([
            prisma_1.prisma.organization.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: { placements: true, agentProfiles: true },
                    },
                },
            }),
            prisma_1.prisma.organization.count({ where }),
        ]);
        const formatted = organizations.map((org) => ({
            id: org.id,
            name: org.name,
            industry: org.industry,
            location: org.location,
            contactPerson: org.contactPerson,
            phone: org.phone,
            email: org.email,
            website: org.website,
            description: org.description,
            totalSlots: org.totalSlots,
            availableSlots: org.availableSlots,
            status: org.status,
            placementsCount: org._count.placements,
            agentsCount: org._count.agentProfiles,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
        }));
        return {
            data: formatted,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async getOrganizationById(orgId) {
        const org = await prisma_1.prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                placements: { take: 10, orderBy: { createdAt: "desc" } },
            },
        });
        if (!org) {
            throw new errorHandler_1.APIError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
        }
        return org;
    }
    static async createOrganization(data) {
        const org = await prisma_1.prisma.organization.create({
            data: {
                ...data,
                status: client_1.OrganizationStatus.ACTIVE,
                availableSlots: data.totalSlots || 0,
            },
        });
        await auditLog_service_1.AuditLogService.log("ORGANIZATION_CREATED", undefined, "Organization", org.id, `Organization ${org.name} created`);
        return org;
    }
    static async updateOrganization(orgId, data) {
        const org = await prisma_1.prisma.organization.update({
            where: { id: orgId },
            data: {
                name: data.name,
                industry: data.industry,
                location: data.location,
                contactPerson: data.contactPerson,
                phone: data.phone,
                email: data.email,
                website: data.website,
                description: data.description,
                totalSlots: data.totalSlots,
                availableSlots: data.availableSlots,
                status: data.status,
            },
        });
        await auditLog_service_1.AuditLogService.log("ORGANIZATION_UPDATED", undefined, "Organization", orgId, `Organization ${org.name} updated`);
        return org;
    }
    static async suspendOrganization(orgId) {
        const org = await prisma_1.prisma.organization.update({
            where: { id: orgId },
            data: { status: client_1.OrganizationStatus.SUSPENDED },
        });
        await auditLog_service_1.AuditLogService.log("ORGANIZATION_SUSPENDED", undefined, "Organization", orgId, `Organization ${org.name} suspended`);
        return org;
    }
    static async activateOrganization(orgId) {
        const org = await prisma_1.prisma.organization.update({
            where: { id: orgId },
            data: { status: client_1.OrganizationStatus.ACTIVE },
        });
        await auditLog_service_1.AuditLogService.log("ORGANIZATION_ACTIVATED", undefined, "Organization", orgId, `Organization ${org.name} activated`);
        return org;
    }
}
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=organization.service.js.map