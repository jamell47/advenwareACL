"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationService = void 0;
const prisma_1 = require("../config/prisma");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const jwt_util_1 = require("../utils/jwt.util");
const errorHandler_1 = require("../middleware/errorHandler");
const storage_util_1 = require("../utils/storage.util");
const auditLog_service_1 = require("./auditLog.service");
const query_util_1 = require("../utils/query.util");
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
class OrganisationService {
    static TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
    static hashToken(token) {
        return crypto_1.default.createHash("sha256").update(token).digest("hex");
    }
    static async createRefreshToken(organisationId, refreshToken) {
        // Invalidate any previous refresh token for this organisation (single active
        // session). This guarantees the hash we store matches the token we return.
        await prisma_1.prisma.organisationRefreshToken.deleteMany({ where: { organisationId } });
        await prisma_1.prisma.organisationRefreshToken.create({
            data: {
                tokenHash: this.hashToken(refreshToken),
                organisationId,
                expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_MS),
            },
        });
    }
    static async register(data) {
        const existing = await prisma_1.prisma.organisation.findFirst({
            where: {
                OR: [
                    { phone: data.phone },
                    ...(data.email ? [{ email: data.email }] : []),
                ],
            },
            select: { id: true, phone: true, email: true },
        });
        if (existing) {
            if (existing.phone === data.phone) {
                throw new errorHandler_1.APIError("Phone number already registered", 409, "PHONE_EXISTS");
            }
            if (data.email && existing.email === data.email) {
                throw new errorHandler_1.APIError("Email already registered", 409, "EMAIL_EXISTS");
            }
        }
        const passwordHash = await bcrypt_util_1.BcryptUtil.hashPassword(data.password);
        const organisation = await prisma_1.prisma.organisation.create({
            data: {
                phone: data.phone,
                passwordHash,
                location: data.location || undefined,
                companyName: data.companyName || ` Organisation ${data.phone}`,
                email: data.email || `${data.phone}@temp.placeholder`,
                status: client_1.OrganizationStatus.ACTIVE,
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
        const accessToken = jwt_util_1.JwtUtil.generateAccessToken({
            userId: organisation.id,
            email: organisation.email ?? "",
            role: "ORGANISATION",
        });
        const refreshToken = jwt_util_1.JwtUtil.generateRefreshToken({
            userId: organisation.id,
            email: organisation.email ?? "",
            role: "ORGANISATION",
        });
        await this.createRefreshToken(organisation.id, refreshToken);
        await auditLog_service_1.AuditLogService.log("ORGANISATION_REGISTERED", undefined, "Organisation", organisation.id, `Organisation ${organisation.phone ?? organisation.id} registered`);
        return { organisation, accessToken, refreshToken };
    }
    static async login(data) {
        const where = { OR: [] };
        if (data.email)
            where.OR.push({ email: data.email });
        if (data.phone)
            where.OR.push({ phone: data.phone });
        const organisation = await prisma_1.prisma.organisation.findFirst({
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
            throw new errorHandler_1.APIError("Invalid email/phone or password", 401, "INVALID_CREDENTIALS");
        }
        if (organisation.status !== client_1.OrganizationStatus.ACTIVE) {
            throw new errorHandler_1.APIError("Organisation account is not active", 403, "ORGANISATION_NOT_ACTIVE");
        }
        const isPasswordValid = await bcrypt_util_1.BcryptUtil.comparePassword(data.password, organisation.passwordHash);
        if (!isPasswordValid) {
            throw new errorHandler_1.APIError("Invalid email/phone or password", 401, "INVALID_CREDENTIALS");
        }
        const accessToken = jwt_util_1.JwtUtil.generateAccessToken({
            userId: organisation.id,
            email: organisation.email ?? "",
            role: "ORGANISATION",
        });
        const refreshToken = jwt_util_1.JwtUtil.generateRefreshToken({
            userId: organisation.id,
            email: organisation.email ?? "",
            role: "ORGANISATION",
        });
        await this.createRefreshToken(organisation.id, refreshToken);
        await auditLog_service_1.AuditLogService.log("ORGANISATION_LOGIN", undefined, "Organisation", organisation.id, `Organisation ${organisation.phone ?? organisation.id} logged in`);
        return { organisation: this.format(organisation), accessToken, refreshToken };
    }
    static async refresh(refreshToken) {
        const decoded = jwt_util_1.JwtUtil.verifyRefreshToken(refreshToken);
        if (decoded.type !== "refresh" || decoded.role !== "ORGANISATION") {
            throw new errorHandler_1.APIError("Invalid token", 401, "INVALID_TOKEN");
        }
        const stored = await prisma_1.prisma.organisationRefreshToken.findUnique({
            where: { tokenHash: this.hashToken(refreshToken) },
            include: { organisation: true },
        });
        if (!stored || stored.revoked || stored.expiresAt < new Date()) {
            throw new errorHandler_1.APIError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
        }
        const accessToken = jwt_util_1.JwtUtil.generateAccessToken({
            userId: stored.organisation.id,
            email: stored.organisation.email ?? "",
            role: "ORGANISATION",
        });
        return { accessToken, organisation: this.format(stored.organisation) };
    }
    static async logout(refreshToken) {
        if (refreshToken) {
            await prisma_1.prisma.organisationRefreshToken.updateMany({
                where: { tokenHash: this.hashToken(refreshToken) },
                data: { revoked: true },
            });
        }
    }
    static async getMe(organisationId) {
        const organisation = await prisma_1.prisma.organisation.findUnique({
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
            throw new errorHandler_1.APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
        }
        return organisation;
    }
    static async updateMe(organisationId, data) {
        const existing = await prisma_1.prisma.organisation.findUnique({
            where: { id: organisationId },
            select: { id: true, email: true, phone: true },
        });
        if (!existing) {
            throw new errorHandler_1.APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
        }
        if (data.email) {
            const emailOwner = await prisma_1.prisma.organisation.findUnique({
                where: { email: data.email },
                select: { id: true },
            });
            if (emailOwner && emailOwner.id !== organisationId) {
                throw new errorHandler_1.APIError("Email already in use", 409, "EMAIL_EXISTS");
            }
        }
        if (data.phone) {
            const phoneOwner = await prisma_1.prisma.organisation.findUnique({
                where: { phone: data.phone },
                select: { id: true },
            });
            if (phoneOwner && phoneOwner.id !== organisationId) {
                throw new errorHandler_1.APIError("Phone number already in use", 409, "PHONE_EXISTS");
            }
        }
        const updated = await prisma_1.prisma.organisation.update({
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
        await auditLog_service_1.AuditLogService.log("ORGANISATION_PROFILE_UPDATED", undefined, "Organisation", organisationId, `Organisation ${updated.email} profile updated`);
        return updated;
    }
    static async uploadProfileImage(organisationId, file) {
        const organisation = await this.getMe(organisationId);
        if (!file) {
            throw new errorHandler_1.APIError("No file provided", 400, "NO_FILE");
        }
        if (organisation.profileImage) {
            await storage_util_1.StorageService.deleteFile(organisation.profileImage);
        }
        const folder = `organisations/${organisationId}`;
        const { url } = await storage_util_1.StorageService.uploadFile(file, folder);
        const updated = await prisma_1.prisma.organisation.update({
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
        await auditLog_service_1.AuditLogService.log("ORGANISATION_PROFILE_IMAGE_UPLOADED", undefined, "Organisation", organisationId, `Profile image updated for ${updated.email}`);
        return updated;
    }
    static async getOrganisations(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const cleanParams = (0, query_util_1.sanitizeQueryParams)(params);
        const where = {};
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
            prisma_1.prisma.organisation.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    _count: { select: { requests: true } },
                },
            }),
            prisma_1.prisma.organisation.count({ where }),
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
    static async getOrganisationById(orgId) {
        const org = await prisma_1.prisma.organisation.findUnique({
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
            throw new errorHandler_1.APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND");
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
    static format(org) {
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
exports.OrganisationService = OrganisationService;
//# sourceMappingURL=organisation.service.js.map