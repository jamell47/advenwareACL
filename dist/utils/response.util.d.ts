export declare class ResponseUtil {
    static success<T>(data: T, message?: string, statusCode?: number): {
        success: boolean;
        message: string;
        data: T;
    };
    static error(message: string, statusCode?: number, code?: string): void;
    static paginated<T>(data: T[], total: number, page: number, limit: number): {
        success: boolean;
        message: string;
        data: T[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}
//# sourceMappingURL=response.util.d.ts.map