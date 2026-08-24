import { z } from "zod";
import { OrganizationStatus, OrganisationRequestStatus, OrganisationRequestType } from "@prisma/client";

export const OrganisationRegisterSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(8),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type OrganisationRegisterInput = z.infer<typeof OrganisationRegisterSchema>;

export const OrganisationLoginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
  });

export type OrganisationLoginInput = z.infer<typeof OrganisationLoginSchema>;

export const OrganisationRefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type OrganisationRefreshInput = z.infer<typeof OrganisationRefreshSchema>;

export const OrganisationUpdateMeSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").max(20).optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export type OrganisationUpdateMeInput = z.infer<typeof OrganisationUpdateMeSchema>;

export const OrganisationRequestCreateSchema = z.object({
  requestType: z.nativeEnum(OrganisationRequestType),
  numberOfStudents: z.coerce.number().int().min(1, "Number of students must be at least 1"),
  course: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

export type OrganisationRequestCreateInput = z.infer<typeof OrganisationRequestCreateSchema>;

export const OrganisationRequestUpdateSchema = z.object({
  requestType: z.nativeEnum(OrganisationRequestType).optional(),
  numberOfStudents: z.coerce.number().int().min(1).optional(),
  course: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

export type OrganisationRequestUpdateInput = z.infer<typeof OrganisationRequestUpdateSchema>;

export const OrganisationRequestStatusSchema = z.object({
  status: z.nativeEnum(OrganisationRequestStatus),
  notes: z.string().max(500).optional(),
});

export type OrganisationRequestStatusInput = z.infer<typeof OrganisationRequestStatusSchema>;

export const OrganisationAdminSchema = z.object({
  companyName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.nativeEnum(OrganizationStatus).optional(),
});

export type OrganisationAdminInput = z.infer<typeof OrganisationAdminSchema>;
