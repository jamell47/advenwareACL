"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_controller_1 = require("../controllers/organization.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
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
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.getOrganizations);
router.get("/:id", (req, res, next) => {
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.getOrganizationById);
router.post("/", (req, res, next) => {
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.createOrganization);
router.put("/:id", (req, res, next) => {
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.updateOrganization);
router.post("/:id/suspend", (req, res, next) => {
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.suspendOrganization);
router.post("/:id/activate", (req, res, next) => {
    if (["SUPER_ADMIN", "PARTNERSHIP_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, organization_controller_1.OrganizationController.activateOrganization);
exports.default = router;
//# sourceMappingURL=organization.routes.js.map