import { prisma } from "../config/prisma";
import { BcryptUtil } from "../utils/bcrypt.util";
import { JwtUtil } from "../utils/jwt.util";
import { APIError } from "../middleware/errorHandler";
import { UserRole, UserStatus } from "@prisma/client";

interface RegisterData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date;
  nationality: string;
  gender?: string;
  idType: string;
  idNumber: string;
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
  password: string;
  termsAccepted: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static generateAccessToken(userId: string, email: string, role: string): string {
    return JwtUtil.generateAccessToken({ userId, email, role });
  }

  private static generateRefreshToken(userId: string, email: string, role: string): string {
    return JwtUtil.generateRefreshToken({ userId, email, role });
  }

  static async register(data: RegisterData): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const existingUser = await prisma.user.findFirst({
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
        throw new APIError("Email already registered", 409, "EMAIL_EXISTS");
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        throw new APIError("Phone number already registered", 409, "PHONE_EXISTS");
      }
    }

    const passwordHash = await BcryptUtil.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        passwordHash,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: UserRole.STUDENT,
        status: UserStatus.PENDING_VERIFICATION,
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

    return { user, accessToken, refreshToken };
  }

  static async login(data: LoginData): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await prisma.user.findUnique({
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
      throw new APIError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
      throw new APIError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
    }

    const isPasswordValid = await BcryptUtil.comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new APIError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const accessToken = this.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.email, user.role);

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

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: any }> {
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    if (decoded.type !== "refresh") {
      throw new APIError("Invalid token type", 401, "INVALID_TOKEN_TYPE");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new APIError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
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

  static async logout(refreshToken: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!user) {
      return;
    }

    const resetToken = JwtUtil.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // In production, send this via email
    console.log(`Password reset link for ${user.firstName} ${user.lastName}: ${frontendUrl}/reset-password?token=${resetToken}`);
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = JwtUtil.verifyRefreshToken(token);

    if (decoded.type !== "refresh") {
      throw new APIError("Invalid token", 401, "INVALID_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new APIError("User not found", 404, "USER_NOT_FOUND");
    }

    const passwordHash = await BcryptUtil.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }
}
