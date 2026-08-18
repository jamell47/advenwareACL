"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const prisma_1 = require("../config/prisma");
class AuditLogService {
    static async log(action, userId, entityType, entityId, message, metadata, ipAddress, userAgent) {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                message,
                metadata,
                ipAddress,
                userAgent,
            },
        });
    }
}
exports.AuditLogService = AuditLogService;
//# sourceMappingURL=auditLog.service.js.map