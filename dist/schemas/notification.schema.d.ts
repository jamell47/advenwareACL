import { z } from "zod";
export declare const NotificationQueryParamsSchema: z.ZodObject<{
    isRead: z.ZodOptional<z.ZodEnum<["true", "false"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    isRead?: "true" | "false" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    isRead?: "true" | "false" | undefined;
}>;
//# sourceMappingURL=notification.schema.d.ts.map