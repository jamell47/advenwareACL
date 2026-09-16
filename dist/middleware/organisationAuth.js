"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateOrganisation = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const errorHandler_1 = require("./errorHandler");
const prisma_1 = require("../config/prisma");
const authenticateOrganisation = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new errorHandler_1.APIError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt_util_1.JwtUtil.verifyAccessToken(token);
        if (decoded.type !== "access") {
            return next(new errorHandler_1.APIError("Invalid token type", 401, "INVALID_TOKEN_TYPE"));
        }
        if (decoded.role !== "ORGANISATION") {
            return next(new errorHandler_1.APIError("Organisation access required", 403, "ORGANISATION_REQUIRED"));
        }
        const organisation = await prisma_1.prisma.organisation.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, companyName: true, status: true },
        });
        if (!organisation) {
            return next(new errorHandler_1.APIError("Organisation not found", 404, "ORGANISATION_NOT_FOUND"));
        }
        if (organisation.status !== "ACTIVE") {
            return next(new errorHandler_1.APIError("Organisation account is not active", 403, "ORGANISATION_NOT_ACTIVE"));
        }
        req.organisation = { id: organisation.id, email: organisation.email ?? "", role: "ORGANISATION" };
        next();
    }
    catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return next(new errorHandler_1.APIError("Invalid or expired access token", 401, "INVALID_TOKEN"));
        }
        return next(error);
    }
};
exports.authenticateOrganisation = authenticateOrganisation;
//# sourceMappingURL=organisationAuth.js.map