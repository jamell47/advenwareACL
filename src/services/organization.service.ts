import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { OrganizationStatus } from "@prisma/client";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class OrganizationService {
  static async getOrganizations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.organization.findMany({
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
      prisma.organization.count({ where }),
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

  static async getOrganizationById(orgId: string): Promise<any> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        placements: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });

    if (!org) {
      throw new APIError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }

    return org;
  }

  static async createOrganization(data: {
    name: string;
    industry?: string;
    location?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    totalSlots?: number;
  }): Promise<any> {
    const org = await prisma.organization.create({
      data: {
        ...data,
        status: OrganizationStatus.ACTIVE,
        availableSlots: data.totalSlots || 0,
      },
    });

    await AuditLogService.log(
      "ORGANIZATION_CREATED",
      undefined,
      "Organization",
      org.id,
      `Organization ${org.name} created`,
    );

    return org;
  }

  static async updateOrganization(orgId: string, data: any): Promise<any> {
    const org = await prisma.organization.update({
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

    await AuditLogService.log(
      "ORGANIZATION_UPDATED",
      undefined,
      "Organization",
      orgId,
      `Organization ${org.name} updated`,
    );

    return org;
  }

  static async suspendOrganization(orgId: string): Promise<any> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { status: OrganizationStatus.SUSPENDED },
    });

    await AuditLogService.log(
      "ORGANIZATION_SUSPENDED",
      undefined,
      "Organization",
      orgId,
      `Organization ${org.name} suspended`,
    );

    return org;
  }

  static async activateOrganization(orgId: string): Promise<any> {
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { status: OrganizationStatus.ACTIVE },
    });

    await AuditLogService.log(
      "ORGANIZATION_ACTIVATED",
      undefined,
      "Organization",
      orgId,
      `Organization ${org.name} activated`,
    );

    return org;
  }
}
