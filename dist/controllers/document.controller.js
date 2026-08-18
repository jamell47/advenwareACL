"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_service_1 = require("../services/document.service");
const auditLog_service_1 = require("../services/auditLog.service");
const notification_service_1 = require("../services/notification.service");
const errorHandler_1 = require("../middleware/errorHandler");
class DocumentController {
    static async getAllDocuments(req, res, next) {
        try {
            const { type, status, page, limit } = req.query;
            const result = await document_service_1.DocumentService.getAllDocuments(req.user.id, {
                type: type,
                status: status,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.status(200).json({
                success: true,
                message: "Documents retrieved successfully",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getDocumentById(req, res, next) {
        try {
            const document = await document_service_1.DocumentService.getDocumentById(req.user.id, req.params.id);
            res.status(200).json({
                success: true,
                message: "Document retrieved successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadDocument(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                throw new errorHandler_1.APIError("No file provided", 400, "NO_FILE");
            }
            const document = await document_service_1.DocumentService.uploadDocument(req.user.id, file, req.body);
            await notification_service_1.NotificationService.createNotification({
                userId: req.user.id,
                type: "DOCUMENT_SUBMITTED",
                title: "Document Uploaded",
                message: `Your ${file.originalname} has been uploaded and is pending review.`,
                data: { documentId: document.id },
            });
            await auditLog_service_1.AuditLogService.log("DOCUMENT_UPLOADED", req.user.id, "Document", document.id, `Document ${file.originalname} uploaded as ${req.body.type}`);
            res.status(201).json({
                success: true,
                message: "Document uploaded successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadNewVersion(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                throw new errorHandler_1.APIError("No file provided", 400, "NO_FILE");
            }
            const document = await document_service_1.DocumentService.uploadNewVersion(req.user.id, req.params.id, file);
            await auditLog_service_1.AuditLogService.log("DOCUMENT_REUPLOADED", req.user.id, "Document", req.params.id, `New version of document uploaded`);
            res.status(200).json({
                success: true,
                message: "Document version uploaded successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteDocument(req, res, next) {
        try {
            await document_service_1.DocumentService.deleteDocument(req.user.id, req.params.id);
            await auditLog_service_1.AuditLogService.log("DOCUMENT_DELETED", req.user.id, "Document", req.params.id, "Document deleted");
            res.status(200).json({
                success: true,
                message: "Document deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async downloadDocument(req, res, next) {
        try {
            const versionId = req.query.versionId;
            const result = await document_service_1.DocumentService.downloadDocument(req.user.id, req.params.id, versionId);
            res.setHeader("Content-Type", result.mimeType);
            res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
            result.stream.pipe(res);
        }
        catch (error) {
            next(error);
        }
    }
    static async getDocumentStats(req, res, next) {
        try {
            const stats = await document_service_1.DocumentService.getDocumentStats(req.user.id);
            res.status(200).json({
                success: true,
                message: "Document stats retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAdminDocuments(req, res, next) {
        try {
            const { type, status, page, limit } = req.query;
            const result = await document_service_1.DocumentService.getAdminDocuments({
                type: type,
                status: status,
                page: page ? parseInt(page, 10) : undefined,
                limit: limit ? parseInt(limit, 10) : undefined,
            });
            res.status(200).json({
                success: true,
                message: "Documents retrieved successfully",
                data: result.data,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveDocument(req, res, next) {
        try {
            const document = await document_service_1.DocumentService.approveDocument(req.params.id, req.user.id, req.body.notes);
            await auditLog_service_1.AuditLogService.log("DOCUMENT_APPROVED", req.user.id, "Document", req.params.id, `Document ${req.params.id} approved by admin`, { notes: req.body.notes });
            res.status(200).json({
                success: true,
                message: "Document approved successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async rejectDocument(req, res, next) {
        try {
            if (!req.body.reason) {
                throw new errorHandler_1.APIError("Rejection reason is required", 400, "REASON_REQUIRED");
            }
            const document = await document_service_1.DocumentService.rejectDocument(req.params.id, req.user.id, req.body.reason);
            res.status(200).json({
                success: true,
                message: "Document rejected successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async requestReupload(req, res, next) {
        try {
            if (!req.body.reason) {
                throw new errorHandler_1.APIError("Re-upload reason is required", 400, "REASON_REQUIRED");
            }
            const document = await document_service_1.DocumentService.requestReupload(req.params.id, req.user.id, req.body.reason);
            res.status(200).json({
                success: true,
                message: "Document re-upload requested successfully",
                data: document,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=document.controller.js.map