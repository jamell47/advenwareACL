import { z } from "zod";
export declare const UpdateStudentProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodDate>;
    nationality: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]>>;
    idNumber: z.ZodOptional<z.ZodString>;
    idType: z.ZodOptional<z.ZodEnum<["NATIONAL_ID", "PASSPORT"]>>;
    studentRegistrationNumber: z.ZodOptional<z.ZodString>;
    institution: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    currentYear: z.ZodOptional<z.ZodString>;
    expectedGraduation: z.ZodOptional<z.ZodDate>;
    preferredStartDate: z.ZodOptional<z.ZodDate>;
    preferredEndDate: z.ZodOptional<z.ZodDate>;
    preferredLocation: z.ZodOptional<z.ZodString>;
    preferredIndustry: z.ZodOptional<z.ZodString>;
    preferredPlacementArea: z.ZodOptional<z.ZodString>;
    profileCompleteness: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    phoneNumber?: string | undefined;
    firstName?: string | undefined;
    middleName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: Date | undefined;
    nationality?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | undefined;
    idNumber?: string | undefined;
    idType?: "NATIONAL_ID" | "PASSPORT" | undefined;
    studentRegistrationNumber?: string | undefined;
    institution?: string | undefined;
    course?: string | undefined;
    department?: string | undefined;
    currentYear?: string | undefined;
    expectedGraduation?: Date | undefined;
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
    profileCompleteness?: number | undefined;
}, {
    phoneNumber?: string | undefined;
    firstName?: string | undefined;
    middleName?: string | undefined;
    lastName?: string | undefined;
    dateOfBirth?: Date | undefined;
    nationality?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | undefined;
    idNumber?: string | undefined;
    idType?: "NATIONAL_ID" | "PASSPORT" | undefined;
    studentRegistrationNumber?: string | undefined;
    institution?: string | undefined;
    course?: string | undefined;
    department?: string | undefined;
    currentYear?: string | undefined;
    expectedGraduation?: Date | undefined;
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
    profileCompleteness?: number | undefined;
}>;
export declare const CreateEducationSchema: z.ZodObject<{
    institution: z.ZodString;
    course: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    gpa: z.ZodOptional<z.ZodString>;
    isCurrent: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    institution: string;
    course: string;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    gpa?: string | undefined;
    isCurrent?: boolean | undefined;
}, {
    institution: string;
    course: string;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    gpa?: string | undefined;
    isCurrent?: boolean | undefined;
}>;
export declare const UpdateEducationSchema: z.ZodObject<{
    institution: z.ZodOptional<z.ZodString>;
    course: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    endDate: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
    gpa: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isCurrent: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    institution?: string | undefined;
    course?: string | undefined;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    gpa?: string | undefined;
    isCurrent?: boolean | undefined;
}, {
    institution?: string | undefined;
    course?: string | undefined;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    gpa?: string | undefined;
    isCurrent?: boolean | undefined;
}>;
export declare const CreateApplicationSchema: z.ZodObject<{
    preferredStartDate: z.ZodOptional<z.ZodDate>;
    preferredEndDate: z.ZodOptional<z.ZodDate>;
    preferredLocation: z.ZodOptional<z.ZodString>;
    preferredIndustry: z.ZodOptional<z.ZodString>;
    preferredPlacementArea: z.ZodOptional<z.ZodString>;
    coverLetter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
    coverLetter?: string | undefined;
}, {
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
    coverLetter?: string | undefined;
}>;
export declare const UpdateApplicationSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED", "SEARCHING", "MATCHED", "PLACEMENT_CONFIRMED", "CANCELLED"]>>;
    adminNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SEARCHING" | "MATCHED" | "PLACEMENT_CONFIRMED" | "CANCELLED" | undefined;
    adminNotes?: string | undefined;
}, {
    status?: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SEARCHING" | "MATCHED" | "PLACEMENT_CONFIRMED" | "CANCELLED" | undefined;
    adminNotes?: string | undefined;
}>;
//# sourceMappingURL=student.schema.d.ts.map