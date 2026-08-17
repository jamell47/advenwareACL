import { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document.service";
import { AuditLogService } from "../services/auditLog.service";
import { NotificationService } from "../services/notification.service";
import { APIError } from "../middleware/errorHandler";

export class DocumentController {
  static async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, status, page, limit } = req.query;
      const result = await DocumentService.getAllDocuments(req.user!.id, {
        type: type as any,
        status: status as any,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Documents retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.getDocumentById(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: "Document retrieved successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        throw new APIError("No file provided", 400, "NO_FILE");
      }

      const document = await DocumentService.uploadDocument(req.user!.id, file, req.body);

      await NotificationService.createNotification({
        userId: req.user!.id,
        type: "DOCUMENT_SUBMITTED",
        title: "Document Uploaded",
        message: `Your ${file.originalname} has been uploaded and is pending review.`,
        data: { documentId: document.id },
      });

      await AuditLogService.log(
        "DOCUMENT_UPLOADED",
        req.user!.id,
        "Document",
        document.id,
        `Document ${file.originalname} uploaded as ${req.body.type}`,
      );

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadNewVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        throw new APIError("No file provided", 400, "NO_FILE");
      }

      const document = await DocumentService.uploadNewVersion(req.user!.id, req.params.id, file);

      await AuditLogService.log(
        "DOCUMENT_REUPLOADED",
        req.user!.id,
        "Document",
        req.params.id,
        `New version of document uploaded`,
      );

      res.status(200).json({
        success: true,
        message: "Document version uploaded successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentService.deleteDocument(req.user!.id, req.params.id);

      await AuditLogService.log(
        "DOCUMENT_DELETED",
        req.user!.id,
        "Document",
        req.params.id,
        "Document deleted",
      );

      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const versionId = req.query.versionId as string | undefined;
      const result = await DocumentService.downloadDocument(req.user!.id, req.params.id, versionId);

      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      result.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  static async getDocumentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DocumentService.getDocumentStats(req.user!.id);

       res.status(200).json({
         success: true,
         message: "Document stats retrieved successfully",
         data: stats,
       });
     } catch (error) {
      next(error);
    }
  }

  static async getAdminDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, status, page, limit } = req.query;
      const result = await DocumentService.getAdminDocuments({
        type: type as any,
        status: status as any,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        message: "Documents retrieved successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.approveDocument(req.params.id, req.user!.id, req.body.notes);

      await AuditLogService.log(
        "DOCUMENT_APPROVED",
        req.user!.id,
        "Document",
        req.params.id,
        `Document ${req.params.id} approved by admin`,
        { notes: req.body.notes },
      );

      res.status(200).json({
        success: true,
        message: "Document approved successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.reason) {
        throw new APIError("Rejection reason is required", 400, "REASON_REQUIRED");
      }
      const document = await DocumentService.rejectDocument(req.params.id, req.user!.id, req.body.reason);

      res.status(200).json({
        success: true,
        message: "Document rejected successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestReupload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.reason) {
        throw new APIError("Re-upload reason is required", 400, "REASON_REQUIRED");
      }
      const document = await DocumentService.requestReupload(req.params.id, req.user!.id, req.body.reason);

      res.status(200).json({
        success: true,
        message: "Document re-upload requested successfully",
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
}
