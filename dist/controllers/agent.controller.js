"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
const auditLog_service_1 = require("../services/auditLog.service");
class AgentController {
    static async getDashboard(req, res, next) {
        try {
            const stats = await agent_service_1.AgentService.getAgentDashboard(req.user.id);
            res.status(200).json({ success: true, message: "Agent dashboard stats retrieved", data: stats });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAgents(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.getAgents({
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
            });
            res.status(200).json({ success: true, message: "Agents retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getAgentById(req, res, next) {
        try {
            const agent = await agent_service_1.AgentService.getAgentById(req.params.id);
            await auditLog_service_1.AuditLogService.log("AGENT_VIEWED", req.user.id, "User", req.params.id, `Agent ${req.params.id} viewed`);
            res.status(200).json({ success: true, message: "Agent retrieved", data: agent });
        }
        catch (error) {
            next(error);
        }
    }
    static async approveAgent(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.approveAgent(req.params.id);
            await auditLog_service_1.AuditLogService.log("AGENT_APPROVED", req.user.id, "User", req.params.id, `Agent ${req.params.id} approved by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Agent approved", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async suspendAgent(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.suspendAgent(req.params.id);
            await auditLog_service_1.AuditLogService.log("AGENT_SUSPENDED", req.user.id, "User", req.params.id, `Agent ${req.params.id} suspended by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Agent suspended", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async activateAgent(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.activateAgent(req.params.id);
            await auditLog_service_1.AuditLogService.log("AGENT_ACTIVATED", req.user.id, "User", req.params.id, `Agent ${req.params.id} activated by ${req.user.email}`);
            res.status(200).json({ success: true, message: "Agent activated", data: result });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyStudents(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.getAgentStudents(req.user.id, {
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
            });
            res.status(200).json({ success: true, message: "Agents students retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async registerStudent(req, res, next) {
        try {
            const student = await agent_service_1.AgentService.registerStudentByAgent(req.user.id, req.body);
            await auditLog_service_1.AuditLogService.log("STUDENT_REGISTERED_BY_AGENT", req.user.id, "User", student.id, `Student ${student.email} registered by agent ${req.user.email}`);
            res.status(201).json({ success: true, message: "Student registered", data: student });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyCommissions(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.getAgentCommissionHistory(req.user.id, {
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            });
            res.status(200).json({ success: true, message: "Commissions retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyWithdrawals(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.getAgentWithdrawals(req.user.id, {
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            });
            res.status(200).json({ success: true, message: "Withdrawals retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
    static async requestWithdrawal(req, res, next) {
        try {
            const withdrawal = await agent_service_1.AgentService.requestWithdrawal(req.user.id, req.body);
            await auditLog_service_1.AuditLogService.log("WITHDRAWAL_REQUESTED", req.user.id, "Withdrawal", withdrawal.id, `Withdrawal of KSh ${withdrawal.amount} requested by agent ${req.user.email}`);
            res.status(201).json({ success: true, message: "Withdrawal requested", data: withdrawal });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyStudentsForAgent(req, res, next) {
        try {
            const result = await agent_service_1.AgentService.getAgentStudents(req.user.id, {
                page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                search: req.query.search,
                status: req.query.status,
            });
            res.status(200).json({ success: true, message: "Your students retrieved", data: result.data, meta: result.meta });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AgentController = AgentController;
//# sourceMappingURL=agent.controller.js.map