"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationAdminSchema = exports.OrganisationRequestStatusSchema = exports.OrganisationRequestUpdateSchema = exports.OrganisationRequestCreateSchema = exports.OrganisationUpdateMeSchema = exports.OrganisationRefreshSchema = exports.OrganisationLoginSchema = exports.OrganisationRegisterSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.OrganisationRegisterSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 characters").max(20),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128)
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    location: zod_1.z.string().max(200).optional(),
    companyName: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
});
exports.OrganisationLoginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email("Invalid email address").optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(1, "Password is required"),
})
    .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
});
exports.OrganisationRefreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
exports.OrganisationUpdateMeSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, "Company name must be at least 2 characters").max(100).optional(),
    email: zod_1.z.string().email("Invalid email address").optional(),
    phone: zod_1.z.string().min(10, "Phone number must be at least 10 characters").max(20).optional(),
    location: zod_1.z.string().max(200).optional(),
    industry: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
});
exports.OrganisationRequestCreateSchema = zod_1.z.object({
    requestType: zod_1.z.nativeEnum(client_1.OrganisationRequestType),
    numberOfStudents: zod_1.z.coerce.number().int().min(1, "Number of students must be at least 1"),
    course: zod_1.z.string().max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
});
exports.OrganisationRequestUpdateSchema = zod_1.z.object({
    requestType: zod_1.z.nativeEnum(client_1.OrganisationRequestType).optional(),
    numberOfStudents: zod_1.z.coerce.number().int().min(1).optional(),
    course: zod_1.z.string().max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
});
exports.OrganisationRequestStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrganisationRequestStatus),
    notes: zod_1.z.string().max(500).optional(),
});
exports.OrganisationAdminSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().max(20).optional(),
    location: zod_1.z.string().max(200).optional(),
    industry: zod_1.z.string().max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    status: zod_1.z.nativeEnum(client_1.OrganizationStatus).optional(),
});
//# sourceMappingURL=organisation.schema.js.map