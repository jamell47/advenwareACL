import { Request, Response, NextFunction } from "express";
import { PERMISSIONS, Permission } from "../utils/permissions";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare const requirePermission: (...requiredPermissions: Permission[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (...allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export { PERMISSIONS };
export type { Permission };
//# sourceMappingURL=adminAuth.d.ts.map