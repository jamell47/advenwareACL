"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtil = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
class ResponseUtil {
    static success(data, message = "Success", statusCode = 200) {
        return {
            success: true,
            message,
            data,
        };
    }
    static error(message, statusCode = 400, code) {
        const error = new errorHandler_1.APIError(message, statusCode, code);
        throw error;
    }
    static paginated(data, total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            message: "Data retrieved successfully",
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
}
exports.ResponseUtil = ResponseUtil;
//# sourceMappingURL=response.util.js.map