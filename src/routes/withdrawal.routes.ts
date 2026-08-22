import { Router } from "express";
import { WithdrawalController } from "../controllers/withdrawal.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Withdrawals
 *   description: Withdrawal management
 */

/**
 * @swagger
 * /withdrawals:
 *   get:
 *     summary: Get all withdrawals
 *     tags: [Withdrawals]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, WithdrawalController.getAllWithdrawals);

router.get("/:id", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "AGENT_MANAGER", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, WithdrawalController.getWithdrawalById);

router.post("/:id/approve", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, WithdrawalController.approveWithdrawal);

router.post("/:id/reject", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, WithdrawalController.rejectWithdrawal);

router.post("/:id/process-b2c", (req, res, next) => {
  if (["SUPER_ADMIN", "FINANCE", "ADMIN"].includes(req.user!.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden" });
}, WithdrawalController.processB2C);

export default router;
