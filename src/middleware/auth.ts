import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt.util";
import { APIError } from "./errorHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new APIError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(new APIError("Invalid or expired access token", 401, "INVALID_TOKEN"));
  }
};

export const authorize = (...allowedRoles: string[]) => {
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
