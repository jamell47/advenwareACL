import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

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
  if (["SUPER_ADMIN", "PLACEMENT_ADMIN", "AGENT_MANAGER", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.studentRegistrations);

router.get("/agents", (req, res, next) => {
  if (["SUPER_ADMIN", "AGENT_MANAGER", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.agentPerformance);

router.get("/placements", (req, res, next) => {
  if (["SUPER_ADMIN", "PLACEMENT_ADMIN", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.placements);

router.get("/payments", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.payments);

router.get("/commissions", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "AGENT_MANAGER", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.commissions);

router.get("/withdrawals", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "AGENT_MANAGER", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.withdrawals);

router.get("/documents", (req, res, next) => {
  if (["SUPER_ADMIN", "DOCUMENT_ADMIN", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, ReportController.documents);

export default router;
