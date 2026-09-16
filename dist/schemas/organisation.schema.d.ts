import { z } from "zod";
export declare const OrganisationRegisterSchema: z.ZodObject<{
    phone: z.ZodString;
    password: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    phone: string;
    email?: string | undefined;
    location?: string | undefined;
    companyName?: string | undefined;
}, {
    password: string;
    phone: string;
    email?: string | undefined;
    location?: string | undefined;
    companyName?: string | undefined;
}>;
export type OrganisationRegisterInput = z.infer<typeof OrganisationRegisterSchema>;
export declare const OrganisationLoginSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export type OrganisationLoginInput = z.infer<typeof OrganisationLoginSchema>;
export declare const OrganisationRefreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type OrganisationRefreshInput = z.infer<typeof OrganisationRefreshSchema>;
export declare const OrganisationUpdateMeSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    location?: string | undefined;
    description?: string | undefined;
    phone?: string | undefined;
    industry?: string | undefined;
    companyName?: string | undefined;
}, {
    email?: string | undefined;
    location?: string | undefined;
    description?: string | undefined;
    phone?: string | undefined;
    industry?: string | undefined;
    companyName?: string | undefined;
}>;
export type OrganisationUpdateMeInput = z.infer<typeof OrganisationUpdateMeSchema>;
export declare const OrganisationRequestCreateSchema: z.ZodObject<{
    requestType: z.ZodNativeEnum<{
        ATTACHMENT: "ATTACHMENT";
        INTERNSHIP: "INTERNSHIP";
        JOB: "JOB";
    }>;
    numberOfStudents: z.ZodNumber;
    course: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    requestType: "ATTACHMENT" | "INTERNSHIP" | "JOB";
    numberOfStudents: number;
    course?: string | undefined;
    description?: string | undefined;
}, {
    requestType: "ATTACHMENT" | "INTERNSHIP" | "JOB";
    numberOfStudents: number;
    course?: string | undefined;
    description?: string | undefined;
}>;
export type OrganisationRequestCreateInput = z.infer<typeof OrganisationRequestCreateSchema>;
export declare const OrganisationRequestUpdateSchema: z.ZodObject<{
    requestType: z.ZodOptional<z.ZodNativeEnum<{
        ATTACHMENT: "ATTACHMENT";
        INTERNSHIP: "INTERNSHIP";
        JOB: "JOB";
    }>>;
    numberOfStudents: z.ZodOptional<z.ZodNumber>;
    course: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    course?: string | undefined;
    description?: string | undefined;
    requestType?: "ATTACHMENT" | "INTERNSHIP" | "JOB" | undefined;
    numberOfStudents?: number | undefined;
}, {
    course?: string | undefined;
    description?: string | undefined;
    requestType?: "ATTACHMENT" | "INTERNSHIP" | "JOB" | undefined;
    numberOfStudents?: number | undefined;
}>;
export type OrganisationRequestUpdateInput = z.infer<typeof OrganisationRequestUpdateSchema>;
export declare const OrganisationRequestStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        CANCELLED: "CANCELLED";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED" | "CANCELLED" | "PENDING" | "PROCESSING";
    notes?: string | undefined;
}, {
    status: "APPROVED" | "REJECTED" | "CANCELLED" | "PENDING" | "PROCESSING";
    notes?: string | undefined;
}>;
export type OrganisationRequestStatusInput = z.infer<typeof OrganisationRequestStatusSchema>;
export declare const OrganisationAdminSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        SUSPENDED: "SUSPENDED";
    }>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    location?: string | undefined;
    description?: string | undefined;
    phone?: string | undefined;
    industry?: string | undefined;
    companyName?: string | undefined;
}, {
    email?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    location?: string | undefined;
    description?: string | undefined;
    phone?: string | undefined;
    industry?: string | undefined;
    companyName?: string | undefined;
}>;
export type OrganisationAdminInput = z.infer<typeof OrganisationAdminSchema>;
//# sourceMappingURL=organisation.schema.d.ts.map