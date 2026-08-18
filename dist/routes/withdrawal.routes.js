"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const withdrawal_controller_1 = require("../controllers/withdrawal.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
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
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, withdrawal_controller_1.WithdrawalController.getAllWithdrawals);
router.get("/:id", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN", "AGENT_MANAGER"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, withdrawal_controller_1.WithdrawalController.getWithdrawalById);
router.post("/:id/approve", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, withdrawal_controller_1.WithdrawalController.approveWithdrawal);
router.post("/:id/reject", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, withdrawal_controller_1.WithdrawalController.rejectWithdrawal);
router.post("/:id/process-b2c", (req, res, next) => {
    if (["SUPER_ADMIN", "FINANCE_ADMIN"].includes(req.user.role))
        return next();
    res.status(403).json({ success: false, message: "Forbidden" });
}, withdrawal_controller_1.WithdrawalController.processB2C);
exports.default = router;
//# sourceMappingURL=withdrawal.routes.js.map