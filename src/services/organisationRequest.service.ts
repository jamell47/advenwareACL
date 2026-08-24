import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { OrganisationRequestStatus, OrganisationRequestType } from "@prisma/client";
import { sanitizeQueryParams } from "../utils/query.util";

interface RequestQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  requestType?: string;
  search?: string;
}

interface CreateRequestData {
  requestType: OrganisationRequestType;
  numberOfStudents: number;
  course?: string;
  description?: string;
}

interface UpdateRequestData {
  requestType?: OrganisationRequestType;
  numberOfStudents?: number;
  course?: string;
  description?: string;
}

const EDITABLE_STATUSES = [OrganisationRequestStatus.PENDING];
const ACTIVE_STATUSES = [
  OrganisationRequestStatus.PENDING,
  OrganisationRequestStatus.PROCESSING,
  OrganisationRequestStatus.APPROVED,
];

export class OrganisationRequestService {
  static async createRequest(organisationId: string, data: CreateRequestData): Promise<any> {
    const request = await prisma.organisationRequest.create({
      data: {
        organisationId,
        requestType: data.requestType,
        numberOfStudents: data.numberOfStudents,
        course: data.course || undefined,
        description: data.description || undefined,
        status: OrganisationRequestStatus.PENDING,
      },
    });

    await AuditLogService.log(
      "ORGANISATION_REQUEST_CREATED",
      undefined,
      "OrganisationRequest",
      request.id,
      `Request for ${request.numberOfStudents} ${request.requestType} students created by organisation ${organisationId}`,
    );

    return this.format(request);
  }

  static async getRequests(
    organisationId: string,
    params: RequestQueryParams = {},
  ): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = { organisationId };
    if (cleanParams.status) where.status = cleanParams.status;
    if (cleanParams.requestType) where.requestType = cleanParams.requestType;
    if (cleanParams.search) {
      where.OR = [
        { course: { contains: cleanParams.search, mode: "insensitive" } },
        { description: { contains: cleanParams.search, mode: "insensitive" } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.organisationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.organisationRequest.count({ where }),
    ]);

    return {
      data: requests.map(this.format),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getRequestById(organisationId: string, requestId: string): Promise<any> {
    const request = await prisma.organisationRequest.findFirst({
      where: { id: requestId, organisationId },
    });

    if (!request) {
      throw new APIError("Request not found", 404, "REQUEST_NOT_FOUND");
    }

    return this.format(request);
  }

  static async updateRequest(organisationId: string, requestId: string, data: UpdateRequestData): Promise<any> {
    const request = await this.getRequestById(organisationId, requestId);

    if (!EDITABLE_STATUSES.includes(request.status)) {
      throw new APIError(
        "Request can only be edited while it is pending",
        400,
        "REQUEST_NOT_EDITABLE",
      );
    }

    const updated = await prisma.organisationRequest.update({
      where: { id: requestId },
      data: {
        requestType: data.requestType,
        numberOfStudents: data.numberOfStudents,
        course: data.course,
        description: data.description,
      },
    });

    await AuditLogService.log(
      "ORGANISATION_REQUEST_UPDATED",
      undefined,
      "OrganisationRequest",
      requestId,
      `Request ${requestId} updated by organisation ${organisationId}`,
    );

    return this.format(updated);
  }

  static async cancelRequest(organisationId: string, requestId: string): Promise<any> {
    const request = await this.getRequestById(organisationId, requestId);

    if (!EDITABLE_STATUSES.includes(request.status)) {
      throw new APIError(
        "Only pending requests can be cancelled",
        400,
        "REQUEST_NOT_CANCELABLE",
      );
    }

    const updated = await prisma.organisationRequest.update({
      where: { id: requestId },
      data: { status: OrganisationRequestStatus.CANCELLED },
    });

    await AuditLogService.log(
      "ORGANISATION_REQUEST_CANCELLED",
      undefined,
      "OrganisationRequest",
      requestId,
      `Request ${requestId} cancelled by organisation ${organisationId}`,
    );

    return this.format(updated);
  }

  static async getRequestStats(organisationId: string): Promise<any> {
    const [activeRequests, totalStudentsRequested] = await Promise.all([
      prisma.organisationRequest.count({
        where: { organisationId, status: { in: ACTIVE_STATUSES } },
      }),
      prisma.organisationRequest.aggregate({
        where: { organisationId, status: { in: ACTIVE_STATUSES } },
        _sum: { numberOfStudents: true },
      }),
    ]);

    return {
      activeRequests,
      studentsRequested: totalStudentsRequested._sum.numberOfStudents ?? 0,
    };
  }

  static async countByOrganisation(organisationId: string): Promise<number> {
    return prisma.organisationRequest.count({ where: { organisationId } });
  }

  static async getAllRequests(params: RequestQueryParams = {}): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = {};
    if (cleanParams.status) where.status = cleanParams.status;
    if (cleanParams.requestType) where.requestType = cleanParams.requestType;
    if (cleanParams.search) {
      where.OR = [
        { course: { contains: cleanParams.search, mode: "insensitive" } },
        { description: { contains: cleanParams.search, mode: "insensitive" } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.organisationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { organisation: { select: { id: true, companyName: true, email: true } } },
      }),
      prisma.organisationRequest.count({ where }),
    ]);

    return {
      data: requests.map((r) => ({
        ...this.format(r),
        organisation: r.organisation
          ? { id: r.organisation.id, companyName: r.organisation.companyName, email: r.organisation.email }
          : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getRequestByIdAdmin(requestId: string): Promise<any> {
    const request = await prisma.organisationRequest.findUnique({
      where: { id: requestId },
      include: { organisation: { select: { id: true, companyName: true, email: true, phone: true, profileImage: true, location: true, industry: true, description: true, status: true, createdAt: true } } },
    });

    if (!request) {
      throw new APIError("Request not found", 404, "REQUEST_NOT_FOUND");
    }

    return {
      ...this.format(request),
      organisation: {
        id: request.organisation.id,
        companyName: request.organisation.companyName,
        email: request.organisation.email,
        phone: request.organisation.phone,
        profileImage: request.organisation.profileImage,
        location: request.organisation.location,
        industry: request.organisation.industry,
        description: request.organisation.description,
        status: request.organisation.status,
        createdAt: request.organisation.createdAt,
      },
    };
  }

  static async updateRequestStatus(requestId: string, status: OrganisationRequestStatus, notes?: string): Promise<any> {
    const request = await prisma.organisationRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new APIError("Request not found", 404, "REQUEST_NOT_FOUND");
    }

    const updated = await prisma.organisationRequest.update({
      where: { id: requestId },
      data: { status },
    });

    await AuditLogService.log(
      "ORGANISATION_REQUEST_STATUS_CHANGED",
      undefined,
      "OrganisationRequest",
      requestId,
      `Request ${requestId} status changed to ${status}`,
      notes ? { notes } : undefined,
    );

    return this.format(updated);
  }

  private static format(request: any) {
    return {
      id: request.id,
      organisationId: request.organisationId,
      requestType: request.requestType,
      numberOfStudents: request.numberOfStudents,
      course: request.course,
      description: request.description,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
