import { z } from "zod";
export declare const CreateConversationSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["SUPPORT", "AGENT"]>>;
    subject: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "AGENT" | "SUPPORT";
    subject?: string | undefined;
}, {
    type?: "AGENT" | "SUPPORT" | undefined;
    subject?: string | undefined;
}>;
export declare const SendMessageSchema: z.ZodObject<{
    message: z.ZodString;
    attachmentUrl: z.ZodOptional<z.ZodString>;
    attachmentName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
}, {
    message: string;
    attachmentUrl?: string | undefined;
    attachmentName?: string | undefined;
}>;
//# sourceMappingURL=messaging.schema.d.ts.map