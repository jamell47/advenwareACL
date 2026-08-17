import { z } from "zod";

export const CreateConversationSchema = z.object({
  type: z.enum(["SUPPORT", "AGENT"]).default("SUPPORT"),
  subject: z.string().max(200).optional(),
});

export const SendMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(10000),
  attachmentUrl: z.string().url("Invalid attachment URL").optional(),
  attachmentName: z.string().max(500).optional(),
});
