import { prisma } from "../config/prisma";
import { BcryptUtil } from "../utils/bcrypt.util";
import { JwtUtil } from "../utils/jwt.util";
import { APIError } from "../middleware/errorHandler";
import { StorageService } from "../utils/storage.util";
import { AuditLogService } from "./auditLog.service";
import { sanitizeQueryParams } from "../utils/query.util";
import { OrganizationStatus } from "@prisma/client";
import crypto from "crypto";

interface RegisterData {
  phone: string;
  password: string;
  location?: string;
}

interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export class OrganisationService {
  private static readonly TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

  private static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private static async createRefreshToken(organisationId: string, refreshToken: string): Promise<void> {
    // Invalidate any previous refresh token for this organisation (single active
    // session). This guarantees the hash we store matches the token we return.
    await prisma.organisationRefreshToken.deleteMany({ where: { organisationId } });
    await prisma.organisationRefreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        organisationId,
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_MS),
      },
    });
  }

  static async register(data: RegisterData): Promise<{ organisation: any; accessToken: string; refreshToken: string }> {
    const existing = await prisma.organisation.findUnique({
      where: { phone: data.phone },
      select: { id: true, phone: true },
    });

    if (existing) {
      throw new APIError("Phone number already registered", 409, "PHONE_EXISTS");
    }

    const passwordHash = await BcryptUtil.hashPassword(data.password);

    const organisation = await prisma.organisation.create({
      data: {
        phone: data.phone,
        passwordHash,
        location: data.location || undefined,
        status: OrganizationStatus.ACTIVE,
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accessToken = JwtUtil.generateAccessToken({
      userId: organisation.id,
      email: organisation.email ?? "",
      role: "ORGANISATION",
    });
    const refreshToken = JwtUtil.generateRefreshToken({
      userId: organisation.id,
      email: organisation.email ?? "",
      role: "ORGANISATION",
    });

    await this.createRefreshToken(organisation.id, refreshToken);

    await AuditLogService.log(
      "ORGANISATION_REGISTERED",
      undefined,
      "Organisation",
      organisation.id,
      `Organisation ${organisation.phone ?? organisation.id} registered`,
    );

    return { organisation, accessToken, refreshToken };
  }

  static async login(data: LoginData): Promise<{ organisation: any; accessToken: string; refreshToken: string }> {
    const where: any = { OR: [] };
    if (data.email) where.OR.push({ email: data.email });
    if (data.phone) where.OR.push({ phone: data.phone });

    const organisation = await prisma.organisation.findFirst({
      where,
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organisation) {
      throw new APIError("Invalid email/phone or password", 401, "INVALID_CREDENTIALS");
    }

    if (organisation.status !== OrganizationStatus.ACTIVE) {
      throw new APIError("Organisation account is not active", 403, "ORGANISATION_NOT_ACTIVE");
    }

    const isPasswordValid = await BcryptUtil.comparePassword(data.password, organisation.passwordHash);

    if (!isPasswordValid) {
      throw new APIError("Invalid email/phone or password", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = JwtUtil.generateAccessToken({
      userId: organisation.id,
      email: organisation.email ?? "",
      role: "ORGANISATION",
    });
    const refreshToken = JwtUtil.generateRefreshToken({
      userId: organisation.id,
      email: organisation.email ?? "",
      role: "ORGANISATION",
    });

    await this.createRefreshToken(organisation.id, refreshToken);

    await AuditLogService.log(
      "ORGANISATION_LOGIN",
      undefined,
      "Organisation",
      organisation.id,
      `Organisation ${organisation.phone ?? organisation.id} logged in`,
    );

    return { organisation: this.format(organisation), accessToken, refreshToken };
  }

  static async refresh(refreshToken: string): Promise<{ accessToken: string; organisation: any }> {
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    if (decoded.type !== "refresh" || decoded.role !== "ORGANISATION") {
      throw new APIError("Invalid token", 401, "INVALID_TOKEN");
    }

    const stored = await prisma.organisationRefreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { organisation: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new APIError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const accessToken = JwtUtil.generateAccessToken({
      userId: stored.organisation.id,
      email: stored.organisation.email ?? "",
      role: "ORGANISATION",
    });

    return { accessToken, organisation: this.format(stored.organisation) };
  }

  static async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await prisma.organisationRefreshToken.updateMany({
        where: { tokenHash: this.hashToken(refreshToken) },
        data: { revoked: true },
      });
    }
  }

  static async getMe(organisationId: string): Promise<any> {
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organisation) {
      throw new APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
    }

    return organisation;
  }

  static async updateMe(organisationId: string, data: Record<string, any>): Promise<any> {
    const existing = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { id: true, email: true, phone: true },
    });

    if (!existing) {
      throw new APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
    }

    if (data.email) {
      const emailOwner = await prisma.organisation.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (emailOwner && emailOwner.id !== organisationId) {
        throw new APIError("Email already in use", 409, "EMAIL_EXISTS");
      }
    }

    if (data.phone) {
      const phoneOwner = await prisma.organisation.findUnique({
        where: { phone: data.phone },
        select: { id: true },
      });
      if (phoneOwner && phoneOwner.id !== organisationId) {
        throw new APIError("Phone number already in use", 409, "PHONE_EXISTS");
      }
    }

    const updated = await prisma.organisation.update({
      where: { id: organisationId },
      data: {
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        industry: data.industry,
        description: data.description,
      },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditLogService.log(
      "ORGANISATION_PROFILE_UPDATED",
      undefined,
      "Organisation",
      organisationId,
      `Organisation ${updated.email} profile updated`,
    );

    return updated;
  }

  static async uploadProfileImage(organisationId: string, file: Express.Multer.File): Promise<any> {
    const organisation = await this.getMe(organisationId);

    if (!file) {
      throw new APIError("No file provided", 400, "NO_FILE");
    }

    if (organisation.profileImage) {
      await StorageService.deleteFile(organisation.profileImage);
    }

    const folder = `organisations/${organisationId}`;
    const { url } = await StorageService.uploadFile(file, folder);

    const updated = await prisma.organisation.update({
      where: { id: organisationId },
      data: { profileImage: url },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await AuditLogService.log(
      "ORGANISATION_PROFILE_IMAGE_UPLOADED",
      undefined,
      "Organisation",
      organisationId,
      `Profile image updated for ${updated.email}`,
    );

    return updated;
  }

  static async getOrganisations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ data: any[]; meta: any }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const cleanParams = sanitizeQueryParams(params);

    const where: any = {};
    if (cleanParams.search) {
      where.OR = [
        { companyName: { contains: cleanParams.search, mode: "insensitive" } },
        { email: { contains: cleanParams.search, mode: "insensitive" } },
        { phone: { contains: cleanParams.search, mode: "insensitive" } },
        { industry: { contains: cleanParams.search, mode: "insensitive" } },
      ];
    }
    if (cleanParams.status) {
      where.status = cleanParams.status;
    }

    const [organisations, total] = await Promise.all([
      prisma.organisation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { requests: true } },
        },
      }),
      prisma.organisation.count({ where }),
    ]);

    const formatted = organisations.map((org) => ({
      id: org.id,
      companyName: org.companyName,
      email: org.email,
      phone: org.phone,
      profileImage: org.profileImage,
      location: org.location,
      industry: org.industry,
      description: org.description,
      status: org.status,
      requestCount: org._count.requests,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }));

    return {
      data: formatted,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getOrganisationById(orgId: string): Promise<any> {
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        profileImage: true,
        location: true,
        industry: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { requests: true } },
        requests: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!org) {
      throw new APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
    }

    return {
      id: org.id,
      companyName: org.companyName,
      email: org.email,
      phone: org.phone,
      profileImage: org.profileImage,
      location: org.location,
      industry: org.industry,
      description: org.description,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      requestCount: org._count.requests,
      requests: org.requests.map((r) => ({
        id: r.id,
        requestType: r.requestType,
        numberOfStudents: r.numberOfStudents,
        course: r.course,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };
  }

  private static format(org: any) {
    return {
      id: org.id,
      companyName: org.companyName,
      email: org.email,
      phone: org.phone,
      profileImage: org.profileImage,
      location: org.location,
      industry: org.industry,
      description: org.description,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }
}
