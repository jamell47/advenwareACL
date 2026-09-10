declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
            organisation?: {
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
    jti?: string;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=auth.interface.d.ts.map