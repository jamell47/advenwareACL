import { Request, Response, NextFunction } from "express";
import { AuthenticatedOrganisationRequest } from "../middleware/organisationAuth";
export declare class OrganisationController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getMe(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static updateMe(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
    static uploadProfileImage(req: AuthenticatedOrganisationRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=organisation.controller.d.ts.map