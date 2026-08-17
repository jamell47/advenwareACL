import { prisma } from "../config/prisma";
import { APIError } from "../middleware/errorHandler";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";
import { UserRole, CommissionStatus, WithdrawalStatus, PlacementStatus } from "@prisma/client";
import { BcryptUtil } from "../utils/bcrypt.util";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totals?: Record<string, number>;
    [key: string]: any;
  };
}

export class AgentService {
  static async getAgentDashboard(agentId: string): Promise<any> {
    const agentStudentIds = (await prisma.user.findMany({ where: { agentId }, select: { id: true } })).map((u) => u.id);
    const [
      totalStudents,
      placedStudents,
      pendingStudents,
      eligibleCommission,
      paidCommission,
      availableBalance,
      pendingWithdrawal,
    ] = await Promise.all([
      prisma.user.count({ where: { agentId } }),
      prisma.placement.count({
        where: {
          userId: { in: agentStudentIds },
          status: { in: [PlacementStatus.CONFIRMED] },
        } as any,
      }),
      prisma.user.count({
        where: {
          agentId,
          placements: {
            none: {},
          },
        },
      }),
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { agentId, status: WithdrawalStatus.PENDING },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalStudents,
      placedStudents,
      pendingStudents,
      eligibleCommission: eligibleCommission._sum.amount || 0,
      paidCommission: paidCommission._sum.amount || 0,
      availableBalance: availableBalance._sum.amount || 0,
      pendingWithdrawal: pendingWithdrawal._sum.amount || 0,
    };
  }

  static async getAgents(params: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { role: UserRole.AGENT };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { phoneNumber: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          agentProfile: { include: { organization: true } },
          _count: {
            select: {
              students: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const agentIds = agents.map((a) => a.id);
    const placementCounts = await prisma.placement.groupBy({
      where: { userId: { in: agentIds.length > 0 ? agentIds : undefined } },
      by: ["userId"],
      _count: { _all: true },
    });

    const commissionsAgg = await prisma.commission.groupBy({
      where: { agentId: { in: agentIds.length > 0 ? agentIds : undefined } },
      by: ["agentId", "status"],
      _sum: { amount: true },
    });

    const formatted = agents.map((agent) => {
      const totalCommissions = commissionsAgg
        .filter((c) => c.agentId === agent.id && c.status === "PAID")
        .reduce((sum, c) => sum + (c._sum.amount || 0), 0);

      const eligibleCommissions = commissionsAgg
        .filter((c) => c.agentId === agent.id && c.status === "ELIGIBLE")
        .reduce((sum, c) => sum + (c._sum.amount || 0), 0);

      const paidCommissions = commissionsAgg
        .filter((c) => c.agentId === agent.id && c.status === "PAID")
        .reduce((sum, c) => sum + (c._sum.amount || 0), 0);

      return {
        id: agent.id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        phoneNumber: agent.phoneNumber,
        profileImage: agent.profileImage,
        role: agent.role,
        status: agent.status,
        isActive: agent.isActive,
        organization: agent.agentProfile?.organization
          ? {
              id: agent.agentProfile.organization.id,
              name: agent.agentProfile.organization.name,
            }
          : null,
        registrationDate: agent.agentProfile?.registrationDate,
        isApproved: agent.agentProfile?.isApproved,
        commissionRate: agent.agentProfile?.commissionRate,
        studentsRegistered: agent._count.students,
        placedStudents:
          placementCounts.find((p) => p.userId === agent.id)?._count._all || 0,
        totalCommissions,
        eligibleCommissions,
        paidCommissions,
        availableBalance: eligibleCommissions,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      };
    });

    return {
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getAgentById(agentId: string): Promise<any> {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      include: {
        agentProfile: { include: { organization: true } },
        students: {
          include: {
            studentProfile: true,
            placements: { include: { payment: true } },
          },
        },
        commissions: {
          include: { placement: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        },
        withdrawals: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!agent) {
      throw new APIError("Agent not found", 404, "AGENT_NOT_FOUND");
    }

    return {
      id: agent.id,
      email: agent.email,
      firstName: agent.firstName,
      lastName: agent.lastName,
      phoneNumber: agent.phoneNumber,
      profileImage: agent.profileImage,
      role: agent.role,
      status: agent.status,
      isActive: agent.isActive,
      organization: agent.agentProfile?.organization
        ? { id: agent.agentProfile.organization.id, name: agent.agentProfile.organization.name }
        : null,
      registrationDate: agent.agentProfile?.registrationDate,
      isApproved: agent.agentProfile?.isApproved,
      commissionRate: agent.agentProfile?.commissionRate,
      students: agent.students.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phoneNumber: s.phoneNumber,
        institution: s.studentProfile?.institution,
        course: s.studentProfile?.course,
        placements: s.placements,
      })),
      commissions: agent.commissions,
      withdrawals: agent.withdrawals,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }

  static async approveAgent(agentId: string): Promise<any> {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      include: { agentProfile: true },
    });

    if (!agent) {
      throw new APIError("Agent not found", 404, "AGENT_NOT_FOUND");
    }

    if (agent.role !== UserRole.AGENT) {
      throw new APIError("User is not an agent", 400, "INVALID_ROLE");
    }

    await prisma.agentProfile.upsert({
      where: { userId: agentId },
      update: { isApproved: true },
      create: { userId: agentId, isApproved: true },
    });

    await AuditLogService.log(
      "AGENT_APPROVED",
      undefined,
      "User",
      agentId,
      `Agent ${agent.email} approved`,
    );

    await NotificationService.createNotification({
      userId: agentId,
      type: "SYSTEM",
      title: "Agent Approved",
      message: "Your agent account has been approved. You can now start registering students.",
      data: { agentId },
    });

    return { id: agent.id, isApproved: true };
  }

  static async suspendAgent(agentId: string): Promise<any> {
    const agent = await prisma.user.update({
      where: { id: agentId },
      data: { status: "SUSPENDED", isActive: false },
    });

    await AuditLogService.log(
      "AGENT_SUSPENDED",
      undefined,
      "User",
      agentId,
      `Agent ${agent.email} suspended`,
    );

    await NotificationService.createNotification({
      userId: agentId,
      type: "SYSTEM",
      title: "Account Suspended",
      message: "Your agent account has been suspended.",
      data: { agentId },
    });

    return { id: agent.id, status: agent.status, isActive: agent.isActive };
  }

  static async activateAgent(agentId: string): Promise<any> {
    const agent = await prisma.user.update({
      where: { id: agentId },
      data: { status: "ACTIVE", isActive: true },
    });

    await AuditLogService.log(
      "AGENT_ACTIVATED",
      undefined,
      "User",
      agentId,
      `Agent ${agent.email} activated`,
    );

    return { id: agent.id, status: agent.status, isActive: agent.isActive };
  }

  static async getAgentStudents(agentId: string, params: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResult<any>> {
    const studentIds = await prisma.user.findMany({
      where: { agentId },
      select: { id: true },
    });

    const studentIdArray = studentIds.map((s) => s.id);

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      id: { in: studentIdArray.length > 0 ? studentIdArray : undefined },
    };

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: "insensitive" } },
        { lastName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          studentProfile: true,
          placements: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = students.map((s) => {
      const profile = s.studentProfile;
      const placement = s.placements?.[0];
      return {
        id: s.id,
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        phoneNumber: s.phoneNumber,
        institution: profile?.institution,
        course: profile?.course,
        applicationStatus: null,
        placementStatus: placement?.status,
        paymentStatus: null,
        commissionStatus: null,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    return {
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async registerStudentByAgent(agentId: string, data: any): Promise<any> {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { role: true, isActive: true, phoneNumber: true },
    });

    if (!agent || agent.role !== UserRole.AGENT) {
      throw new APIError("Agent not found or not authorized", 403, "NOT_AN_AGENT");
    }

    if (!agent.isActive) {
      throw new APIError("Agent account is inactive", 403, "AGENT_INACTIVE");
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }] },
      select: { id: true },
    });

    if (existingUser) {
      throw new APIError("Email or phone number already registered", 409, "USER_EXISTS");
    }

    const passwordHash = await BcryptUtil.hashPassword(data.password || "TempPass123!");

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: UserRole.STUDENT,
        status: "ACTIVE",
        isActive: true,
        agentId,
        studentProfile: {
          create: {
            institution: data.institution,
            course: data.course,
            department: data.department,
            studentRegistrationNumber: data.studentRegistrationNumber,
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            nationality: data.nationality,
            gender: data.gender,
            idNumber: data.idNumber,
            idType: data.idType,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditLogService.log(
      "STUDENT_REGISTERED_BY_AGENT",
      agentId,
      "User",
      user.id,
      `Student ${user.email} registered by agent ${agentId}`,
    );

    await NotificationService.createNotification({
      userId: user.id,
      type: "SYSTEM",
      title: "Account Created",
      message: `Your account was created by agent ${agentId}. You can now log in using your credentials.`,
      data: { userId: user.id, agentId },
    });

    return user;
  }

  static async getAgentCommissionHistory(agentId: string, params: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where: { agentId },
        include: { placement: { include: { user: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.commission.count({ where: { agentId } }),
    ]);

    const [eligible, paid] = await Promise.all([
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { agentId, status: CommissionStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      data: commissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        eligibleTotal: eligible._sum.amount || 0,
        paidTotal: paid._sum.amount || 0,
        availableBalance: eligible._sum.amount || 0,
      },
    };
  }

  static async getAgentWithdrawals(agentId: string, params: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { agentId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.withdrawal.count({ where: { agentId } }),
    ]);

    return {
      data: withdrawals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async requestWithdrawal(agentId: string, data: { amount: number; phone?: string; method?: string }): Promise<any> {
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { role: true, isActive: true, phoneNumber: true },
    });

    if (!agent || agent.role !== UserRole.AGENT) {
      throw new APIError("Agent not found or not authorized", 403, "NOT_AN_AGENT");
    }

    if (data.amount <= 0) {
      throw new APIError("Invalid withdrawal amount", 400, "INVALID_AMOUNT");
    }

    const eligible = await prisma.commission.aggregate({
      where: { agentId, status: CommissionStatus.ELIGIBLE },
      _sum: { amount: true },
    });

    const availableBalance = eligible._sum.amount || 0;

    if (data.amount > availableBalance) {
      throw new APIError(
        `Insufficient balance. Available: KSh ${availableBalance}`,
        400,
        "INSUFFICIENT_BALANCE",
      );
    }

    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: { agentId, status: WithdrawalStatus.PENDING },
    });

    if (pendingWithdrawal) {
      throw new APIError("You already have a pending withdrawal request", 400, "WITHDRAWAL_PENDING");
    }

    const settings = await prisma.systemSetting.findMany({
      where: { group: "withdrawal" },
    });

    const minWithdrawalSetting = settings.find((s) => s.key === "min_amount");
    const minWithdrawal = minWithdrawalSetting ? parseInt(minWithdrawalSetting.value, 10) : 100;

    if (data.amount < minWithdrawal) {
      throw new APIError(
        `Minimum withdrawal amount is KSh ${minWithdrawal}`,
        400,
        "BELOW_MINIMUM",
      );
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        agentId,
        amount: data.amount,
        currency: "KES",
        method: data.method || "BANK_TRANSFER",
        phone: data.phone || agent.phoneNumber,
        status: WithdrawalStatus.PENDING,
      },
    });

    await AuditLogService.log(
      "WITHDRAWAL_REQUESTED",
      agentId,
      "Withdrawal",
      withdrawal.id,
      `Agent ${agentId} requested KSh ${data.amount} withdrawal`,
    );

    await NotificationService.createNotification({
      userId: agentId,
      type: "SYSTEM",
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal request of KSh ${data.amount} has been submitted and is pending review.`,
      data: { withdrawalId: withdrawal.id, amount: data.amount },
    });

    return withdrawal;
  }

  static async createCommission(placementId: string, agentId: string, amount: number): Promise<any> {
    const commission = await prisma.commission.create({
      data: {
        placementId,
        agentId,
        amount,
        currency: "KES",
        status: CommissionStatus.PENDING,
      },
    });

    await AuditLogService.log(
      "COMMISSION_CREATED",
      undefined,
      "Commission",
      commission.id,
      `Commission of KSh ${amount} created for agent ${agentId} from placement ${placementId}`,
    );

    return commission;
  }
}
