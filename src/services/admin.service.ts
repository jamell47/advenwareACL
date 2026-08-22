import { prisma } from "../config/prisma";
import { AuditLogService } from "./auditLog.service";
import { NotificationService } from "./notification.service";
import { APIError } from "../middleware/errorHandler";
import { UserRole, UserStatus, DocumentStatus, ApplicationStatus, PlacementStatus, PaymentStatus, CommissionStatus } from "@prisma/client";
import { BcryptUtil } from "../utils/bcrypt.util";
import { sanitizeQueryParams } from "../utils/query.util";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AdminService {
  static async getDashboardStats(): Promise<any> {
    const [
      totalStudents,
      totalAgents,
      totalAdmins,
      totalApplications,
      totalPlacements,
      successfulPlacements,
      pendingApplications,
      pendingDocuments,
      totalPayments,
      totalRevenue,
      eligibleCommissions,
      paidCommissions,
      pendingWithdrawals,
      totalOrganizations,
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.user.count({ where: { role: UserRole.AGENT } }),
      prisma.user.count({ where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.PLACEMENT_ADMIN, UserRole.DOCUMENT_ADMIN, UserRole.SUPPORT] } } }),
      prisma.attachmentApplication.count(),
      prisma.placement.count(),
      prisma.placement.count({ where: { status: PlacementStatus.CONFIRMED } }),
      prisma.attachmentApplication.count({ where: { status: { in: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.DRAFT] } } }),
      prisma.document.count({ where: { status: { in: [DocumentStatus.PENDING_REVIEW, DocumentStatus.REUPLOAD_REQUIRED] } } }),
      prisma.payment.count({ where: { status: PaymentStatus.SUCCESSFUL } }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESSFUL },
        _sum: { amount: true },
      }),
      prisma.commission.count({ where: { status: CommissionStatus.ELIGIBLE } }),
      prisma.commission.count({ where: { status: CommissionStatus.PAID } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.organization.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      totalStudents,
      totalAgents,
      totalAdmins,
      totalApplications,
      totalPlacements,
      successfulPlacements,
      pendingApplications,
      pendingDocuments,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      eligibleCommissions,
      paidCommissions,
      pendingWithdrawals,
      totalOrganizations,
    };
  }

  static async getDashboardCharts(): Promise<any> {
    const [
      usersByRole,
      commissionsByStatus,
      paymentsByStatus,
      studentsByMonthRaw,
      paidStudentsCount,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ["role"],
        _count: { id: true },
        where: { role: { in: [UserRole.STUDENT, UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.PLACEMENT_ADMIN, UserRole.DOCUMENT_ADMIN, UserRole.SUPPORT] } },
      }),
      prisma.commission.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.$queryRaw`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count
        FROM users
        WHERE role = 'STUDENT' AND createdAt >= DATE_FORMAT(NOW(), '%Y-01-01')
        GROUP BY month
        ORDER BY month ASC
      `,
      prisma.user.count({
        where: {
          role: UserRole.STUDENT,
          payments: { some: { status: "SUCCESSFUL", amount: { gte: 1500 } } },
        },
      }),
    ]);

    const studentsByMonth = (studentsByMonthRaw as any[]).map((item) => ({
      month: item.month,
      count: Number(item.count),
    }));

    return {
      usersByRole: usersByRole.map((item) => ({
        name: item.role,
        value: item._count.id,
      })),
      commissionsByStatus: commissionsByStatus.map((item) => ({
        name: item.status,
        value: item._sum.amount || 0,
        count: item._count.id,
      })),
      paymentsByStatus: paymentsByStatus.map((item) => ({
        name: item.status,
        value: item._sum.amount || 0,
        count: item._count.id,
      })),
      studentsByMonth,
      paidStudentsCount,
    };
  }

  static async getStudents(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    institution?: string;
    course?: string;
    agentId?: string;
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = {
      role: UserRole.STUDENT,
    };

    if (cleanParams.search) {
      where.OR = [
        { firstName: { contains: cleanParams.search, mode: "insensitive" } },
        { lastName: { contains: cleanParams.search, mode: "insensitive" } },
        { email: { contains: cleanParams.search, mode: "insensitive" } },
        { phoneNumber: { contains: cleanParams.search, mode: "insensitive" } },
      ];
    }

    if (cleanParams.status) {
      where.status = cleanParams.status;
    }

    if (cleanParams.institution) {
      where.studentProfile = {
        institution: { contains: cleanParams.institution, mode: "insensitive" },
      };
    }

    if (cleanParams.course) {
      where.studentProfile = {
        ...where.studentProfile,
        course: { contains: cleanParams.course, mode: "insensitive" },
      };
    }

    if (cleanParams.agentId) {
      where.agentId = cleanParams.agentId;
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          studentProfile: true,
          agent: { select: { id: true, firstName: true, lastName: true, email: true } },
          placements: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = students.map((s) => this.formatStudent(s));

    return {
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private static formatStudent(user: any) {
    const profile = user.studentProfile;
    const placement = user.placements?.[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      status: user.status,
      isActive: user.isActive,
      institution: profile?.institution,
      course: profile?.course,
      department: profile?.department,
      currentYear: profile?.currentYear,
      idNumber: profile?.idNumber,
      applicationStatus: placement?.status,
      placementStatus: placement?.status,
      agent: user.agent ? { id: user.agent.id, name: `${user.agent.firstName} ${user.agent.lastName}`, email: user.agent.email } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async getStudentById(studentId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: { educations: true },
        },
        placements: { include: { payment: true } },
        payments: true,
        documents: true,
        applications: true,
        agent: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
        auditLogs: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!user) {
      throw new APIError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      status: user.status,
      isActive: user.isActive,
      role: user.role,
      agent: user.agent ? { id: user.agent.id, name: `${user.agent.firstName} ${user.agent.lastName}`, email: user.agent.email } : null,
      profile: user.studentProfile
        ? {
            id: user.studentProfile.id,
            dateOfBirth: user.studentProfile.dateOfBirth,
            nationality: user.studentProfile.nationality,
            gender: user.studentProfile.gender,
            idNumber: user.studentProfile.idNumber,
            idType: user.studentProfile.idType,
            studentRegistrationNumber: user.studentProfile.studentRegistrationNumber,
            institution: user.studentProfile.institution,
            course: user.studentProfile.course,
            department: user.studentProfile.department,
            currentYear: user.studentProfile.currentYear,
            expectedGraduation: user.studentProfile.expectedGraduation,
            preferredStartDate: user.studentProfile.preferredStartDate,
            preferredEndDate: user.studentProfile.preferredEndDate,
            preferredLocation: user.studentProfile.preferredLocation,
            preferredIndustry: user.studentProfile.preferredIndustry,
            preferredPlacementArea: user.studentProfile.preferredPlacementArea,
            profileCompleteness: user.studentProfile.profileCompleteness,
            educations: user.studentProfile.educations,
            createdAt: user.studentProfile.createdAt,
            updatedAt: user.studentProfile.updatedAt,
          }
        : null,
      placements: user.placements,
      payments: user.payments,
      documents: user.documents,
      applications: user.applications,
      auditLogs: user.auditLogs,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async updateStudent(studentId: string, data: any): Promise<any> {
    const user = await prisma.user.update({
      where: { id: studentId },
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        status: data.status,
        isActive: data.isActive,
        studentProfile: data.profile
          ? {
              upsert: {
                where: { userId: studentId },
                update: data.profile,
                create: { userId: studentId, ...data.profile },
              },
            }
          : undefined,
      },
      include: { studentProfile: true },
    });

    await AuditLogService.log(
      "STUDENT_EDITED",
      undefined,
      "User",
      studentId,
      `Student ${user.email} profile updated by admin`,
      { changes: data },
    );

    return this.formatStudent(user);
  }

  static async suspendStudent(studentId: string): Promise<any> {
    const user = await prisma.user.update({
      where: { id: studentId },
      data: { status: UserStatus.SUSPENDED, isActive: false },
    });

    await AuditLogService.log(
      "STUDENT_SUSPENDED",
      undefined,
      "User",
      studentId,
      `Student ${user.email} suspended by admin`,
    );

    await NotificationService.createNotification({
      userId: studentId,
      type: "SYSTEM",
      title: "Account Suspended",
      message: "Your account has been suspended. Contact support for assistance.",
      data: { studentId },
    });

    return { id: user.id, status: user.status, isActive: user.isActive };
  }

  static async activateStudent(studentId: string): Promise<any> {
    const user = await prisma.user.update({
      where: { id: studentId },
      data: { status: UserStatus.ACTIVE, isActive: true },
    });

    await AuditLogService.log(
      "STUDENT_ACTIVATED",
      undefined,
      "User",
      studentId,
      `Student ${user.email} activated by admin`,
    );

    await NotificationService.createNotification({
      userId: studentId,
      type: "SYSTEM",
      title: "Account Activated",
      message: "Your account has been activated. You can now use all features.",
      data: { studentId },
    });

    return { id: user.id, status: user.status, isActive: user.isActive };
  }

  static async getAdmins(params: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.PLACEMENT_ADMIN, UserRole.DOCUMENT_ADMIN, UserRole.SUPPORT];
    const where: any = { role: { in: adminRoles } };

    if (cleanParams.search) {
      where.OR = [
        { firstName: { contains: cleanParams.search, mode: "insensitive" } },
        { lastName: { contains: cleanParams.search, mode: "insensitive" } },
        { email: { contains: cleanParams.search, mode: "insensitive" } },
      ];
    }

    if (cleanParams.status) {
      where.status = cleanParams.status;
    }

    const [admins, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          status: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: admins,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getRoles(): Promise<any[]> {
    return [
      { role: "SUPER_ADMIN", name: "Super Admin", description: "Full access to all features" },
      { role: "ADMIN", name: "Admin", description: "General administration" },
      { role: "PLACEMENT_ADMIN", name: "Operations Admin", description: "Manage placements and applications" },
      { role: "DOCUMENT_ADMIN", name: "Document Admin", description: "Review and manage documents" },
      { role: "FINANCE_ADMIN", name: "Finance Admin", description: "Manage payments, commissions, and withdrawals" },
      { role: "SUPPORT_ADMIN", name: "Support Admin", description: "Handle student and agent support" },
      { role: "AGENT_MANAGER", name: "Agent Manager", description: "Manage agents and their performance" },
      { role: "PARTNERSHIP_ADMIN", name: "Partnership Admin", description: "Manage organizations and partnerships" },
      { role: "AGENT", name: "Agent", description: "Register and manage students" },
      { role: "STUDENT", name: "Student", description: "Student user" },
    ];
  }

  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.userId) where.userId = params.userId;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async createAgent(data: {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    password: string;
    organizationId?: string;
    commissionRate?: number;
    createdBy: string;
  }): Promise<any> {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }].filter(Boolean) as any },
      select: { id: true, email: true, phoneNumber: true, role: true },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new APIError("Email already registered", 409, "EMAIL_EXISTS");
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        throw new APIError("Phone number already registered", 409, "PHONE_EXISTS");
      }
    }

    const passwordHash = await BcryptUtil.hashPassword(data.password);

    const agentProfileData: any = {
      isApproved: true,
      commissionRate: data.commissionRate || 500,
    };
    if (data.organizationId) {
      agentProfileData.organizationId = data.organizationId;
    }

    const agent = await prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
        isActive: true,
        agentProfile: {
          create: agentProfileData,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        agentProfile: true,
      },
    });

    await AuditLogService.log(
      "AGENT_CREATED",
      data.createdBy,
      "User",
      agent.id,
      `Agent ${agent.email} created by admin ${data.createdBy}`,
    );

    await NotificationService.createNotification({
      userId: agent.id,
      type: "SYSTEM",
      title: "Account Created",
      message: "Your agent account has been created. You can now log in.",
      data: { agentId: agent.id },
    });

    return agent;
  }

  static async createStudent(data: {
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    password: string;
    dateOfBirth: Date;
    nationality: string;
    gender?: string;
    idNumber: string;
    idType: string;
    institution: string;
    course: string;
    department?: string;
    currentYear?: string;
    studentRegistrationNumber?: string;
    expectedGraduation?: Date;
    preferredStartDate?: Date;
    preferredEndDate?: Date;
    preferredLocation?: string;
    preferredIndustry?: string;
    preferredPlacementArea?: string;
    agentId?: string;
    createdBy: string;
  }): Promise<any> {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }].filter(Boolean) as any },
      select: { id: true, email: true, phoneNumber: true, role: true },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new APIError("Email already registered", 409, "EMAIL_EXISTS");
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        throw new APIError("Phone number already registered", 409, "PHONE_EXISTS");
      }
    }

    const passwordHash = await BcryptUtil.hashPassword(data.password);

    const studentData: any = {
      email: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      isActive: true,
      studentProfile: {
        create: {
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          gender: data.gender as any,
          idNumber: data.idNumber,
          idType: data.idType as any,
          institution: data.institution,
          course: data.course,
          department: data.department,
          currentYear: data.currentYear,
          studentRegistrationNumber: data.studentRegistrationNumber,
          expectedGraduation: data.expectedGraduation,
          preferredStartDate: data.preferredStartDate,
          preferredEndDate: data.preferredEndDate,
          preferredLocation: data.preferredLocation,
          preferredIndustry: data.preferredIndustry,
          preferredPlacementArea: data.preferredPlacementArea,
          profileCompleteness: 100,
        },
      },
    };

    if (data.agentId) {
      studentData.agentId = data.agentId;
    }

    const student = await prisma.user.create({
      data: studentData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
        agentId: true,
        studentProfile: true,
      },
    });

    await AuditLogService.log(
      "STUDENT_CREATED",
      data.createdBy,
      "User",
      student.id,
      `Student ${student.email} created by admin ${data.createdBy}`,
    );

    await NotificationService.createNotification({
      userId: student.id,
      type: "SYSTEM",
      title: "Account Created",
      message: "Your student account has been created. You can now log in.",
      data: { studentId: student.id },
    });

    return student;
  }
}
