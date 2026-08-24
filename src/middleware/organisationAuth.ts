import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwt.util";
import { APIError } from "./errorHandler";
import { prisma } from "../config/prisma";

export interface AuthenticatedOrganisationRequest extends Request {
  organisation?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateOrganisation = async (
  req: AuthenticatedOrganisationRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new APIError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JwtUtil.verifyAccessToken(token);

    if (decoded.type !== "access") {
      return next(new APIError("Invalid token type", 401, "INVALID_TOKEN_TYPE"));
    }

    if (decoded.role !== "ORGANISATION") {
      return next(new APIError("Organisation access required", 403, "ORGANISATION_REQUIRED"));
    }

    const organisation = await prisma.organisation.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, companyName: true, status: true },
    });

    if (!organisation) {
      return next(new APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND"));
    }

    if (organisation.status !== "ACTIVE") {
      return next(new APIError("Organisation account is not active", 403, "ORGANISATION_NOT_ACTIVE"));
    }

    req.organisation = { id: organisation.id, email: organisation.email, role: "ORGANISATION" };
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new APIError("Invalid or expired access token", 401, "INVALID_TOKEN"));
    }
    return next(error);
  }
};
