"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationSchema = exports.CreateApplicationSchema = exports.UpdateEducationSchema = exports.CreateEducationSchema = exports.UpdateStudentProfileSchema = void 0;
const zod_1 = require("zod");
exports.UpdateStudentProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    middleName: zod_1.z.string().max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    phoneNumber: zod_1.z.string().min(10).max(20).optional(),
    dateOfBirth: zod_1.z.coerce.date().optional(),
    nationality: zod_1.z.string().max(100).optional(),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
    idNumber: zod_1.z.string().max(50).optional(),
    idType: zod_1.z.enum(["NATIONAL_ID", "PASSPORT"]).optional(),
    studentRegistrationNumber: zod_1.z.string().max(50).optional(),
    institution: zod_1.z.string().max(200).optional(),
    course: zod_1.z.string().max(200).optional(),
    department: zod_1.z.string().max(200).optional(),
    currentYear: zod_1.z.string().max(50).optional(),
    expectedGraduation: zod_1.z.coerce.date().optional(),
    preferredStartDate: zod_1.z.coerce.date().optional(),
    preferredEndDate: zod_1.z.coerce.date().optional(),
    preferredLocation: zod_1.z.string().max(200).optional(),
    preferredIndustry: zod_1.z.string().max(200).optional(),
    preferredPlacementArea: zod_1.z.string().max(200).optional(),
    profileCompleteness: zod_1.z.number().min(0).max(100).optional(),
});
exports.CreateEducationSchema = zod_1.z.object({
    institution: zod_1.z.string().min(2, "Institution is required"),
    course: zod_1.z.string().min(2, "Course is required"),
    department: zod_1.z.string().optional(),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
    gpa: zod_1.z.string().optional(),
    isCurrent: zod_1.z.boolean().optional(),
});
exports.UpdateEducationSchema = exports.CreateEducationSchema.partial();
exports.CreateApplicationSchema = zod_1.z.object({
    preferredStartDate: zod_1.z.coerce.date().optional(),
    preferredEndDate: zod_1.z.coerce.date().optional(),
    preferredLocation: zod_1.z.string().max(200).optional(),
    preferredIndustry: zod_1.z.string().max(200).optional(),
    preferredPlacementArea: zod_1.z.string().max(200).optional(),
    coverLetter: zod_1.z.string().max(5000).optional(),
});
exports.UpdateApplicationSchema = zod_1.z.object({
    status: zod_1.z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "SEARCHING", "MATCHED", "PLACEMENT_CONFIRMED", "CANCELLED"]).optional(),
    adminNotes: zod_1.z.string().max(5000).optional(),
});
//# sourceMappingURL=student.schema.js.map