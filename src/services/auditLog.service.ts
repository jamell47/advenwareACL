import { prisma } from "../config/prisma";

export class AuditLogService {
  static async log(
    action: string,
    userId?: string,
    entityType?: string,
    entityId?: string,
    message?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await prisma.auditLog.create({
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
