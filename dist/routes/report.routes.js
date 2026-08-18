"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report generation
 */
/**
 * @swagger
 * /reports/students:
 *   get:
 *     summary: Student registrations report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get("/students", (req, res, next) => {
    if (["SUPER_ADMIN", "PLACEMENT_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.studentRegistrations);
router.get("/agents", (req, res, next) => {
    if (["SUPER_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.agentPerformance);
router.get("/placements", (req, res, next) => {
    if (["SUPER_ADMIN", "PLACEMENT_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.placements);
router.get("/payments", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.payments);
router.get("/commissions", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.commissions);
router.get("/withdrawals", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.withdrawals);
router.get("/documents", (req, res, next) => {
    if (["SUPER_ADMIN", "DOCUMENT_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, report_controller_1.ReportController.documents);
exports.default = router;
//# sourceMappingURL=report.routes.js.map