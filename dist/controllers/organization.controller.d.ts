import { Request, Response, NextFunction } from "express";
export declare class OrganizationController {
    static getOrganizations(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrganizationById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
    static suspendOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
    static activateOrganization(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=organization.controller.d.ts.map