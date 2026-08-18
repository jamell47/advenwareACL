"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.RegisterSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name must be at least 2 characters").max(50),
    middleName: zod_1.z.string().max(50).optional(),
    lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters").max(50),
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 characters")
        .max(20, "Phone number must not exceed 20 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    dateOfBirth: zod_1.z.coerce.date({
        required_error: "Date of birth is required",
        invalid_type_error: "Invalid date",
    }),
    nationality: zod_1.z.string().min(2, "Nationality is required").max(100),
    gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
    idNumber: zod_1.z.string().min(1, "ID/Passport number is required").max(50),
    idType: zod_1.z.nativeEnum(client_1.IDType),
    institution: zod_1.z.string().min(2, "Institution is required").max(200),
    course: zod_1.z.string().min(2, "Course is required").max(200),
    department: zod_1.z.string().max(200).optional(),
    currentYear: zod_1.z.string().max(50).optional(),
    studentRegistrationNumber: zod_1.z.string().max(50).optional(),
    expectedGraduation: zod_1.z.coerce.date().optional(),
    preferredStartDate: zod_1.z.coerce.date().optional(),
    preferredEndDate: zod_1.z.coerce.date().optional(),
    preferredLocation: zod_1.z.string().max(200).optional(),
    preferredIndustry: zod_1.z.string().max(200).optional(),
    preferredPlacementArea: zod_1.z.string().max(200).optional(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: zod_1.z.string().min(8),
    termsAccepted: zod_1.z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
});
exports.LoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});
//# sourceMappingURL=auth.schema.js.map