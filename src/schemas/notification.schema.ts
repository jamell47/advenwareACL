import { z } from "zod";

export const NotificationQueryParamsSchema = z.object({
  isRead: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});
