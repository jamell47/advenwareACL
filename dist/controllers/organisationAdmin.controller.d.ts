import { Request, Response, NextFunction } from "express";
export declare class OrganisationAdminController {
    static getOrganisations(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrganisation(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAllRequests(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getRequest(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrganisationStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=organisationAdmin.controller.d.ts.map