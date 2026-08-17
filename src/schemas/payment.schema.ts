import { z } from "zod";

export const STKPushSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number is required")
    .max(15, "Phone number is too long"),
});

export const CallbackSchema = z.object({
  Body: z.object({
    stkCallback: z.object({
      checkoutRequestId: z.string(),
      resultCode: z.number(),
      resultDesc: z.string(),
      callbackMetadata: z
        .object({
          item: z.array(
            z.object({
              name: z.string(),
              value: z.union([z.string(), z.number(), z.null()]),
            }),
          ),
        })
        .optional(),
    }),
  }),
});
