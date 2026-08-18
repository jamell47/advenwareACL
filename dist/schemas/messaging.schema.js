"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageSchema = exports.CreateConversationSchema = void 0;
const zod_1 = require("zod");
exports.CreateConversationSchema = zod_1.z.object({
    type: zod_1.z.enum(["SUPPORT", "AGENT"]).default("SUPPORT"),
    subject: zod_1.z.string().max(200).optional(),
});
exports.SendMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, "Message is required").max(10000),
    attachmentUrl: zod_1.z.string().url("Invalid attachment URL").optional(),
    attachmentName: zod_1.z.string().max(500).optional(),
});
//# sourceMappingURL=messaging.schema.js.map