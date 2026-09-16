"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationRequestService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLog_service_1 = require("./auditLog.service");
const client_1 = require("@prisma/client");
const query_util_1 = require("../utils/query.util");
const EDITABLE_STATUSES = [client_1.OrganisationRequestStatus.PENDING];
const ACTIVE_STATUSES = [
    client_1.OrganisationRequestStatus.PENDING,
    client_1.OrganisationRequestStatus.PROCESSING,
    client_1.OrganisationRequestStatus.APPROVED,
];
class OrganisationRequestService {
    static async createRequest(organisationId, data) {
        const request = await prisma_1.prisma.organisationRequest.create({
            data: {
                organisationId,
                requestType: data.requestType,
                numberOfStudents: data.numberOfStudents,
                course: data.course || undefined,
                description: data.description || undefined,
                status: client_1.OrganisationRequestStatus.PENDING,
            },
        });
        await auditLog_service_1.AuditLogService.log("ORGANISATION_REQUEST_CREATED", undefined, "OrganisationRequest", request.id, `Request for ${request.numberOfStudents} ${request.requestType} students created by organisation ${organisationId}`);
        return this.format(request);
    }
    static async getRequests(organisationId, params = {}) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const cleanParams = (0, query_util_1.sanitizeQueryParams)(params);
        const where = { organisationId };
        if (cleanParams.status)
            where.status = cleanParams.status;
        if (cleanParams.requestType)
            where.requestType = cleanParams.requestType;
        if (cleanParams.search) {
            where.OR = [
                { course: { contains: cleanParams.search, mode: "insensitive" } },
                { description: { contains: cleanParams.search, mode: "insensitive" } },
            ];
        }
        const [requests, total] = await Promise.all([
            prisma_1.prisma.organisationRequest.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.organisationRequest.count({ where }),
        ]);
        return {
            data: requests.map(this.format),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async getRequestById(organisationId, requestId) {
        const request = await prisma_1.prisma.organisationRequest.findFirst({
            where: { id: requestId, organisationId },
        });
        if (!request) {
            throw new errorHandler_1.APIError("Request not found", 404, "REQUEST_NOT_FOUND");
        }
        return this.format(request);
    }
    static async updateRequest(organisationId, requestId, data) {
        const request = await this.getRequestById(organisationId, requestId);
        if (!EDITABLE_STATUSES.includes(request.status)) {
            throw new errorHandler_1.APIError("Request can only be edited while it is pending", 400, "REQUEST_NOT_EDITABLE");
        }
        const updated = await prisma_1.prisma.organisationRequest.update({
            where: { id: requestId },
            data: {
                requestType: data.requestType,
                numberOfStudents: data.numberOfStudents,
                course: data.course,
                description: data.description,
            },
        });
        await auditLog_service_1.AuditLogService.log("ORGANISATION_REQUEST_UPDATED", undefined, "OrganisationRequest", requestId, `Request ${requestId} updated by organisation ${organisationId}`);
        return this.format(updated);
    }
    static async cancelRequest(organisationId, requestId) {
        const request = await this.getRequestById(organisationId, requestId);
        if (!EDITABLE_STATUSES.includes(request.status)) {
            throw new errorHandler_1.APIError("Only pending requests can be cancelled", 400, "REQUEST_NOT_CANCELABLE");
        }
        const updated = await prisma_1.prisma.organisationRequest.update({
            where: { id: requestId },
            data: { status: client_1.OrganisationRequestStatus.CANCELLED },
        });
        await auditLog_service_1.AuditLogService.log("ORGANISATION_REQUEST_CANCELLED", undefined, "OrganisationRequest", requestId, `Request ${requestId} cancelled by organisation ${organisationId}`);
        return this.format(updated);
    }
    static async getRequestStats(organisationId) {
        const [activeRequests, totalStudentsRequested] = await Promise.all([
            prisma_1.prisma.organisationRequest.count({
                where: { organisationId, status: { in: ACTIVE_STATUSES } },
            }),
            prisma_1.prisma.organisationRequest.aggregate({
                where: { organisationId, status: { in: ACTIVE_STATUSES } },
                _sum: { numberOfStudents: true },
            }),
        ]);
        return {
            activeRequests,
            studentsRequested: totalStudentsRequested._sum.numberOfStudents ?? 0,
        };
    }
    static async countByOrganisation(organisationId) {
        return prisma_1.prisma.organisationRequest.count({ where: { organisationId } });
    }
    static async getAllRequests(params = {}) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const cleanParams = (0, query_util_1.sanitizeQueryParams)(params);
        const where = {};
        if (cleanParams.status)
            where.status = cleanParams.status;
        if (cleanParams.requestType)
            where.requestType = cleanParams.requestType;
        if (cleanParams.search) {
            where.OR = [
                { course: { contains: cleanParams.search, mode: "insensitive" } },
                { description: { contains: cleanParams.search, mode: "insensitive" } },
            ];
        }
        const [requests, total] = await Promise.all([
            prisma_1.prisma.organisationRequest.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: { organisation: { select: { id: true, companyName: true, email: true } } },
            }),
            prisma_1.prisma.organisationRequest.count({ where }),
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
    static async getRequestByIdAdmin(requestId) {
        const request = await prisma_1.prisma.organisationRequest.findUnique({
            where: { id: requestId },
            include: { organisation: { select: { id: true, companyName: true, email: true, phone: true, profileImage: true, location: true, industry: true, description: true, status: true, createdAt: true } } },
        });
        if (!request) {
            throw new errorHandler_1.APIError("Request not found", 404, "REQUEST_NOT_FOUND");
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
    static async updateRequestStatus(requestId, status, notes) {
        const request = await prisma_1.prisma.organisationRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new errorHandler_1.APIError("Request not found", 404, "REQUEST_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.organisationRequest.update({
            where: { id: requestId },
            data: { status },
        });
        await auditLog_service_1.AuditLogService.log("ORGANISATION_REQUEST_STATUS_CHANGED", undefined, "OrganisationRequest", requestId, `Request ${requestId} status changed to ${status}`, notes ? { notes } : undefined);
        return this.format(updated);
    }
    static format(request) {
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
exports.OrganisationRequestService = OrganisationRequestService;
//# sourceMappingURL=organisationRequest.service.js.map