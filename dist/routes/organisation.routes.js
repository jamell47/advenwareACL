"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisation_controller_1 = require("../controllers/organisation.controller");
const validation_1 = require("../middleware/validation");
const organisationAuth_1 = require("../middleware/organisationAuth");
const upload_middleware_1 = require("../middleware/upload.middleware");
const organisation_schema_1 = require("../schemas/organisation.schema");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Self-service organisation authentication & profile
 */
/** register/login/refresh/logout are public */
router.post("/register", (0, validation_1.validate)(organisation_schema_1.OrganisationRegisterSchema), organisation_controller_1.OrganisationController.register);
router.post("/login", (0, validation_1.validate)(organisation_schema_1.OrganisationLoginSchema), organisation_controller_1.OrganisationController.login);
router.post("/refresh", (0, validation_1.validate)(organisation_schema_1.OrganisationRefreshSchema), organisation_controller_1.OrganisationController.refresh);
router.post("/logout", (0, validation_1.validate)(organisation_schema_1.OrganisationRefreshSchema), organisation_controller_1.OrganisationController.logout);
/** everything below requires a valid organisation access token */
router.use(organisationAuth_1.authenticateOrganisation);
router.get("/me", organisation_controller_1.OrganisationController.getMe);
router.put("/me", (0, validation_1.validate)(organisation_schema_1.OrganisationUpdateMeSchema), organisation_controller_1.OrganisationController.updateMe);
router.post("/me/profile-image", upload_middleware_1.upload.single("profileImage"), organisation_controller_1.OrganisationController.uploadProfileImage);
exports.default = router;
//# sourceMappingURL=organisation.routes.js.map