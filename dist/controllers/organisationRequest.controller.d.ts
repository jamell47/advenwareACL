import { Response, NextFunction } from "express";
import { AuthenticatedOrganisationRequest } from "../middleware/organisationAuth";
export declare class OrganisationRequestController {
    static createRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static getRequests(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static getRequestById(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static updateRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static cancelRequest(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static getRequestStats(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=organisationRequest.controller.d.ts.map