"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.ErrorHandler = exports.APIError = void 0;
class APIError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.APIError = APIError;
class ErrorHandler {
    static handle(error, req, res, next) {
        let err = { ...error };
        err.message = error.message;
        if (process.env.NODE_ENV === "development") {
            console.error(error);
        }
        if (error.name === "CastError") {
            const message = "Resource not found";
            err = new APIError(message, 404, "NOT_FOUND");
        }
        if (error.code === "P2000") {
            const message = "Data too long for column";
            err = new APIError(message, 400, "DATA_TOO_LONG");
        }
        if (error.code === "P2002") {
            const message = "Duplicate field value entered";
            err = new APIError(message, 409, "DUPLICATE_VALUE");
        }
        if (error.code === "P2025") {
            const message = "Record not found";
            err = new APIError(message, 404, "NOT_FOUND");
        }
        if (error.code === "P2003") {
            const message = "Foreign key constraint failed";
            err = new APIError(message, 400, "FOREIGN_KEY_ERROR");
        }
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map((val) => val.message).join(", ");
            err = new APIError(message, 400, "VALIDATION_ERROR");
        }
        if (error.name === "JsonWebTokenError") {
            const message = "Invalid token";
            err = new APIError(message, 401, "INVALID_TOKEN");
        }
        if (error.name === "TokenExpiredError") {
            const message = "Token expired";
            err = new APIError(message, 401, "TOKEN_EXPIRED");
        }
        if (error instanceof SyntaxError && "body" in error) {
            const message = "Invalid JSON payload";
            err = new APIError(message, 400, "INVALID_JSON");
        }
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Server Error",
            error: {
                code: err.code || "INTERNAL_SERVER_ERROR",
            },
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }
    static notFound(req, res, next) {
        const error = new APIError(`Not Found - ${req.originalUrl}`, 404, "NOT_FOUND");
        next(error);
    }
}
exports.ErrorHandler = ErrorHandler;
exports.errorHandler = ErrorHandler.handle.bind(ErrorHandler);
exports.notFound = ErrorHandler.notFound;
//# sourceMappingURL=errorHandler.js.map