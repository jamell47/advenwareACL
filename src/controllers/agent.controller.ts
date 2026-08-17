import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AgentService } from "../services/agent.service";
import { AuditLogService } from "../services/auditLog.service";

export class AgentController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AgentService.getAgentDashboard(req.user!.id);
      res.status(200).json({ success: true, message: "Agent dashboard stats retrieved", data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.getAgents({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      });
      res.status(200).json({ success: true, message: "Agents retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getAgentById(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await AgentService.getAgentById(req.params.id);
      await AuditLogService.log("AGENT_VIEWED", req.user!.id, "User", req.params.id, `Agent ${req.params.id} viewed`);
      res.status(200).json({ success: true, message: "Agent retrieved", data: agent });
    } catch (error) {
      next(error);
    }
  }

  static async approveAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.approveAgent(req.params.id);
      await AuditLogService.log(
        "AGENT_APPROVED",
        req.user!.id,
        "User",
        req.params.id,
        `Agent ${req.params.id} approved by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Agent approved", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async suspendAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.suspendAgent(req.params.id);
      await AuditLogService.log(
        "AGENT_SUSPENDED",
        req.user!.id,
        "User",
        req.params.id,
        `Agent ${req.params.id} suspended by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Agent suspended", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async activateAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.activateAgent(req.params.id);
      await AuditLogService.log(
        "AGENT_ACTIVATED",
        req.user!.id,
        "User",
        req.params.id,
        `Agent ${req.params.id} activated by ${req.user!.email}`,
      );
      res.status(200).json({ success: true, message: "Agent activated", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMyStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.getAgentStudents(req.user!.id, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      });
      res.status(200).json({ success: true, message: "Agents students retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async registerStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await AgentService.registerStudentByAgent(req.user!.id, req.body);
      await AuditLogService.log(
        "STUDENT_REGISTERED_BY_AGENT",
        req.user!.id,
        "User",
        student.id,
        `Student ${student.email} registered by agent ${req.user!.email}`,
      );
      res.status(201).json({ success: true, message: "Student registered", data: student });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCommissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.getAgentCommissionHistory(req.user!.id, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      res.status(200).json({ success: true, message: "Commissions retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async getMyWithdrawals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.getAgentWithdrawals(req.user!.id, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });
      res.status(200).json({ success: true, message: "Withdrawals retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  static async requestWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const withdrawal = await AgentService.requestWithdrawal(req.user!.id, req.body);
      await AuditLogService.log(
        "WITHDRAWAL_REQUESTED",
        req.user!.id,
        "Withdrawal",
        withdrawal.id,
        `Withdrawal of KSh ${withdrawal.amount} requested by agent ${req.user!.email}`,
      );
      res.status(201).json({ success: true, message: "Withdrawal requested", data: withdrawal });
    } catch (error) {
      next(error);
    }
  }

  static async getMyStudentsForAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentService.getAgentStudents(req.user!.id, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      });
      res.status(200).json({ success: true, message: "Your students retrieved", data: result.data, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }
}
