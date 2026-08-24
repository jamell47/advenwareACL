import { Router } from "express";
import { OrganisationController } from "../controllers/organisation.controller";
import { validate } from "../middleware/validation";
import { authenticateOrganisation } from "../middleware/organisationAuth";
import { upload } from "../middleware/upload.middleware";
import {
  OrganisationRegisterSchema,
  OrganisationLoginSchema,
  OrganisationRefreshSchema,
  OrganisationUpdateMeSchema,
} from "../schemas/organisation.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Organisations
 *   description: Self-service organisation authentication & profile
 */

/** register/login/refresh/logout are public */
router.post("/register", validate(OrganisationRegisterSchema), OrganisationController.register);
router.post("/login", validate(OrganisationLoginSchema), OrganisationController.login);
router.post("/refresh", validate(OrganisationRefreshSchema), OrganisationController.refresh);
router.post("/logout", validate(OrganisationRefreshSchema), OrganisationController.logout);

/** everything below requires a valid organisation access token */
router.use(authenticateOrganisation);

router.get("/me", OrganisationController.getMe);
router.put("/me", validate(OrganisationUpdateMeSchema), OrganisationController.updateMe);
router.post("/me/profile-image", upload.single("profileImage"), OrganisationController.uploadProfileImage);

export default router;
