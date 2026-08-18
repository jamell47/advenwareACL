declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    type: "access" | "refresh";
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=auth.interface.d.ts.map