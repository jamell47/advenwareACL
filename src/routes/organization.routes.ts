import { Router } from "express";
import { OrganizationController } from "../controllers/organization.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
 */

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.getOrganizations);

router.get("/:id", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.getOrganizationById);

router.post("/", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.createOrganization);

router.put("/:id", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.updateOrganization);

router.post("/:id/suspend", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.suspendOrganization);

router.post("/:id/activate", (req, res, next) => {
  if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, OrganizationController.activateOrganization);

export default router;
