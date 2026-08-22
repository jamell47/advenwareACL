import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authenticate } from "../middleware/auth";
import { APIError } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import { upload } from "../middleware/upload.middleware";
import { UploadDocumentSchema, DocumentQueryParamsSchema } from "../schemas/document.schema";

const router = Router();

/**
 * /documents:
 *   get:
 *     summary: Get all documents for the authenticated student
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/",
  authenticate,
  validate(DocumentQueryParamsSchema),
  DocumentController.getAllDocuments,
);

/**
 * /documents/stats:
 *   get:
 *     summary: Get document statistics
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authenticate, DocumentController.getDocumentStats);

/**
 * /documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticate,
  upload.single("file"),
  validate(UploadDocumentSchema),
  DocumentController.uploadDocument,
);

/**
 * /documents/admin:
 *   get:
 *     summary: Get all documents (admin access - no user filter)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", authenticate, (req, res, next) => {
  if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
    return next(new APIError("Forbidden", 403, "FORBIDDEN"));
  }
  next();
}, DocumentController.getAdminDocuments);

/**
 * /documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authenticate, DocumentController.getDocumentById);

/**
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, DocumentController.deleteDocument);

/**
 * /documents/{id}/download:
 *   get:
 *     summary: Download a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/download", authenticate, DocumentController.downloadDocument);

/**
 * /documents/{id}/approve:
 *   post:
 *     summary: Approve a document (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/approve",
  authenticate,
  (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
      return next(new APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  },
  DocumentController.approveDocument,
);

/**
 * /documents/{id}/reject:
 *   post:
 *     summary: Reject a document (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/reject",
  authenticate,
  (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
      return next(new APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  },
  DocumentController.rejectDocument,
);

/**
 * /documents/{id}/reupload:
 *   post:
 *     summary: Request document re-upload (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:id/reupload-request",
  authenticate,
  (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user!.role)) {
      return next(new APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  },
  DocumentController.requestReupload,
);

export default router;
