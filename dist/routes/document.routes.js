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
 * @swagger
 * tags:
 *   name: Documents
 *   description: Document management and upload
 */
/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents for the authenticated student
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", auth_1.authenticate, (0, validation_1.validate)(document_schema_1.DocumentQueryParamsSchema), document_controller_1.DocumentController.getAllDocuments);
/**
 * @swagger
 * /documents/stats:
 *   get:
 *     summary: Get document statistics
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", auth_1.authenticate, document_controller_1.DocumentController.getDocumentStats);
/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", auth_1.authenticate, upload_middleware_1.upload.single("file"), (0, validation_1.validate)(document_schema_1.UploadDocumentSchema), document_controller_1.DocumentController.uploadDocument);
/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", auth_1.authenticate, document_controller_1.DocumentController.getDocumentById);
/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", auth_1.authenticate, document_controller_1.DocumentController.deleteDocument);
/**
 * @swagger
 * /documents/{id}/download:
 *   get:
 *     summary: Download a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id/download", auth_1.authenticate, document_controller_1.DocumentController.downloadDocument);
/**
 * @swagger
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
 * @swagger
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
 * @swagger
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
/**
 * @swagger
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