"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisationAdmin_controller_1 = require("../controllers/organisationAdmin.controller");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const validation_1 = require("../middleware/validation");
const organisation_schema_1 = require("../schemas/organisation.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: AdminOrganisationRequests
 *   description: Super Admin view of all organisation student requests
 */
router.use(auth_1.authenticate, adminAuth_1.requireSuperAdmin);
router.get("/", organisationAdmin_controller_1.OrganisationAdminController.getAllRequests);
router.get("/:id", organisationAdmin_controller_1.OrganisationAdminController.getRequest);
router.patch("/:id/status", (0, validation_1.validate)(organisation_schema_1.OrganisationRequestStatusSchema), organisationAdmin_controller_1.OrganisationAdminController.updateRequestStatus);
exports.default = router;
//# sourceMappingURL=organisationRequestAdmin.routes.js.map