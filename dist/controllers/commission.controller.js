"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionController = void 0;
const commission_service_1 = require("../services/commission.service");
const auditLog_service_1 = require("../services/auditLog.service");
class CommissionController {
    static async getAllCommissions(req, res, next) {
        try {
            const result = await commission_service_1.CommissionService.getAllCommissions({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                status: req.query.status,
                agentId: req.query.agentId,
            });
            res.status(200).json({ success: true, message: "Commissions retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCommissionById(req, res, next) {
        try {
            const commission = await commission_service_1.CommissionService.getCommissionById(req.params.id);
            res.status(200).json({ success: true, message: "Commission retrieved", data: commission });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveCommission(req, res, next) {
        try {
            const commission = await commission_service_1.CommissionService.updateCommissionStatus(req.params.id, "PAID", req.body.paymentRef);
            await auditLog_service_1.AuditLogService.log("COMMISSION_APPROVED", req.user.id, "Commission", req.params.id, `Commission ${req.params.id} approved to PAID by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Commission approved", data: commission });
        }
        catch (error) {
            next(error);
        }
    }
    static async markEligible(req, res, next) {
        try {
            const commission = await commission_service_1.CommissionService.updateCommissionStatus(req.params.id, "ELIGIBLE");
            await auditLog_service_1.AuditLogService.log("COMMISSION_ELIGIBILITY_MARKED", req.user.id, "Commission", req.params.id, `Commission ${req.params.id} marked as ELIGIBLE by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Commission marked eligible", data: commission });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommissionController = CommissionController;
//# sourceMappingURL=commission.controller.js.map