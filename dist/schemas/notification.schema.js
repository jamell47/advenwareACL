"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueryParamsSchema = void 0;
const zod_1 = require("zod");
exports.NotificationQueryParamsSchema = zod_1.z.object({
    isRead: zod_1.z.enum(["true", "false"]).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
});
//# sourceMappingURL=notification.schema.js.map