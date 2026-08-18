import { Request, Response, NextFunction } from "express";
export declare class ApplicationController {
    static getMyApplication(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    static createApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateApplication(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminApplications(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAdminApplicationById(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=application.controller.d.ts.map