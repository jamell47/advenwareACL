import { Router } from "express";
import { OrganisationAdminController } from "../controllers/organisationAdmin.controller";
import { authenticate } from "../middleware/auth";
import { requireSuperAdmin } from "../middleware/adminAuth";
import { validate } from "../middleware/validation";
import { OrganisationRequestStatusSchema } from "../schemas/organisation.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AdminOrganisationRequests
 *   description: Super Admin view of all organisation student requests
 */

router.use(authenticate, requireSuperAdmin);

router.get("/", OrganisationAdminController.getAllRequests);
router.get("/:id", OrganisationAdminController.getRequest);
router.patch("/:id/status", validate(OrganisationRequestStatusSchema), OrganisationAdminController.updateRequestStatus);

export default router;
