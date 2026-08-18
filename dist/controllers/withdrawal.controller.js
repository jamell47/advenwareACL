"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalController = void 0;
const withdrawal_service_1 = require("../services/withdrawal.service");
const auditLog_service_1 = require("../services/auditLog.service");
const errorHandler_1 = require("../middleware/errorHandler");
class WithdrawalController {
    static async getAllWithdrawals(req, res, next) {
        try {
            const result = await withdrawal_service_1.WithdrawalService.getAllWithdrawals({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                status: req.query.status,
                agentId: req.query.agentId,
            });
            res.status(200).json({ success: true, message: "Withdrawals retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getWithdrawalById(req, res, next) {
        try {
            const withdrawal = await withdrawal_service_1.WithdrawalService.getWithdrawalById(req.params.id);
            res.status(200).json({ success: true, message: "Withdrawal retrieved", data: withdrawal });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveWithdrawal(req, res, next) {
        try {
            const withdrawal = await withdrawal_service_1.WithdrawalService.approveWithdrawal(req.params.id, req.user.id);
            await auditLog_service_1.AuditLogService.log("WITHDRAWAL_APPROVED", req.user.id, "Withdrawal", req.params.id, `Withdrawal of KSh ${withdrawal.amount} for agent ${withdrawal.agentId} approved`);
            res.status(200).json({ success: true, message: "Withdrawal approved", data: withdrawal });
        }
        catch (error) {
            next(error);
        }
    }
    static async rejectWithdrawal(req, res, next) {
        try {
            const { reason } = req.body;
            if (!reason) {
                throw new errorHandler_1.APIError("Rejection reason is required", 400, "REASON_REQUIRED");
            }
            const withdrawal = await withdrawal_service_1.WithdrawalService.rejectWithdrawal(req.params.id, req.user.id, reason);
            await auditLog_service_1.AuditLogService.log("WITHDRAWAL_REJECTED", req.user.id, "Withdrawal", req.params.id, `Withdrawal of KSh ${withdrawal.amount} rejected. Reason: ${reason}`);
            res.status(200).json({ success: true, message: "Withdrawal rejected", data: withdrawal });
        }
        catch (error) {
            next(error);
        }
    }
    static async processB2C(req, res, next) {
        try {
            const result = await withdrawal_service_1.WithdrawalService.processWithdrawalB2C(req.params.id, req.user.id);
            await auditLog_service_1.AuditLogService.log("B2C_PAYOUT_PROCESSED", req.user.id, "Withdrawal", req.params.id, `B2C payout processed for withdrawal ${req.params.id}`);
            res.status(200).json({ success: true, message: "B2C payout processed", data: result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WithdrawalController = WithdrawalController;
//# sourceMappingURL=withdrawal.controller.js.map