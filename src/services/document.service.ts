import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { StorageService } from "../utils/storage.util";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";

interface UploadDocumentData {
  type: DocumentType;
  customTypeName?: string;
  isRequired?: boolean;
  applicationId?: string;
}

interface DocumentQueryParams {
  type?: DocumentType;
  status?: DocumentStatus;
  page?: number;
  limit?: number;
}

export class DocumentService {
  static async getAllDocuments(
    userId: string,
    params: DocumentQueryParams = {},
  ): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
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
      prisma.document.count({ where }),
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

  static async getDocumentById(userId: string, documentId: string): Promise<any> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        versions: {
          orderBy: { version: "desc" },
        },
      },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    return this.formatDocument(document);
  }

  static async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    data: UploadDocumentData,
  ): Promise<any> {
    const folder = `documents/${userId}`;

    const { path: filePath, filename } = await StorageService.uploadFile(file, folder);

    const nextVersion = 1;

    const document = await prisma.document.create({
      data: {
        userId,
        type: data.type,
        customTypeName: data.customTypeName,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath,
        status: DocumentStatus.PENDING_REVIEW,
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

    await AuditLogService.log(
      "DOCUMENT_UPLOADED",
      userId,
      "Document",
      document.id,
      `Document ${file.originalname} uploaded as ${data.type}`,
    );

    return this.formatDocument(document);
  }

  static async uploadNewVersion(
    userId: string,
    documentId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    if (document.status === DocumentStatus.APPROVED) {
      throw new APIError("Cannot upload new version for an approved document", 400, "INVALID_OPERATION");
    }

    const folder = `documents/${userId}`;
    const { path: filePath } = await StorageService.uploadFile(file, folder);

    const currentVersion = document.versions[0]?.version || 0;

    await prisma.$transaction(async (tx) => {
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
          status: DocumentStatus.PENDING_REVIEW,
          rejectionReason: null,
          updatedAt: new Date(),
        },
      });
    });

    await AuditLogService.log(
      "DOCUMENT_REUPLOADED",
      userId,
      "Document",
      document.id,
      `New version uploaded for document ${file.originalname}`,
    );

    return this.getDocumentById(userId, documentId);
  }

  static async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    if (document.filePath) {
      await StorageService.deleteFile(document.filePath);
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    await AuditLogService.log(
      "DOCUMENT_DELETED",
      userId,
      "Document",
      documentId,
      `Document ${document.fileName} deleted`,
    );
  }

  static async downloadDocument(userId: string, documentId: string, versionId?: string): Promise<{ stream: any; filename: string; mimeType: string; stat: any }> {
    const filePath: string | null = null;
    const filename = "document";
    const mimeType = "application/octet-stream";

    if (versionId) {
      const version = await prisma.documentVersion.findFirst({
        where: { id: versionId, document: { userId } },
      });

      if (!version) {
        throw new APIError("Document version not found", 404, "DOCUMENT_VERSION_NOT_FOUND");
      }

      const result = await StorageService.streamFile(version.filePath);
      if (!result) {
        throw new APIError("File not found on disk", 404, "FILE_NOT_FOUND");
      }

      return {
        stream: result.stream,
        filename: version.fileName,
        mimeType: version.mimeType,
        stat: result.stat,
      };
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    if (!document.filePath) {
      throw new APIError("File not available", 404, "FILE_NOT_FOUND");
    }

    const result = await StorageService.streamFile(document.filePath);
    if (!result) {
      throw new APIError("File not found on disk", 404, "FILE_NOT_FOUND");
    }

    return {
      stream: result.stream,
      filename: document.fileName,
      mimeType: document.mimeType,
      stat: result.stat,
    };
  }

  static async getDocumentStats(userId: string): Promise<any> {
    const [total, approved, pending, rejected, reuploadRequired] = await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.document.count({ where: { userId, status: DocumentStatus.APPROVED } }),
      prisma.document.count({ where: { userId, status: DocumentStatus.PENDING_REVIEW } }),
      prisma.document.count({ where: { userId, status: DocumentStatus.REJECTED } }),
      prisma.document.count({ where: { userId, status: DocumentStatus.REUPLOAD_REQUIRED } }),
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

  static async getAdminDocuments(params: DocumentQueryParams): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
          versions: { orderBy: { version: "desc" }, take: 1 },
        },
      }),
      prisma.document.count({ where }),
    ]);

    const formatted = documents.map((doc) => this.formatAdminDocument(doc));

    return {
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getAdminDocumentById(documentId: string): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, studentProfile: true } },
        versions: { orderBy: { version: "desc" } },
      },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    return this.formatAdminDocument(document);
  }

  static async approveDocument(documentId: string, adminUserId: string, notes?: string): Promise<any> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.APPROVED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    await AuditLogService.log(
      "DOCUMENT_APPROVED",
      adminUserId,
      "Document",
      documentId,
      `Document ${document.fileName} approved by admin`,
      { notes },
    );

    await NotificationService.createNotification({
      userId: document.userId,
      type: "DOCUMENT_APPROVED",
      title: "Document Approved",
      message: `Your document ${document.fileName} has been approved.`,
      data: { documentId, notes },
    });

    return this.formatAdminDocument(updated);
  }

  static async rejectDocument(documentId: string, adminUserId: string, reason: string): Promise<any> {
    if (!reason || reason.trim().length < 3) {
      throw new APIError("Rejection reason is required (minimum 3 characters)", 400, "REASON_REQUIRED");
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.REJECTED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await AuditLogService.log(
      "DOCUMENT_REJECTED",
      adminUserId,
      "Document",
      documentId,
      `Document ${document.fileName} rejected by admin. Reason: ${reason}`,
      { reason },
    );

    await NotificationService.createNotification({
      userId: document.userId,
      type: "DOCUMENT_REJECTED",
      title: "Document Rejected",
      message: `Your document ${document.fileName} has been rejected. Reason: ${reason}`,
      data: { documentId, reason },
    });

    return this.formatAdminDocument(updated);
  }

  static async requestReupload(documentId: string, adminUserId: string, reason: string): Promise<any> {
    if (!reason || reason.trim().length < 3) {
      throw new APIError("Re-upload reason is required (minimum 3 characters)", 400, "REASON_REQUIRED");
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new APIError("Document not found", 404, "DOCUMENT_NOT_FOUND");
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.REUPLOAD_REQUIRED,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await AuditLogService.log(
      "DOCUMENT_REUPLOAD_REQUESTED",
      adminUserId,
      "Document",
      documentId,
      `Document re-upload requested for ${document.fileName}. Reason: ${reason}`,
      { reason },
    );

    await NotificationService.createNotification({
      userId: document.userId,
      type: "DOCUMENT_REJECTED",
      title: "Document Re-upload Required",
      message: `Your document ${document.fileName} requires re-upload. Reason: ${reason}`,
      data: { documentId, reason },
    });

    return this.formatAdminDocument(updated);
  }

  private static formatAdminDocument(doc: any) {
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

  private static formatDocument(doc: any) {
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
        ? doc.versions.map((v: any) => ({
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
