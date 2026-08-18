"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
class ReportController {
    static async studentRegistrations(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getStudentRegistrationsReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Student registrations report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async agentPerformance(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getAgentPerformanceReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Agent performance report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async placements(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getPlacementReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Placements report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async payments(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getPaymentReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Payments report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async commissions(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getCommissionReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Commissions report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async withdrawals(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getWithdrawalReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Withdrawals report", data });
        }
        catch (error) {
            next(error);
        }
    }
    static async documents(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getDocumentReport({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            });
            res.status(200).json({ success: true, message: "Documents report", data });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map