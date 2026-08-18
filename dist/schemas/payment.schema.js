"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackSchema = exports.STKPushSchema = void 0;
const zod_1 = require("zod");
exports.STKPushSchema = zod_1.z.object({
    phoneNumber: zod_1.z
        .string()
        .min(10, "Phone number is required")
        .max(15, "Phone number is too long"),
});
exports.CallbackSchema = zod_1.z.object({
    Body: zod_1.z.object({
        stkCallback: zod_1.z.object({
            checkoutRequestId: zod_1.z.string(),
            resultCode: zod_1.z.number(),
            resultDesc: zod_1.z.string(),
            callbackMetadata: zod_1.z
                .object({
                item: zod_1.z.array(zod_1.z.object({
                    name: zod_1.z.string(),
                    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.null()]),
                })),
            })
                .optional(),
        }),
    }),
});
//# sourceMappingURL=payment.schema.js.map