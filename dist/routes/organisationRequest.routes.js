"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisationRequest_controller_1 = require("../controllers/organisationRequest.controller");
const organisationAuth_1 = require("../middleware/organisationAuth");
const validation_1 = require("../middleware/validation");
const organisation_schema_1 = require("../schemas/organisation.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: OrganisationRequests
 *   description: Student requests submitted by organisations
 */
router.use(organisationAuth_1.authenticateOrganisation);
router.get("/", organisationRequest_controller_1.OrganisationRequestController.getRequests);
router.post("/", (0, validation_1.validate)(organisation_schema_1.OrganisationRequestCreateSchema), organisationRequest_controller_1.OrganisationRequestController.createRequest);
router.get("/stats", organisationRequest_controller_1.OrganisationRequestController.getRequestStats);
router.get("/:id", organisationRequest_controller_1.OrganisationRequestController.getRequestById);
router.put("/:id", (0, validation_1.validate)(organisation_schema_1.OrganisationRequestUpdateSchema), organisationRequest_controller_1.OrganisationRequestController.updateRequest);
router.delete("/:id", organisationRequest_controller_1.OrganisationRequestController.cancelRequest);
exports.default = router;
//# sourceMappingURL=organisationRequest.routes.js.map