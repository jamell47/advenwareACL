import { Router } from "express";
import { OrganisationRequestController } from "../controllers/organisationRequest.controller";
import { authenticateOrganisation } from "../middleware/organisationAuth";
import { validate } from "../middleware/validation";
import {
  OrganisationRequestCreateSchema,
  OrganisationRequestUpdateSchema,
} from "../schemas/organisation.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OrganisationRequests
 *   description: Student requests submitted by organisations
 */

router.use(authenticateOrganisation);

router.get("/", OrganisationRequestController.getRequests);
router.post("/", validate(OrganisationRequestCreateSchema), OrganisationRequestController.createRequest);
router.get("/stats", OrganisationRequestController.getRequestStats);
router.get("/:id", OrganisationRequestController.getRequestById);
router.put("/:id", validate(OrganisationRequestUpdateSchema), OrganisationRequestController.updateRequest);
router.delete("/:id", OrganisationRequestController.cancelRequest);

export default router;
