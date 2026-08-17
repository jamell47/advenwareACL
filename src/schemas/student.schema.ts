import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const UpdateStudentProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().min(10).max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  idNumber: z.string().max(50).optional(),
  idType: z.enum(["NATIONAL_ID", "PASSPORT"]).optional(),
  studentRegistrationNumber: z.string().max(50).optional(),
  institution: z.string().max(200).optional(),
  course: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  currentYear: z.string().max(50).optional(),
  expectedGraduation: z.coerce.date().optional(),
  preferredStartDate: z.coerce.date().optional(),
  preferredEndDate: z.coerce.date().optional(),
  preferredLocation: z.string().max(200).optional(),
  preferredIndustry: z.string().max(200).optional(),
  preferredPlacementArea: z.string().max(200).optional(),
  profileCompleteness: z.number().min(0).max(100).optional(),
});

export const CreateEducationSchema = z.object({
  institution: z.string().min(2, "Institution is required"),
  course: z.string().min(2, "Course is required"),
  department: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  gpa: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

export const UpdateEducationSchema = CreateEducationSchema.partial();

export const CreateApplicationSchema = z.object({
  preferredStartDate: z.coerce.date().optional(),
  preferredEndDate: z.coerce.date().optional(),
  preferredLocation: z.string().max(200).optional(),
  preferredIndustry: z.string().max(200).optional(),
  preferredPlacementArea: z.string().max(200).optional(),
  coverLetter: z.string().max(5000).optional(),
});

export const UpdateApplicationSchema = z.object({
  status: z.enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "SEARCHING", "MATCHED", "PLACEMENT_CONFIRMED", "CANCELLED"]).optional(),
  adminNotes: z.string().max(5000).optional(),
});
