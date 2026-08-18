"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
const storage_util_1 = require("../utils/storage.util");
const client_1 = require("@prisma/client");
const auditLog_service_1 = require("./auditLog.service");
const notification_service_1 = require("./notification.service");
class DocumentService {
    static async getAllDocuments(userId, params = {}) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (params.type)
            where.type = params.type;
        if (params.status)
            where.status = params.status;
        const [documents, total] = await Promise.all([
            prisma_1.prisma.document.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    versions: {
                        orderBy: { version: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma_1.prisma.document.count({ where }),
        ]);
        const formatted = documents.map((doc) => this.formatDocument(doc));
        return {
            data: formatted,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getDocumentById(userId, documentId) {
        const document = await prisma_1.prisma.document.findFirst({
            where: { id: documentId, userId },
            include: {
                versions: {
                    orderBy: { version: "desc" },
                },
            },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        return this.formatDocument(document);
    }
    static async uploadDocument(userId, file, data) {
        const folder = `documents/${userId}`;
        const { path: filePath, filename } = await storage_util_1.StorageService.uploadFile(file, folder);
        const nextVersion = 1;
        const document = await prisma_1.prisma.document.create({
            data: {
                userId,
                type: data.type,
                customTypeName: data.customTypeName,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                filePath,
                status: client_1.DocumentStatus.PENDING_REVIEW,
                isRequired: data.isRequired || false,
                applicationId: data.applicationId,
                versions: {
                    create: {
                        version: nextVersion,
                        filePath,
                        fileName: file.originalname,
                        fileSize: file.size,
                        mimeType: file.mimetype,
                    },
                },
            },
            include: {
                versions: {
                    orderBy: { version: "desc" },
                    take: 1,
                },
            },
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_UPLOADED", userId, "Document", document.id, `Document ${file.originalname} uploaded as ${data.type}`);
        return this.formatDocument(document);
    }
    static async uploadNewVersion(userId, documentId, file) {
        const document = await prisma_1.prisma.document.findFirst({
            where: { id: documentId, userId },
            include: {
                versions: {
                    orderBy: { version: "desc" },
                    take: 1,
                },
            },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        if (document.status === client_1.DocumentStatus.APPROVED) {
            throw new errorHandler_1.APIError("Cannot upload new version for an approved document", 400, "INVALID_OPERATION");
        }
        const folder = `documents/${userId}`;
        const { path: filePath } = await storage_util_1.StorageService.uploadFile(file, folder);
        const currentVersion = document.versions[0]?.version || 0;
        await prisma_1.prisma.$transaction(async (tx) => {
            await tx.documentVersion.create({
                data: {
                    documentId: document.id,
                    version: currentVersion + 1,
                    filePath,
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                },
            });
            await tx.document.update({
                where: { id: document.id },
                data: {
                    filePath,
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    status: client_1.DocumentStatus.PENDING_REVIEW,
                    rejectionReason: null,
                    updatedAt: new Date(),
                },
            });
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_REUPLOADED", userId, "Document", document.id, `New version uploaded for document ${file.originalname}`);
        return this.getDocumentById(userId, documentId);
    }
    static async deleteDocument(userId, documentId) {
        const document = await prisma_1.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        if (document.filePath) {
            await storage_util_1.StorageService.deleteFile(document.filePath);
        }
        await prisma_1.prisma.document.delete({
            where: { id: documentId },
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_DELETED", userId, "Document", documentId, `Document ${document.fileName} deleted`);
    }
    static async downloadDocument(userId, documentId, versionId) {
        const filePath = null;
        const filename = "document";
        const mimeType = "application/octet-stream";
        if (versionId) {
            const version = await prisma_1.prisma.documentVersion.findFirst({
                where: { id: versionId, document: { userId } },
            });
            if (!version) {
                throw new errorHandler_1.APIError("Document version not found", 404, "DOCUMENT_VERSION_NOT_FOUND");
            }
            const result = await storage_util_1.StorageService.streamFile(version.filePath);
            if (!result) {
                throw new errorHandler_1.APIError("File not found on disk", 404, "FILE_NOT_FOUND");
            }
            return {
                stream: result.stream,
                filename: version.fileName,
                mimeType: version.mimeType,
                stat: result.stat,
            };
        }
        const document = await prisma_1.prisma.document.findFirst({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        if (!document.filePath) {
            throw new errorHandler_1.APIError("File not available", 404, "FILE_NOT_FOUND");
        }
        const result = await storage_util_1.StorageService.streamFile(document.filePath);
        if (!result) {
            throw new errorHandler_1.APIError("File not found on disk", 404, "FILE_NOT_FOUND");
        }
        return {
            stream: result.stream,
            filename: document.fileName,
            mimeType: document.mimeType,
            stat: result.stat,
        };
    }
    static async getDocumentStats(userId) {
        const [total, approved, pending, rejected, reuploadRequired] = await Promise.all([
            prisma_1.prisma.document.count({ where: { userId } }),
            prisma_1.prisma.document.count({ where: { userId, status: client_1.DocumentStatus.APPROVED } }),
            prisma_1.prisma.document.count({ where: { userId, status: client_1.DocumentStatus.PENDING_REVIEW } }),
            prisma_1.prisma.document.count({ where: { userId, status: client_1.DocumentStatus.REJECTED } }),
            prisma_1.prisma.document.count({ where: { userId, status: client_1.DocumentStatus.REUPLOAD_REQUIRED } }),
        ]);
        return {
            total,
            approved,
            pending,
            rejected,
            reuploadRequired,
            approvedCount: approved,
            totalCount: total,
        };
    }
    static async getAdminDocuments(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.type)
            where.type = params.type;
        if (params.status)
            where.status = params.status;
        const [documents, total] = await Promise.all([
            prisma_1.prisma.document.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
                    versions: { orderBy: { version: "desc" }, take: 1 },
                },
            }),
            prisma_1.prisma.document.count({ where }),
        ]);
        const formatted = documents.map((doc) => this.formatAdminDocument(doc));
        return {
            data: formatted,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    static async getAdminDocumentById(documentId) {
        const document = await prisma_1.prisma.document.findUnique({
            where: { id: documentId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, studentProfile: true } },
                versions: { orderBy: { version: "desc" } },
            },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        return this.formatAdminDocument(document);
    }
    static async approveDocument(documentId, adminUserId, notes) {
        const document = await prisma_1.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.document.update({
            where: { id: documentId },
            data: {
                status: client_1.DocumentStatus.APPROVED,
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                rejectionReason: null,
            },
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_APPROVED", adminUserId, "Document", documentId, `Document ${document.fileName} approved by admin`, { notes });
        await notification_service_1.NotificationService.createNotification({
            userId: document.userId,
            type: "DOCUMENT_APPROVED",
            title: "Document Approved",
            message: `Your document ${document.fileName} has been approved.`,
            data: { documentId, notes },
        });
        return this.formatAdminDocument(updated);
    }
    static async rejectDocument(documentId, adminUserId, reason) {
        if (!reason || reason.trim().length < 3) {
            throw new errorHandler_1.APIError("Rejection reason is required (minimum 3 characters)", 400, "REASON_REQUIRED");
        }
        const document = await prisma_1.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.document.update({
            where: { id: documentId },
            data: {
                status: client_1.DocumentStatus.REJECTED,
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                rejectionReason: reason,
            },
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_REJECTED", adminUserId, "Document", documentId, `Document ${document.fileName} rejected by admin. Reason: ${reason}`, { reason });
        await notification_service_1.NotificationService.createNotification({
            userId: document.userId,
            type: "DOCUMENT_REJECTED",
            title: "Document Rejected",
            message: `Your document ${document.fileName} has been rejected. Reason: ${reason}`,
            data: { documentId, reason },
        });
        return this.formatAdminDocument(updated);
    }
    static async requestReupload(documentId, adminUserId, reason) {
        if (!reason || reason.trim().length < 3) {
            throw new errorHandler_1.APIError("Re-upload reason is required (minimum 3 characters)", 400, "REASON_REQUIRED");
        }
        const document = await prisma_1.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new errorHandler_1.APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        const updated = await prisma_1.prisma.document.update({
            where: { id: documentId },
            data: {
                status: client_1.DocumentStatus.REUPLOAD_REQUIRED,
                reviewedBy: adminUserId,
                reviewedAt: new Date(),
                rejectionReason: reason,
            },
        });
        await auditLog_service_1.AuditLogService.log("DOCUMENT_REUPLOAD_REQUESTED", adminUserId, "Document", documentId, `Document re-upload requested for ${document.fileName}. Reason: ${reason}`, { reason });
        await notification_service_1.NotificationService.createNotification({
            userId: document.userId,
            type: "DOCUMENT_REJECTED",
            title: "Document Re-upload Required",
            message: `Your document ${document.fileName} requires re-upload. Reason: ${reason}`,
            data: { documentId, reason },
        });
        return this.formatAdminDocument(updated);
    }
    static formatAdminDocument(doc) {
        const formatted = this.formatDocument(doc);
        return {
            ...formatted,
            user: doc.user
                ? {
                    id: doc.user.id,
                    firstName: doc.user.firstName,
                    lastName: doc.user.lastName,
                    email: doc.user.email,
                    phoneNumber: doc.user.phoneNumber,
                    institution: doc.user.studentProfile?.institution,
                    course: doc.user.studentProfile?.course,
                }
                : null,
        };
    }
    static formatDocument(doc) {
        return {
            id: doc.id,
            userId: doc.userId,
            type: doc.type,
            customTypeName: doc.customTypeName,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            status: doc.status,
            isRequired: doc.isRequired,
            rejectionReason: doc.rejectionReason,
            uploadedAt: doc.uploadedAt,
            reviewedAt: doc.reviewedAt,
            reviewedBy: doc.reviewedBy,
            versions: doc.versions
                ? doc.versions.map((v) => ({
                    id: v.id,
                    version: v.version,
                    fileName: v.fileName,
                    fileSize: v.fileSize,
                    mimeType: v.mimeType,
                    uploadedAt: v.uploadedAt,
                }))
                : [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map