import { z } from "zod";
export declare const RegisterSchema: z.ZodObject<{
    firstName: z.ZodString;
    middleName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodString;
    phoneNumber: z.ZodString;
    email: z.ZodString;
    dateOfBirth: z.ZodDate;
    nationality: z.ZodString;
    gender: z.ZodOptional<z.ZodNativeEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
        OTHER: "OTHER";
        PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY";
    }>>;
    idNumber: z.ZodString;
    idType: z.ZodNativeEnum<{
        NATIONAL_ID: "NATIONAL_ID";
        PASSPORT: "PASSPORT";
    }>;
    institution: z.ZodString;
    course: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    currentYear: z.ZodOptional<z.ZodString>;
    studentRegistrationNumber: z.ZodOptional<z.ZodString>;
    expectedGraduation: z.ZodOptional<z.ZodDate>;
    preferredStartDate: z.ZodOptional<z.ZodDate>;
    preferredEndDate: z.ZodOptional<z.ZodDate>;
    preferredLocation: z.ZodOptional<z.ZodString>;
    preferredIndustry: z.ZodOptional<z.ZodString>;
    preferredPlacementArea: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    termsAccepted: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    idNumber: string;
    idType: "NATIONAL_ID" | "PASSPORT";
    institution: string;
    course: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    middleName?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | undefined;
    studentRegistrationNumber?: string | undefined;
    department?: string | undefined;
    currentYear?: string | undefined;
    expectedGraduation?: Date | undefined;
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
}, {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    idNumber: string;
    idType: "NATIONAL_ID" | "PASSPORT";
    institution: string;
    course: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
    middleName?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | undefined;
    studentRegistrationNumber?: string | undefined;
    department?: string | undefined;
    currentYear?: string | undefined;
    expectedGraduation?: Date | undefined;
    preferredStartDate?: Date | undefined;
    preferredEndDate?: Date | undefined;
    preferredLocation?: string | undefined;
    preferredIndustry?: string | undefined;
    preferredPlacementArea?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
    };
}, {
    body: {
        email: string;
        password: string;
    };
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
//# sourceMappingURL=auth.schema.d.ts.map