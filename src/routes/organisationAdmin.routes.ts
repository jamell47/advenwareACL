import { Router } from "express";
import { OrganisationAdminController } from "../controllers/organisationAdmin.controller";
import { authenticate } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/adminAuth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AdminOrganisations
 *   description: Super Admin view of self-service organisations and requests
 */

router.use(authenticate, requireSuperAdmin);

router.get("/", OrganisationAdminController.getOrganisations);
router.get("/:id", OrganisationAdminController.getOrganisation);
router.get("/:id/stats", OrganisationAdminController.getOrganisationStats);

export default router;
