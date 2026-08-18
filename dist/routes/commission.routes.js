"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commission_controller_1 = require("../controllers/commission.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
/**
 * @swagger
 * tags:
 *   name: Commissions
 *   description: Commission management
 */
/**
 * @swagger
 * /commissions:
 *   get:
 *     summary: Get all commissions
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, commission_controller_1.CommissionController.getAllCommissions);
router.get("/:id", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, commission_controller_1.CommissionController.getCommissionById);
router.post("/:id/approve", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, commission_controller_1.CommissionController.approveCommission);
router.post("/:id/eligible", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, commission_controller_1.CommissionController.markEligible);
exports.default = router;
//# sourceMappingURL=commission.routes.js.map