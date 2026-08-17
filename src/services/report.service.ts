import { prisma } from "../config/prisma";
import { PlacementStatus, CommissionStatus, WithdrawalStatus } from "@prisma/client";

export class ReportService {
  static async getStudentRegistrationsReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const where: any = { role: "STUDENT" };
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [total, byInstitution] = await Promise.all([
      prisma.user.count({ where }),
      prisma.studentProfile.groupBy({
        by: ["institution"],
        _count: { _all: true },
        where: params.startDate || params.endDate
          ? {
              createdAt: {
                ...(params.startDate && { gte: new Date(params.startDate) }),
                ...(params.endDate && { lte: new Date(params.endDate) }),
              },
            }
          : {},
      }),
    ]);

    const dateFilter = params.startDate || params.endDate ? {
      gte: params.startDate ? new Date(params.startDate) : undefined,
      lte: params.endDate ? new Date(params.endDate) : undefined,
    } : {};

    const whereClause = params.startDate || params.endDate
      ? `AND "createdAt" >= '${params.startDate}' AND "createdAt" <= '${params.endDate}'`
      : '';

    const byDay: any[] = await prisma.$queryRawUnsafe(`
      SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*)::int as count
      FROM "users"
      WHERE role = 'STUDENT'
      ${whereClause}
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    `);

    return {
      totalRegistrations: total,
      byInstitution: byInstitution.map((i) => ({ institution: i.institution, count: i._count._all })),
      byDay: byDay || [],
    };
  }

  static async getAgentPerformanceReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const agents = await prisma.user.findMany({
      where: { role: "AGENT", ...where },
      include: {
        students: true,
      },
    });

    const agentIds = agents.map((a) => a.id);

    const placementWhere: any = {
      userId: { in: agentIds.length > 0 ? agentIds : [], },
      status: { in: [PlacementStatus.CONFIRMED, "ACTIVE", "COMPLETED"] as any },
    };
    if (Object.keys(dateFilter).length > 0) {
      placementWhere.confirmedAt = dateFilter;
    }

    const placements = await prisma.placement.findMany({
      where: placementWhere,
    });

    const commissionWhere: any = { agentId: { in: agentIds.length > 0 ? agentIds : [] } };
    if (Object.keys(dateFilter).length > 0) {
      commissionWhere.createdAt = dateFilter;
    }

    const commissions = await prisma.commission.findMany({
      where: commissionWhere,
    });

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "SUCCESSFUL" },
      _sum: { amount: true },
    });

    const totalCommission = await prisma.commission.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    return {
      totalAgents: agents.length,
      totalStudentsRegistered: agents.reduce((sum, a) => sum + a.students.length, 0),
      successfulPlacements: placements.length,
      totalCommissions: commissions.length,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalCommissionPaid: totalCommission._sum.amount || 0,
      agents: agents.map((a) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`,
        email: a.email,
        studentsRegistered: a.students.length,
        commissions: commissions.filter((c) => c.agentId === a.id),
      })),
    };
  }

  static async getPlacementReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const placements = await prisma.placement.findMany({
      where,
    });

    const byStatus = placements.reduce(
      (acc: Record<string, number>, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {},
    );

    const byOrganization = await prisma.placement.groupBy({
      by: ["organizationName"],
      where,
      _count: { _all: true },
    });

    return {
      total: placements.length,
      byStatus,
      byOrganization: byOrganization.map((o) => ({        organization: o.organizationName,
        count: o._count._all,
      })),
    };
  }

  static async getPaymentReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const [byStatus, byMethod, totalAmount] = await Promise.all([
      prisma.payment.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["method"],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalAmount: totalAmount._sum.amount || 0,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
        amount: s._sum.amount || 0,
      })),
      byMethod: byMethod.map((m) => ({
        method: m.method,
        count: m._count._all,
        amount: m._sum.amount || 0,
      })),
    };
  }

  static async getCommissionReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const [byStatus, totalEligible, totalPaid] = await Promise.all([
      prisma.commission.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { ...where, status: CommissionStatus.ELIGIBLE },
        _sum: { amount: true },
      }),
      prisma.commission.aggregate({
        where: { ...where, status: CommissionStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalEligible: totalEligible._sum.amount || 0,
      totalPaid: totalPaid._sum.amount || 0,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
        amount: s._sum.amount || 0,
      })),
    };
  }

  static async getWithdrawalReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const [byStatus, totalAmount] = await Promise.all([
      prisma.withdrawal.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: { ...where, status: WithdrawalStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPaid: totalAmount._sum.amount || 0,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
        amount: s._sum.amount || 0,
      })),
    };
  }

  static async getDocumentReport(params: { startDate?: string; endDate?: string }): Promise<any> {
    const dateFilter: any = {};
    if (params.startDate) dateFilter.gte = new Date(params.startDate);
    if (params.endDate) dateFilter.lte = new Date(params.endDate);

    const where: any = {};
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const [byStatus, byType] = await Promise.all([
      prisma.document.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.document.groupBy({
        by: ["type"],
        where,
        _count: { _all: true },
      }),
    ]);

    return {
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      byType: byType.map((t) => ({ type: t.type, count: t._count._all })),
    };
  }
}

