import { Request, Response, NextFunction } from "express";
export interface AuthenticatedOrganisationRequest extends Request {
    organisation?: {
        id: string;
        email: string;
        role: string;
    };
}
export declare const authenticateOrganisation: (req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=organisationAuth.d.ts.map