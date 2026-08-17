import { APIError } from "../middleware/errorHandler";

export class ResponseUtil {
  static success<T>(data: T, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, statusCode = 400, code?: string) {
    const error = new APIError(message, statusCode, code);
    throw error;
  }

  static paginated<T>(data: T[], total: number, page: number, limit: number) {
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
