import { Router } from "express";
import { CommissionController } from "../controllers/commission.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

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
  if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, CommissionController.getAllCommissions);

router.get("/:id", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE_ADMIN", "AGENT_MANAGER"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, CommissionController.getCommissionById);

router.post("/:id/approve", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, CommissionController.approveCommission);

router.post("/:id/eligible", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, CommissionController.markEligible);

export default router;
