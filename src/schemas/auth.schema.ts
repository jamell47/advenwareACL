import { z } from "zod";
import { UserRole, Gender, IDType } from "@prisma/client";

export const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must not exceed 20 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date",
  }),
  nationality: z.string().min(2, "Nationality is required").max(100),
  gender: z.nativeEnum(Gender).optional(),
  idNumber: z.string().min(1, "ID/Passport number is required").max(50),
  idType: z.nativeEnum(IDType),
  institution: z.string().min(2, "Institution is required").max(200),
  course: z.string().min(2, "Course is required").max(200),
  department: z.string().max(200).optional(),
  currentYear: z.string().max(50).optional(),
  studentRegistrationNumber: z.string().max(50).optional(),
  expectedGraduation: z.coerce.date().optional(),
  preferredStartDate: z.coerce.date().optional(),
  preferredEndDate: z.coerce.date().optional(),
  preferredLocation: z.string().max(200).optional(),
  preferredIndustry: z.string().max(200).optional(),
  preferredPlacementArea: z.string().max(200).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(8),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
