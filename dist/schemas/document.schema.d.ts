import { z } from "zod";
export declare const UploadDocumentSchema: z.ZodObject<{
    type: z.ZodNativeEnum<{
        NATIONAL_ID: "NATIONAL_ID";
        PASSPORT: "PASSPORT";
        STUDENT_ID: "STUDENT_ID";
        PASSPORT_PHOTO: "PASSPORT_PHOTO";
        ATTACHMENT_LETTER: "ATTACHMENT_LETTER";
        INTRODUCTION_LETTER: "INTRODUCTION_LETTER";
        CV: "CV";
        ACADEMIC_CERTIFICATE: "ACADEMIC_CERTIFICATE";
        TRANSCRIPT: "TRANSCRIPT";
        RECOMMENDATION_LETTER: "RECOMMENDATION_LETTER";
        OTHER_CERTIFICATE: "OTHER_CERTIFICATE";
        OTHER_DOCUMENT: "OTHER_DOCUMENT";
    }>;
    customTypeName: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "NATIONAL_ID" | "PASSPORT" | "STUDENT_ID" | "PASSPORT_PHOTO" | "ATTACHMENT_LETTER" | "INTRODUCTION_LETTER" | "CV" | "ACADEMIC_CERTIFICATE" | "TRANSCRIPT" | "RECOMMENDATION_LETTER" | "OTHER_CERTIFICATE" | "OTHER_DOCUMENT";
    customTypeName?: string | undefined;
    isRequired?: boolean | undefined;
}, {
    type: "NATIONAL_ID" | "PASSPORT" | "STUDENT_ID" | "PASSPORT_PHOTO" | "ATTACHMENT_LETTER" | "INTRODUCTION_LETTER" | "CV" | "ACADEMIC_CERTIFICATE" | "TRANSCRIPT" | "RECOMMENDATION_LETTER" | "OTHER_CERTIFICATE" | "OTHER_DOCUMENT";
    customTypeName?: string | undefined;
    isRequired?: boolean | undefined;
}>;
export declare const DocumentQueryParamsSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodNativeEnum<{
        NATIONAL_ID: "NATIONAL_ID";
        PASSPORT: "PASSPORT";
        STUDENT_ID: "STUDENT_ID";
        PASSPORT_PHOTO: "PASSPORT_PHOTO";
        ATTACHMENT_LETTER: "ATTACHMENT_LETTER";
        INTRODUCTION_LETTER: "INTRODUCTION_LETTER";
        CV: "CV";
        ACADEMIC_CERTIFICATE: "ACADEMIC_CERTIFICATE";
        TRANSCRIPT: "TRANSCRIPT";
        RECOMMENDATION_LETTER: "RECOMMENDATION_LETTER";
        OTHER_CERTIFICATE: "OTHER_CERTIFICATE";
        OTHER_DOCUMENT: "OTHER_DOCUMENT";
    }>>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        PENDING_REVIEW: "PENDING_REVIEW";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        REUPLOAD_REQUIRED: "REUPLOAD_REQUIRED";
    }>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: "APPROVED" | "REJECTED" | "PENDING_REVIEW" | "REUPLOAD_REQUIRED" | undefined;
    type?: "NATIONAL_ID" | "PASSPORT" | "STUDENT_ID" | "PASSPORT_PHOTO" | "ATTACHMENT_LETTER" | "INTRODUCTION_LETTER" | "CV" | "ACADEMIC_CERTIFICATE" | "TRANSCRIPT" | "RECOMMENDATION_LETTER" | "OTHER_CERTIFICATE" | "OTHER_DOCUMENT" | undefined;
}, {
    status?: "APPROVED" | "REJECTED" | "PENDING_REVIEW" | "REUPLOAD_REQUIRED" | undefined;
    type?: "NATIONAL_ID" | "PASSPORT" | "STUDENT_ID" | "PASSPORT_PHOTO" | "ATTACHMENT_LETTER" | "INTRODUCTION_LETTER" | "CV" | "ACADEMIC_CERTIFICATE" | "TRANSCRIPT" | "RECOMMENDATION_LETTER" | "OTHER_CERTIFICATE" | "OTHER_DOCUMENT" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
//# sourceMappingURL=document.schema.d.ts.map