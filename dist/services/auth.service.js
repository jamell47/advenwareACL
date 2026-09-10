"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const jwt_util_1 = require("../utils/jwt.util");
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("@prisma/client");
class AuthService {
    static async createRefreshToken(userId, refreshToken) {
        try {
            await prisma_1.prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
        }
        catch (error) {
            if (error.code === "P2002") {
                const newRefreshToken = jwt_util_1.JwtUtil.generateRefreshToken({
                    userId,
                    email: (await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true, role: true } })).email,
                    role: (await prisma_1.prisma.user.findUnique({ where: { id: userId }, select: { role: true } })).role,
                });
                await prisma_1.prisma.refreshToken.deleteMany({ where: { userId } });
                await prisma_1.prisma.refreshToken.create({
                    data: {
                        token: newRefreshToken,
                        userId,
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                });
            }
            else {
                throw error;
            }
        }
    }
    static generateAccessToken(userId, email, role) {
        return jwt_util_1.JwtUtil.generateAccessToken({ userId, email, role });
    }
    static generateRefreshToken(userId, email, role) {
        return jwt_util_1.JwtUtil.generateRefreshToken({ userId, email, role });
    }
    static async register(data) {
        const existingUser = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
            },
            select: {
                id: true,
                email: true,
                role: true,
                phoneNumber: true,
            },
        });
        if (existingUser) {
            if (existingUser.email === data.email) {
                throw new errorHandler_1.APIError("Email already registered", 409, "EMAIL_EXISTS");
            }
            if (existingUser.phoneNumber === data.phoneNumber) {
                throw new errorHandler_1.APIError("Phone number already registered", 409, "PHONE_EXISTS");
            }
        }
        const passwordHash = await bcrypt_util_1.BcryptUtil.hashPassword(data.password);
        const toDate = (value) => {
            if (!value)
                return undefined;
            if (value instanceof Date)
                return value;
            const date = new Date(value);
            return isNaN(date.getTime()) ? undefined : date;
        };
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                phoneNumber: data.phoneNumber,
                passwordHash,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                role: client_1.UserRole.STUDENT,
                status: client_1.UserStatus.PENDING_VERIFICATION,
                isActive: true,
                studentProfile: {
                    create: {
                        dateOfBirth: toDate(data.dateOfBirth) || undefined,
                        nationality: data.nationality || undefined,
                        gender: data.gender || undefined,
                        idNumber: data.idNumber || undefined,
                        idType: data.idType || undefined,
                        institution: data.institution || undefined,
                        course: data.course || undefined,
                        department: data.department || undefined,
                        currentYear: data.currentYear || undefined,
                        studentRegistrationNumber: data.studentRegistrationNumber || undefined,
                        expectedGraduation: toDate(data.expectedGraduation),
                        preferredStartDate: toDate(data.preferredStartDate),
                        preferredEndDate: toDate(data.preferredEndDate),
                        preferredLocation: data.preferredLocation || undefined,
                        preferredIndustry: data.preferredIndustry || undefined,
                        preferredPlacementArea: data.preferredPlacementArea || undefined,
                        profileCompleteness: 0,
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
                studentProfile: true,
            },
        });
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id, user.email, user.role);
        await this.createRefreshToken(user.id, refreshToken);
        return { user, accessToken, refreshToken };
    }
    static async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                passwordHash: true,
                role: true,
                status: true,
                isActive: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.APIError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }
        if (!user.isActive) {
            throw new errorHandler_1.APIError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
        }
        const isPasswordValid = await bcrypt_util_1.BcryptUtil.comparePassword(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new errorHandler_1.APIError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id, user.email, user.role);
        await this.createRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
            },
            accessToken,
            refreshToken,
        };
    }
    static async refreshToken(refreshToken) {
        const decoded = jwt_util_1.JwtUtil.verifyRefreshToken(refreshToken);
        if (decoded.type !== "refresh") {
            throw new errorHandler_1.APIError("Invalid token type", 401, "INVALID_TOKEN_TYPE");
        }
        const storedToken = await prisma_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
            throw new errorHandler_1.APIError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
        }
        const user = storedToken.user;
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
            },
        };
    }
    static async logout(refreshToken) {
        if (refreshToken) {
            await prisma_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revoked: true },
            });
        }
    }
    static async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, firstName: true, lastName: true, role: true },
        });
        if (!user) {
            return;
        }
        const resetToken = jwt_util_1.JwtUtil.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const frontendUrl = process.env.FRONTEND_URL || "https://advenware-ac-ladmin.vercel.app";
        // In production, send this via email
        console.log(`Password reset link for ${user.firstName} ${user.lastName}: ${frontendUrl}/reset-password?token=${resetToken}`);
    }
    static async resetPassword(token, newPassword) {
        const decoded = jwt_util_1.JwtUtil.verifyRefreshToken(token);
        if (decoded.type !== "refresh") {
            throw new errorHandler_1.APIError("Invalid token", 401, "INVALID_TOKEN");
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user) {
            throw new errorHandler_1.APIError("User not found", 404, "USER_NOT_FOUND");
        }
        const passwordHash = await bcrypt_util_1.BcryptUtil.hashPassword(newPassword);
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
    }
    static async getMe(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                agentProfile: { include: { organization: true } },
            },
        });
        if (!user) {
            throw new errorHandler_1.APIError("User not found", 404, "USER_NOT_FOUND");
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage,
            role: user.role,
            status: user.status,
            isActive: user.isActive,
            agentId: user.agentId,
            studentProfile: user.studentProfile,
            agentProfile: user.agentProfile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map