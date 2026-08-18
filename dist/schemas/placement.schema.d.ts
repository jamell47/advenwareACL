import { z } from "zod";
export declare const CreatePlacementSchema: z.ZodObject<{
    organizationName: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    positionTitle: z.ZodString;
    location: z.ZodString;
    supervisorName: z.ZodOptional<z.ZodString>;
    supervisorPhone: z.ZodOptional<z.ZodString>;
    supervisorEmail: z.ZodOptional<z.ZodString>;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    placementFee: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    startDate: Date;
    endDate: Date;
    organizationName: string;
    positionTitle: string;
    location: string;
    department?: string | undefined;
    supervisorName?: string | undefined;
    supervisorPhone?: string | undefined;
    supervisorEmail?: string | undefined;
    placementFee?: number | undefined;
}, {
    startDate: Date;
    endDate: Date;
    organizationName: string;
    positionTitle: string;
    location: string;
    department?: string | undefined;
    supervisorName?: string | undefined;
    supervisorPhone?: string | undefined;
    supervisorEmail?: string | undefined;
    placementFee?: number | undefined;
}>;
export declare const UpdatePlacementSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["SEARCHING", "MATCHED", "CONFIRMED", "REJECTED", "CANCELLED"]>>;
    organizationName: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    positionTitle: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    supervisorName: z.ZodOptional<z.ZodString>;
    supervisorPhone: z.ZodOptional<z.ZodString>;
    supervisorEmail: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status?: "REJECTED" | "SEARCHING" | "MATCHED" | "CANCELLED" | "CONFIRMED" | undefined;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    organizationName?: string | undefined;
    positionTitle?: string | undefined;
    location?: string | undefined;
    supervisorName?: string | undefined;
    supervisorPhone?: string | undefined;
    supervisorEmail?: string | undefined;
}, {
    status?: "REJECTED" | "SEARCHING" | "MATCHED" | "CANCELLED" | "CONFIRMED" | undefined;
    department?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    organizationName?: string | undefined;
    positionTitle?: string | undefined;
    location?: string | undefined;
    supervisorName?: string | undefined;
    supervisorPhone?: string | undefined;
    supervisorEmail?: string | undefined;
}>;
//# sourceMappingURL=placement.schema.d.ts.map