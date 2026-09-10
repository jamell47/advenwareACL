"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const upload_middleware_1 = require("../middleware/upload.middleware");
const document_schema_1 = require("../schemas/document.schema");
const router = (0, express_1.Router)();
/**
 * /documents:
 *   get:
 *     summary: Get all documents for the authenticated student
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth_1.authenticate, (0, validation_1.validate)(document_schema_1.DocumentQueryParamsSchema), document_controller_1.DocumentController.getAllDocuments);
/**
 * /documents/stats:
 *   get:
 *     summary: Get document statistics
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", auth_1.authenticate, document_controller_1.DocumentController.getDocumentStats);
router.get("/progress", auth_1.authenticate, document_controller_1.DocumentController.getDocumentProgress);
/**
 * /documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", auth_1.authenticate, upload_middleware_1.upload.single("file"), (0, validation_1.validate)(document_schema_1.UploadDocumentSchema), document_controller_1.DocumentController.uploadDocument);
/**
 * /documents/admin:
 *   get:
 *     summary: Get all documents (admin access - no user filter)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/admin", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, document_controller_1.DocumentController.getAdminDocuments);
/**
 * /documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth_1.authenticate, document_controller_1.DocumentController.getDocumentById);
/**
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth_1.authenticate, document_controller_1.DocumentController.deleteDocument);
/**
 * /documents/{id}/download:
 *   get:
 *     summary: Download a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/download", auth_1.authenticate, document_controller_1.DocumentController.downloadDocument);
/**
 * /documents/{id}/approve:
 *   post:
 *     summary: Approve a document (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/approve", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, document_controller_1.DocumentController.approveDocument);
/**
 * /documents/{id}/reject:
 *   post:
 *     summary: Reject a document (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/reject", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, document_controller_1.DocumentController.rejectDocument);
router.post("/:id/reupload", auth_1.authenticate, upload_middleware_1.upload.single("file"), document_controller_1.DocumentController.uploadNewVersion);
/**
 * /documents/{id}/reupload:
 *   post:
 *     summary: Request document re-upload (admin)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/reupload-request", auth_1.authenticate, (req, res, next) => {
    if (!["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user.role)) {
        return next(new errorHandler_1.APIError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
}, document_controller_1.DocumentController.requestReupload);
exports.default = router;
//# sourceMappingURL=document.routes.js.map