export declare class APIError extends Error {
    statusCode: number;
    code?: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class ErrorHandler {
    static handle(error: any, req: any, res: any, next: any): void;
    static notFound(req: any, res: any, next: any): void;
}
export declare const errorHandler: typeof ErrorHandler.handle;
export declare const notFound: typeof ErrorHandler.notFound;
//# sourceMappingURL=errorHandler.d.ts.map