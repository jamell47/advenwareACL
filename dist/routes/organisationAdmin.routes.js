"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisationAdmin_controller_1 = require("../controllers/organisationAdmin.controller");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: AdminOrganisations
 *   description: Super Admin view of self-service organisations and requests
 */
router.use(auth_1.authenticate, adminAuth_1.requireSuperAdmin);
router.get("/", organisationAdmin_controller_1.OrganisationAdminController.getOrganisations);
router.get("/:id", organisationAdmin_controller_1.OrganisationAdminController.getOrganisation);
router.get("/:id/stats", organisationAdmin_controller_1.OrganisationAdminController.getOrganisationStats);
exports.default = router;
//# sourceMappingURL=organisationAdmin.routes.js.map