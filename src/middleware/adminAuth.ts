import { Request, Response, NextFunction } from "express";
import { APIError } from "./errorHandler";
import { PERMISSIONS, Permission, hasPermission } from "../utils/permissions";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new APIError("Authentication required", 401, "AUTH_REQUIRED"));
    }

    if (!req.user.role) {
      return next(new APIError("Role not found", 403, "ROLE_NOT_FOUND"));
    }

    for (const permission of requiredPermissions) {
      if (!hasPermission(req.user.role, permission)) {
        return next(new APIError("Insufficient permissions", 403, "FORBIDDEN"));
      }
    }

    next();
  };
};

export const requireAdmin = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new APIError("Authentication required", 401, "AUTH_REQUIRED"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new APIError("Insufficient permissions", 403, "FORBIDDEN"));
    }

    next();
  };
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new APIError("Authentication required", 401, "AUTH_REQUIRED"));
  }
  if (req.user.role !== "SUPER_ADMIN") {
    return next(new APIError("Super Admin access required", 403, "FORBIDDEN"));
  }
  next();
};

export { PERMISSIONS };
export type { Permission };
